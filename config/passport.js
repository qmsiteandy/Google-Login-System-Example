const { promiseImpl } = require("ejs");
const passport = require("passport");
const googleStrategy = require("passport-google-oauth20");
const localStrategy = require("passport-local");
const bcryp = require("bcrypt");
require("dotenv").config();
const User = require("../models/userModel");

passport.serializeUser((user, done) => {
  console.log("Serializing user now.");
  return done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user.");
  User.findOne({ _id }).then((user) => {
    console.log("Found user.");
    return done(null, user);
  });
});

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, //在google API 憑證頁面取得
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, //在google API 憑證頁面取得
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        //如果此使用者已存在資料庫中
        if (foundUser) {
          console.log("User already existed.");
          return done(null, foundUser);
        } else {
          new User({
            username: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
          })
            .save()
            .then((newUser) => {
              console.log("New user created.");
              return done(null, newUser);
            });
        }
      });
    }
  )
);

passport.use(
  new localStrategy((username, password, done) => {
    User.findOne({ email: username })
      .then((user) => {
        //使用者不存在
        if (!user) {
          return done(null, false);
        } else {
          bcryp.compare(password, user.password, (err, result) => {
            if (!result) return done(null, false);
            else return done(null, user);
          });
        }
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);
