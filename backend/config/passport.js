import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy : true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        const googleEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if (!googleEmail) {
            return done(new Error("No email found in Google profile. Make sure 'email' scope is enabled."), null);
        }

        let existingUserByEmail = await User.findOne({ email: googleEmail });

        if (existingUserByEmail) {
            existingUserByEmail.googleId = profile.id;
            
            if (!existingUserByEmail.profilePic && profile.photos && profile.photos.length > 0) {
                existingUserByEmail.profilePic = profile.photos[0].value;
            }
            
            await existingUserByEmail.save();
            return done(null, existingUserByEmail);
        }

        const newUser = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: googleEmail, 
            profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "",
        });

        return done(null, newUser);
    } catch (error) {
        console.error("Error in Google Strategy: ", error);
        return done(error, null);
    }
  }
));

export default passport;