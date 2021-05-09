const express = require("express");
let router = express.Router();

router.route("/").get((req, res) => {
  let dt, vehicle_id;
  const diagram_case = req.session.diagram_case;
  switch (diagram_case) {
    case "ev_energy":
      dt = req.session.ev_case1.dt;
      vehicle_id = req.session.ev_case1.vehicle_id;
      break;
    case "ev_cost":
      dt = req.session.ev_case2.dt;
      vehicle_id = req.session.ev_case2.vehicle_id;
      break;
    case "prov_energy":
      dt = req.session.prov_case.dt;
      break;
    default:
      console.log("Unexpected default switch case");
  }

  res.render("diagram", {
    diagram_case,
    dt,
    vehicle_id,
  });
});

module.exports = router;
