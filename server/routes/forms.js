const express = require('express');
const Form = require('../models/Form');
const User = require('../models/User');
const Response = require('../models/Response');
const axios = require('axios');
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

// Get a single form by ID (Public for viewer)
router.get('/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ error: 'Form not found' });
        res.json(form);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

// Submit Form Response
router.post('/:id/submit', async (req, res) => {
    try {
        const { answers } = req.body;
        const form = await Form.findById(req.params.id).populate('owner');

        if (!form) return res.status(404).json({ error: 'Form not found' });

        // 1. Validate Data (Basic check)
        // In a real app, we should reuse the logic engine here to validate conditional required fields

        // 2. Format data for Airtable
        const airtableFields = {};
        form.fields.forEach(field => {
            const value = answers[field.questionKey];
            if (value !== undefined && value !== '') {
                // Map questionKey back to field name or ID if needed, but here we use the field ID/Name from configuration
                // Assuming airtableFieldId is the actual Field ID or Name
                airtableFields[field.airtableFieldId] = value;
            }
        });

        // 3. Save to Airtable
        const airtableRes = await axios.post(
            `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableId}`,
            { fields: airtableFields },
            { headers: { Authorization: `Bearer ${form.owner.accessToken}` } }
        );

        const airtableRecordId = airtableRes.data.id;

        // 4. Save to MongoDB
        const response = await Response.create({
            formId: form._id,
            airtableRecordId,
            answers,
        });

        res.status(201).json(response);

    } catch (error) {
        console.error('Submission Error:', error.response?.data || error);
        res.status(500).json({ error: 'Failed to submit response' });
    }
});

module.exports = router;
