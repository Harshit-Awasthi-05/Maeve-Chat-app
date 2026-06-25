passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let existingUser = await User.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        return done(null, existingUser);
      }

      const generatedUsername = profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 1000);

      const newUser = new User({
        googleId: profile.id,
        fullName: profile.displayName,
        username: generatedUsername,
        email: profile.emails[0].value,
        profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ""
      });

      await newUser.save();
      return done(null, newUser);

    } catch (error) {
      console.error(error);
      return done(error, null);
    }
  }
));