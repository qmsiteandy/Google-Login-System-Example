const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureMessage: "Wrong Email or password.",
  }),
  (req, res) => {
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      res.redirect("/profile");
    }
  }
);

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res, next) => {
  let { name, email, password } = req.body;
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash("error_msg", "Email is already existed.");
    res.redirect("/auth/signup");
  }

  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ username: name, email, password });
  try {
    const savedUser = await newUser.save();
    req.flash("success_msg", "Succeed, you can login now.");
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) next(err);
  });
  res.redirect("/");
});

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
