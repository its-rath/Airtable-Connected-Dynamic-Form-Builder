const express = require('express');
const axios = require('axios');
const Form = require('../models/Form');
const Response = require('../models/Response');
const router = express.Router();

// Handle Airtable Webhook
router.post('/airtable', async (req, res) => {
    try {
        // Airtable sends a notification with baseId and webhookId
        // Payload example: { base: { id: "app..." }, webhook: { id: "ach..." }, timestamp: "..." }
        const { base, webhook } = req.body;

        if (!base || !webhook) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        const baseId = base.id;
        const webhookId = webhook.id;

        // Find a form associated with this base to get an access token
        // In a real app, we should probably store webhook IDs and map them to users explicitly
        const form = await Form.findOne({ airtableBaseId: baseId }).populate('owner');

        if (!form || !form.owner || !form.owner.accessToken) {
            console.error(`No form/user found for base ${baseId}`);
            return res.status(200).send('OK'); // Acknowledge to stop retries
        }

        const accessToken = form.owner.accessToken;

        // Fetch payloads
        // We should track the last cursor processed to avoid duplicates, but for this task we'll fetch recent
        const payloadsRes = await axios.get(`https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhookId}/payloads`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const payloads = payloadsRes.data.payloads;

        for (const payload of payloads) {
            // Handle Table Changes
            if (payload.changedTablesById) {
                for (const [tableId, tableChange] of Object.entries(payload.changedTablesById)) {

                    // Handle Created/Updated Records
                    if (tableChange.createdRecordsById) {
                        // We might not need to handle creation from Airtable -> DB for this task, 
                        // usually it's Form -> DB -> Airtable. 
                        // But if we did, we'd insert here.
                    }

                    if (tableChange.changedRecordsById) {
                        for (const [recordId, recordChange] of Object.entries(tableChange.changedRecordsById)) {
                            // Update MongoDB Response
                            // We only update if we have a response with this airtableRecordId
                            const response = await Response.findOne({ airtableRecordId: recordId });
                            if (response) {
                                // Merge new values into answers
                                // recordChange.current.cellValuesByFieldId contains the new values
                                const newValues = recordChange.current.cellValuesByFieldId;
                                if (newValues) {
                                    // We need to map field IDs back to our internal structure if needed
                                    // For now, we just update the answers map with the new values
                                    // Note: This puts Field IDs as keys in answers. 
                                    // Our Form Submission puts Field IDs (or questionKeys) in answers.
                                    // If we used Field IDs in submission, this matches.

                                    const updatedAnswers = { ...response.answers.toObject(), ...newValues };
                                    response.answers = updatedAnswers;
                                    await response.save();
                                    console.log(`Updated response for record ${recordId}`);
                                }
                            }
                        }
                    }

                    // Handle Deleted Records
                    if (tableChange.destroyedRecordIds) {
                        for (const recordId of tableChange.destroyedRecordIds) {
                            const response = await Response.findOne({ airtableRecordId: recordId });
                            if (response) {
                                response.deletedInAirtable = true;
                                await response.save();
                                console.log(`Flagged response ${recordId} as deleted`);
                            }
                        }
                    }
                }
            }
        }

        res.status(200).send('Sync Complete');

    } catch (error) {
        console.error('Webhook Error:', error.response?.data || error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
