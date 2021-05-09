const express = require("express");
let router = express.Router();
const global_const = require("../constants");

router
  .route("/")
  .get((req, res) => {
    if (!req.session.token) {
      req.session.login_error = "Please login first";
      res.redirect("../");
      return;
    }
    const full_cap = req.session.fullCap;
    let battery_state = 0; //battery_states[req.session.token];
    res.render("payment", {
      full_cap,
      battery_state,
    });
  })
  .post((req, res) => {
    console.log(req.session.logged_username, req.body);
    const battery_to_fill = req.session.fullCap - req.session.batteryState;
    const slow_kwh = global_const.SLOW_KWH,
      normal_kwh = global_const.NORMAL_KWH,
      fast_kwh = global_const.FAST_KWH;
    switch (req.body.radio1) {
      case "slow": {
        const charg_minutes = (battery_to_fill * 60) / slow_kwh;
        req.session.description = "Slow charging";
        req.session.total_minutes = charg_minutes;
        req.session.pricingId = 1;
        break;
      }
      case "normal": {
        const charg_minutes = (battery_to_fill * 60) / normal_kwh;
        req.session.description = "Normal charging";
        req.session.total_minutes = charg_minutes;
        req.session.pricingId = 2;
        break;
      }
      case "fast": {
        const charg_minutes = (battery_to_fill * 60) / fast_kwh;
        req.session.description = "Supercharging";
        req.session.total_minutes = charg_minutes;
        req.session.pricingId = 3;
        break;
      }
      default:
        break;
    }

    req.session.paymentId = req.body.radio2 === "cash" ? 1 : 2;
    res.redirect("../charging");
  });

module.exports = router;
