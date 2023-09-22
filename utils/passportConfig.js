const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User");

const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: "564428568110-00b2e86egmtkc7uv82heq5p209ur08u2.apps.googleusercontent.com", //TODO
        clientSecret: "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", //TODO
        callbackURL: "http://localhost:8888/auth/google/callback", //TODO
        passReqToCallback: true
    },
        async (request, accessToken, refreshToken, profile, done) => {
            try {
                let existingUser = await User.findOne({ 'google.id': profile.id });
                // if user exists return the user
                if (existingUser) {
                    return done(null, existingUser);
                }
                // if user does not exist create a new user
                console.log('Creating new user...');
                const userDbObj = {
                    method: 'google',
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    platform: 'google'
                };
                console.log('Debug: userDbObj is', JSON.stringify(userDbObj, null, 4));
                const newUser = new User(userDbObj);
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }
        }
    ));

    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("authorization"),
                secretOrKey: "secretKey",
            },
            async (jwtPayload, done) => {
                console.log('Debug: jwtPayload is', jwtPayload);
                try {
                    // Extract user
                    const user = jwtPayload.user;
                    done(null, user);
                } catch (error) {
                    done(error, false);
                }
            }
        )
    );
}

