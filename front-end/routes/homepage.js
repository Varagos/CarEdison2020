const express = require("express");
let router = express.Router();

router.use(function (req, res, next) {
  console.log(req.url, "@", Date.now());
  next();
});

router.route("/").get((req, res) => {
  // Update session property after ajax call
  req.session.batteryState = 0; //battery_states[req.session.token];

  if (!req.session.token) {
    req.session.login_error = "Please login first";
    res.redirect("../");
  } else {
    res.render("homepage");
  }
});

module.exports = router;
