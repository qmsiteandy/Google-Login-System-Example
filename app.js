const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");

dotenv.config();
require("./config/passport");

const authRouter = require("./routers/authRouter");
const profileRouter = require("./routers/profileRouter");
const passport = require("passport");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb connection success.");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(
  session({
    secret: "any string is ok.",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 必須擺在除了 router 外的最後一項
app.use((req, res, next) => {
  // 在 middleware 設定 flash msg，如此後續 views 中都可以讀取
  res.locals.error = req.flash("error");
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use("/auth", authRouter);
app.use("/profile", profileRouter);

app.get("/", (req, res) => {
  res.render("index", { user: req.user }); //req.user 從 passport.deserializeUser 來的
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something is wrong.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
