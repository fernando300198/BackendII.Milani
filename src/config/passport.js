const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

// registro con localstrategy
passport.use(
  "register",
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        let user = await User.findOne({ email });
        if (user) return done(null, false, { message: "El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === "adminCoder@coder.com" ? "admin" : "usuario";

        user = new User({ email, password: hashedPassword, role });
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// login con localstrategy
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Contraseña incorrecta" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// login con github
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/github/callback",
      scope: ["user:email"], 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails?.[0]?.value || `github-${profile.id}@noemail.com`;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({ githubId: profile.id, email, role: "usuario" });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

//  serializer y deserealizer de usuario
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
