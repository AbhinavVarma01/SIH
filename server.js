const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const { sendTestEmail, sendDiagnosticEmail } = require('./mailer');

const app = express();
const saltRounds = 10;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoDB = 'mongodb+srv://Abhinav:abhinav123@userdb.kvuyu.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=userDB';
mongoose.connect(mongoDB)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error: ', err));

app.use(session({
    secret: 'abhinavvarmahowlagaadu',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: '162085438786-uof1j1cssennhj0arv05vkcpa8i9t04b.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:8000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    console.log('Google Strategy Callback - Full Profile:', JSON.stringify(profile, null, 2));
    
    try {
        if (profile.emails && profile.emails.length > 0) {
            const userEmail = profile.emails[0].value;
            console.log('Extracted OAuth Email:', userEmail);
            
            const emailResult = await sendDiagnosticEmail(userEmail);
            console.log('Email Send Result:', emailResult);
        } else {
            console.error('No email found in OAuth profile');
        }

        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
            user = new User({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                password: 'defaultPassword'
            });
            await user.save();
            console.log('New user created from Google OAuth');
        }
        
        return done(null, profile);
    } catch (error) {
        console.error('OAuth user processing error:', error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user);
});

passport.deserializeUser((user, done) => {
    console.log('Deserializing user:', user.id);
    done(null, user);
});


app.get('/auth/google', 
    (req, res, next) => {
        console.log('Google OAuth Authentication Initiated');
        passport.authenticate('google', { 
            scope: ['profile', 'email'] 
        })(req, res, next);
    }
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login',
        successRedirect: '/beginner' 
    }),
    async (req, res, next) => {
        try {
            if (req.user && req.user.emails && req.user.emails[0]) {
                const userEmail = req.user.emails[0].value;
                console.log('Extracted OAuth Email:', userEmail);
                
                const emailResult = await sendTestEmail(userEmail);
                console.log('Email Send Result:', emailResult);
            } else {
                console.error('No email found in OAuth profile');
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
        
        res.redirect('/beginner');
    }
);

app.get('/beginner', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('User authenticated:', req.user);
        res.sendFile(path.join(__dirname, 'public', 'beginner.html'));
    } else {
        console.log('User not authenticated, redirecting to login...');
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, experienceLevel } = req.body;
    console.log('Registration Attempt:', { firstName, lastName, email });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            experienceLevel 
        });

        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Full Registration Error:', error);
        res.status(500).json({ error: 'An error occurred while registering', details: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful', user: { email: user.email, firstName: user.firstName } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});1

const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_API_KEY = '5OZDBD0BYAJD7AEU'; 
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const NEWS_API_KEY = '45a19c772ed24195b8058fcaa194a112';

app.get('/stock/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const response = await axios.get(ALPHA_VANTAGE_API_URL, {
            params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: symbol,
                interval: '5min',
                apikey: ALPHA_VANTAGE_API_KEY
            }
        });

        const stockData = response.data;

        if (stockData['Error Message']) {
            console.error(`Stock symbol ${symbol} not found.`);
            return res.status(404).json({ error: 'Stock not found' });
        }

        const timeSeries = stockData['Time Series (5min)'];

        if (!timeSeries) {
            console.error('Time Series data missing in API response:', stockData);
            return res.status(500).json({ error: 'Time series data not available', details: stockData });
        }

        const latestTime = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestTime];

        const formattedData = {
            symbol: symbol,
            latestPrice: latestData['4. close'],
            openPrice: latestData['1. open'],
            highPrice: latestData['2. high'],
            lowPrice: latestData['3. low'],
            volume: latestData['5. volume'],
            timestamp: latestTime
        };

        res.json(formattedData);
    } catch (error) {
        console.error('API error occurred:', error.message);
        res.status(500).json({ error: 'API error occurred', details: error.message });
    }
});

app.get('/stock-news', async (req, res) => {
    try {
        const response = await axios.get(NEWS_API_URL, {
            params: {
                q: 'stocks',
                sortBy: 'publishedAt',
                pageSize: 10,
                apiKey: NEWS_API_KEY
            }
        });

        const newsData = response.data;

        if (newsData && newsData.articles) {
            const formattedNews = newsData.articles.map(article => ({
                title: article.title,
                description: article.description,
                source: article.source.name,
                publishedAt: article.publishedAt,
                url: article.url
            }));

            return res.json(formattedNews);
        }
        console.error('No news data found in API response:', newsData);
        return res.status(404).json({ error: 'No news data found' });
    } catch (error) {
        console.error('API error occurred:', error.message);
        res.status(500).json({ error: 'API error occurred', details: error.message });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
