const express = require("express");
let router = express.Router();
const https = require("https");

const host = "localhost";
const API_PORT = 8765;

router
  .route("/")
  .get((req, res) => {
    if (!req.session.token) {
      req.session.login_error = "Please login first";
      res.redirect("../");
      return;
    }

    res.render("select-diagram", { warning: null });
  })
  .post((req, res) => {
    console.log(req.body);
    const {
      options: option,
      diagramId,
      "initial-date": initial_date,
      "final-date": final_date,
    } = req.body;

    const new_init = initial_date.replace(/[-]/g, "");
    const new_final = final_date.replace(/[-]/g, "");
    const options = {
      hostname: host,
      port: API_PORT,
      path: "/evcharge/api",
      method: "GET",
      headers: {
        "X-OBSERVATORY-AUTH": req.session.token,
      },
    };
    let chunks_1 = [];
    if (option === "option3") {
      const temp_options = options;
      temp_options.path += "/ProvidersInfo?format=json";
      const request_1 = https.request(temp_options, (response) => {
        console.log("Fetch data statusCode", response.statusCode);
        response
          .on("data", (d) => {
            chunks_1.push(d);
          })
          .on("end", () => {
            if (response.statusCode !== 200) {
              const warning = "No providers found";
              res.render("select-diagram", { warning });
              return;
            }
            let data = Buffer.concat(chunks_1);
            let schema = JSON.parse(data);
            console.log(schema);

            const [provider_ids, provider_names] = schema.reduce(
              ([a, b], x) => {
                a.push(x.provider_id);
                b.push(x.provider_name);
                return [a, b];
              },
              [[], []]
            );
            var completed_requests = 0;
            const provider_energy = [];
            //Loop through each provider request
            provider_ids.forEach((elem) => {
              const provider_url = `/SessionsPerProvider/${elem}/${new_init}/${new_final}?format=json`;
              options.path = "/evcharge/api" + provider_url;
              let chunks_2 = [];

              const request_2 = https.request(options, (response) => {
                console.log(
                  `Fetch data for provider ${elem} statusCode ${response.statusCode}`
                );
                response
                  .on("data", (d) => {
                    chunks_2.push(d);
                  })
                  .on("end", () => {
                    let data = Buffer.concat(chunks_2);
                    if (response.statusCode == 200) {
                      let schema = JSON.parse(data);
                      const total_energy = schema.reduce((a, x) => {
                        return a + x.EnergyDelivered;
                      }, 0);
                      provider_energy[elem - 1] = total_energy;
                    } else {
                      //If no data
                      provider_energy[elem - 1] = 0;
                    }
                    if (completed_requests++ == provider_ids.length - 1) {
                      console.log("All provider requests are completed ");
                      const rounded_prov_energ = provider_energy.map((x) =>
                        Number(x).toFixed(3)
                      );
                      req.session.prov_case = {
                        dt: [provider_names, rounded_prov_energ],
                      };
                      console.log(
                        "providers [[energy], [providers]]",
                        req.session.prov_case.dt
                      );
                      req.session.diagram_case = "prov_energy";
                      res.redirect("../diagram");
                    }
                  });
              });
              request_2.on("error", (e) => {
                console.error(e);
                const warning = "Please try again";
                res.render("select-diagram", { warning });
              });
              request_2.end();

              /********* Outer request ended  ******* */
            });
          });
      });
      request_1.on("error", (e) => {
        console.error(e);
        const warning = "Please try again";
        res.render("select-diagram", { warning });
      });
      request_1.end();
      /*********************** */
    } else {
      //Option 1 or 2, same API-CALL
      let chunks = [];
      const ev_url = `/SessionsPerEV/${diagramId}/${new_init}/${new_final}?format=json`;
      options.path += ev_url;
      const request = https.request(options, (response) => {
        console.log("Fetch data statusCode", response.statusCode);
        response
          .on("data", (d) => {
            chunks.push(d);
          })
          .on("end", () => {
            // If no data
            if (response.statusCode !== 200) {
              //categorize error codes
              const warning = "No data for selected ID or dates";
              res.render("select-diagram", { warning });
              return;
            }
            let data = Buffer.concat(chunks);
            let json_response = JSON.parse(data);
            if (option === "option1") {
              let dt = [["Day", "Energy (kWh)"]];
              var sessions = json_response.VehicleChargingSessionsList;
              var sess;
              for (sess of sessions) {
                dt.push([sess.StartedOn.split(" ")[0], sess.EnergyDelivered]);
              }
              req.session.ev_case1 = {
                dt: dt,
                vehicle_id: diagramId,
              };
              req.session.diagram_case = "ev_energy";
            } else {
              //Option 2 here... process data received
              console.log(json_response);
              const sessions = json_response.VehicleChargingSessionsList;
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              months_cost = {};

              sessions.forEach((element) => {
                const dt = new Date(element.StartedOn);
                const date_key = `${months[dt.getMonth()]} ${dt.getFullYear()}`;
                if (!months_cost[date_key]) {
                  months_cost[date_key] = parseFloat(element.SessionCost);
                } else {
                  months_cost[date_key] += parseFloat(element.SessionCost);
                }
              });
              // Obtain y and x axis arrays
              const [vars, vals] = Object.keys(months_cost).reduce(
                ([a, b], k) => {
                  a.push(k);
                  b.push(months_cost[k].toFixed(2));
                  return [a, b];
                },
                [[], []]
              );

              req.session.ev_case2 = {
                dt: [vars, vals],
                vehicle_id: diagramId,
              };
              req.session.diagram_case = "ev_cost";
            }
            res.redirect("../diagram");
          });
      });
      request.on("error", (e) => {
        console.error(e);
      });
      request.end();
    }
  });

module.exports = router;
