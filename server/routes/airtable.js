const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to get authenticated user and their access token
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Check if token needs refresh (simple check, ideally handle refresh flow properly)
        if (new Date() > user.tokenExpiresAt) {
            // In a real app, refresh token here. For this task, we might ask user to re-login or handle it if we have time.
            // For now, let's assume token is valid or user re-logins.
            return res.status(401).json({ error: 'Token expired, please login again' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Proxy to Airtable API
const airtableRequest = async (user, method, url, data = null) => {
    try {
        const response = await axios({
            method,
            url: `https://api.airtable.com/v0${url}`,
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
            },
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Airtable API Error:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// List Bases
router.get('/bases', requireAuth, async (req, res) => {
    try {
        const data = await airtableRequest(req.user, 'GET', '/meta/bases');
        res.json(data.bases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bases' });
    }
});

// List Tables in a Base
router.get('/bases/:baseId/tables', requireAuth, async (req, res) => {
    try {
        const data = await airtableRequest(req.user, 'GET', `/meta/bases/${req.params.baseId}/tables`);
        res.json(data.tables);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

module.exports = router;
