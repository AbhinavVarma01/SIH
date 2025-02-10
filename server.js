require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const saltRounds = 10;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email,
                password: 'defaultPassword',
                experienceLevel: ''
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const redirect = req.user.experienceLevel === 'pro' ? '/pro.html' : 
                         req.user.experienceLevel === 'rookie' ? '/rookie.html' : 
                         `/role-selection.html?email=${req.user.email}`;
        res.redirect(redirect);
    }
);

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/api/logout', (req, res, next) => req.logout(err => err ? next(err) : res.redirect('/login')));

// Register User
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, experienceLevel } = req.body;

    if (!['pro', 'rookie'].includes(experienceLevel)) {
        return res.status(400).json({ error: 'Invalid experience level. Must be "pro" or "rookie".' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ firstName, lastName, email, password: hashedPassword, experienceLevel });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user', details: error.message });
    }
});

// Set User Role
app.post('/api/set-role', async (req, res) => {
    const { email, experienceLevel } = req.body;
    if (!email || !['pro', 'rookie'].includes(experienceLevel.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid input. Provide a valid email and experience level.' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { experienceLevel: experienceLevel.toLowerCase() },
            { new: true, upsert: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });
        const redirect = experienceLevel.toLowerCase() === 'pro' ? '/pro.html' : '/rookie.html';
        res.status(200).json({ message: 'Experience level updated successfully', redirect });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const redirect = user.experienceLevel === 'pro' ? '/pro.html' :
                         user.experienceLevel === 'rookie' ? '/rookie.html' :
                         '/role-selection.html';
        res.json({ redirect });
    } catch (error) {
        res.status(500).json({ error: 'Login error', details: error.message });
    }
});

// Stock API Integration
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
app.get('/stock/:symbol', async (req, res) => {
    try {
        const response = await axios.get(ALPHA_VANTAGE_API_URL, {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: req.params.symbol.toUpperCase(),
                interval: '5min',
                apikey: process.env.ALPHA_VANTAGE_API_KEY
            }
        });

        const timeSeries = response.data['Time Series (5min)'];
        if (!timeSeries) return res.status(500).json({ error: 'Time series data not available' });

        const latestTime = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestTime];

        res.json({
            symbol: req.params.symbol,
            latestPrice: latestData['4. close'],
            openPrice: latestData['1. open'],
            highPrice: latestData['2. high'],
            lowPrice: latestData['3. low'],
            volume: latestData['5. volume'],
            timestamp: latestTime
        });
    } catch (error) {
        res.status(500).json({ error: 'API error', details: error.message });
    }
});

// Server Start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
