const express = require("express");
const router = express.Router();

const authCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/", autoCheck, (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = router;
