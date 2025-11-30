const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Airtable OAuth Configuration
const CLIENT_ID = process.env.AIRTABLE_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI || 'http://localhost:5000/auth/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Scopes required for the application
// data.records:read - Read records
// data.records:write - Create responses
// schema.bases:read - List bases and tables
// webhook:manage - Create webhooks
const SCOPES = 'data.records:read data.records:write schema.bases:read webhook:manage';

// 1. Redirect to Airtable Login
router.get('/login', (req, res) => {
    const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection (should be more robust in prod)
    // Store state in cookie or session if needed, skipping for simplicity

    const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&state=${state}`;

    res.redirect(authUrl);
});

// 2. Callback Handler
router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.status(400).json({ error: 'Airtable login failed', details: error });
    }

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await axios.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
            // code_verifier: ... (PKCE is recommended but optional for confidential clients if not using it)
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Fetch User Info
        const userResponse = await axios.get('https://api.airtable.com/v0/meta/whoami', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { id: airtableId, email } = userResponse.data;

        // Save or Update User
        let user = await User.findOne({ airtableId });
        const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

        if (user) {
            user.accessToken = access_token;
            user.refreshToken = refresh_token;
            user.tokenExpiresAt = tokenExpiresAt;
            user.lastLogin = Date.now();
            await user.save();
        } else {
            user = await User.create({
                airtableId,
                email,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiresAt,
            });
        }

        // Generate App JWT
        const token = jwt.sign({ userId: user._id, airtableId: user.airtableId }, JWT_SECRET, { expiresIn: '1d' });

        // Redirect to Frontend with Token
        // In production, set a secure httpOnly cookie. For this task, passing via query param to frontend for simplicity.
        res.redirect(`http://localhost:5173/auth-success?token=${token}`);

    } catch (err) {
        console.error('OAuth Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// 3. Get Current User
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-accessToken -refreshToken'); // Don't expose tokens
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
