const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
    },
    airtableRecordId: String,
    answers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
    deletedInAirtable: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
