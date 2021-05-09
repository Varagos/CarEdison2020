const express = require("express");
let router = express.Router();

router
  .route("/")
  .get((req, res) => {
    if (!req.session.token) {
      req.session.login_error = "Please login first";
      res.redirect("../");
      return;
    }
    const description = req.session.description;
    const total_minutes = req.session.total_minutes;
    const battery_percentage = [
      (req.session.batteryState / req.session.fullCap) * 100,
    ];

    res.render("charging", {
      description,
      total_minutes,
      battery_percentage,
    });
  })
  .post((req, res) => {
    console.log("/charging ajax received");
    res.sendStatus(200);

    req.session.batteryState += parseFloat(req.body.energy);
    battery_states[req.session.token] += parseFloat(req.body.energy);

    req.body.energy = parseFloat(req.body.energy);
    let extra_properties = {
      point_id: 314,
      vehicle_id: 40,
      payment_id: req.session.paymentId,
      pricing_id: req.session.pricingId,
    };
    let obj = req.body;
    Object.assign(obj, extra_properties);

    //json to csv
    const items = [obj];
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    const csv = [
      header.join(","), // header row first
      ...items.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      ),
    ].join("\r\n");

    new_csv = csv.replace(/["]/g, "'");
    console.log("sending csv...\n", new_csv, "\n");

    const readable = new Readable();
    readable._read = () => {};
    readable.push(new_csv);
    readable.push(null);

    //const fileStream = fs.createReadStream('./temppp.csv');
    const formData = new FormData();
    //formData.append('file', fileStream);
    formData.append("file", readable, {
      filename: "sessions.csv",
      contentType: "text/csv",
    });
    const options = {
      hostname: host,
      port: API_PORT,
      path: "/evcharge/api/admin/system/sessionsupd",
      protocol: "https:",
      method: "POST",
      headers: {
        "X-OBSERVATORY-AUTH": req.session.token,
      },
    };
    (async function () {
      try {
        const response = await makeRequest(formData, options);
        console.log(response);
      } catch (error) {
        console.log("Error uploading file, validate admin role");
        console.log(error);
      }
    })();
  });

// abstract and promisify actual network request
async function makeRequest(formData, options) {
  return new Promise((resolve, reject) => {
    const req = formData.submit(options, (err, res) => {
      if (err) {
        return reject(new Error(err.message));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => {
        const resString = Buffer.concat(body).toString();
        resolve(resString);
      });
    });
  });
}

module.exports = router;
