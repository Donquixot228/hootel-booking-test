const passportJwt = require("passport-jwt");
const { JWT_SECRET } = require("../../config/key");
const User = require("../../models/user");

const jwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_SECRET;

const passportMiddleware = (passport) => {   
    passport.use(
        new jwtStrategy(opts, (jwtPayload, done) => {
          console.log(jwtPayload);
          User.findById(jwtPayload.id)
            .then((user) => {
              if (user) {
                return done(null, user);
              }
              return done(null, false);
            })
            .catch((err) => console.log(err));
        })
      );  
};

module.exports = passportMiddleware;
