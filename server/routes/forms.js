const express = require('express');
const Form = require('../models/Form');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Create a new Form
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, airtableBaseId, airtableTableId, fields } = req.body;
        const form = await Form.create({
            owner: req.userId,
            title,
            airtableBaseId,
            airtableTableId,
            fields,
        });
        res.status(201).json(form);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create form' });
    }
});

// Get all forms for the user
router.get('/', requireAuth, async (req, res) => {
    try {
        const forms = await Form.find({ owner: req.userId }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

// Get a single form by ID (Public for viewer, but we might want to check ownership for editing)
router.get('/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ error: 'Form not found' });
        res.json(form);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

module.exports = router;
