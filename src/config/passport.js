const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

// registro con localstarategy
passport.use(
  "register",
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true, session: false },
    async (req, email, password, done) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return done(null, false, { message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === "adminCoder@coder.com" ? "admin" : "usuario";

        const newUser = new User({
          email,
          password: hashedPassword,
          firstName: req.body.firstName || "Nombre",
          lastName: req.body.lastName || "Apellido",
          role,
        });

        await newUser.save();
        return done(null, newUser);
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
    { usernameField: "email", session: false },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// login con gitHubstrategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/github/callback",
      scope: ["user:email"],
      session: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `github-${profile.id}@noemail.com`;
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            email,
            password: "github-auth", // 🔥 Se asigna un valor por defecto para evitar el error
            firstName: profile.displayName?.split(" ")[0] || "Nombre",
            lastName: profile.displayName?.split(" ")[1] || "Apellido",
            role: "usuario",
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// serializer y deserializer user
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
