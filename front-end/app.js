const express = require("express");
const path = require("path");
const https = require("https");
const querystring = require("querystring");
const Readable = require("stream").Readable;
const FormData = require("form-data");
const session = require("express-session");
const global_const = require("./constants.js");

const homepage = require("./routes/homepage");
const selectDiagram = require("./routes/select-diagram");
const charging = require("./routes/charging");
const payment = require("./routes/payment");
const diagram = require("./routes/diagram");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const app = express();

// register view engine
app.set("view engine", "ejs");

// parse application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

const PORT = process.env.PORT || 5000;
const API_PORT = 8765;
const host = "localhost";

//set static folder
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "mouse cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/homepage", homepage);
app.use("/select-diagram", selectDiagram);
app.use("/charging", charging);
app.use("/payment", payment);
app.use("/diagram", diagram);

app
  .route("/")
  .get((req, res) => {
    const warning = req.session.login_error;
    res.render("index", {
      warning,
    });
    req.session.login_error = null;
  })
  .post((req, res) => {
    const postData = querystring.stringify({
      username: req.body.username,
      password: req.body.passw,
    });

    const options = {
      hostname: host,
      port: API_PORT,
      path: "/evcharge/api/login",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    };

    const request = https.request(options, (response) => {
      console.log(
        `Login attempt:${req.body.username} --> statusCode ${response.statusCode}`
      );
      response.on("data", (d) => {
        data_res = d.toString("utf8");

        if (response.statusCode !== 200) {
          console.log("login error:", data_res);
          req.session.login_error = data_res;
          const warning = req.session.login_error;
          res.render("index", {
            warning,
          });
          return;
        }

        req.session.logged_username = req.body.username;
        const token = JSON.parse(data_res).token;
        req.session.token = token;
        req.session.fullCap = global_const.FULL_CAPACITY; //70
        req.session.batteryState = global_const.INIT_BATTERY; //14
        //Keep dictionary backup cause of AJAX-session
        // battery_states[token] = global_const.INIT_BATTERY;
        res.redirect("/homepage");
      });
    });

    request.on("error", (e) => {
      console.error(e);
    });

    request.write(postData);
    request.end();
  });

app.post("/logout", (req, res) => {
  const options = {
    hostname: host,
    port: API_PORT,
    path: "/evcharge/api/logout",
    method: "POST",
    headers: {
      "X-OBSERVATORY-AUTH": req.session.token,
    },
  };

  const request = https.request(options, (response) => {
    console.log("Logout statusCode", response.statusCode);
    response.on("data", (d) => {
      data_res = d.toString("utf8");
      console.log(`Logout response: ${data_res}`);

      if (response.statusCode !== 200) {
        res.redirect("/homepage");
        return;
      }
      console.log(`${req.session.logged_username} logged out`);

      req.session.destroy();
      res.redirect("/");
    });
  });

  request.on("error", (e) => {
    console.error(e);
  });
  request.end();
});

app.get("/stations", (req, res) => {
  res.render("stations");
});

app.get("/pricing", (req, res) => {
  res.render("pricing");
});

var fs = require("fs");
var http = require("http");
var privateKey = fs.readFileSync("sslcert/server.key", "utf-8");
var certificate = fs.readFileSync("sslcert/server.cer", "utf-8");
var credentials = { key: privateKey, cert: certificate };

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(PORT, () => {
  console.log(`WebApp listening at http://localhost:${PORT}...`);
});

/*

app.listen(PORT, () => {
    console.log(`WebApp listening at http://localhost:${PORT}...`);
});

*/
