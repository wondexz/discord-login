const express = require("express");
const app = express();
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { port, clientId, clientSecret, callbackUrl, Scope, domain } = require('./config.json');
const ejs = require('ejs');
app.set("view engine", "ejs");
app.use('/assets', express.static('assets'))

const discordConfig = {
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackUrl,
    scope: Scope
};

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy(discordConfig, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        return done(null, profile);
    });
}));

app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', isLoggedIn, (req, res) => {
    res.render('index', { username: req.user.username, id: req.user.id, avatar: req.user.avatar })
});

app.get('/auth', passport.authenticate('discord'));

app.get('/auth/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

app.get('/data', isLoggedIn, (req, res) => {
    res.json(req.user);
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth');
}

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda başlatıldı`);
});