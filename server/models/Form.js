const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    questionKey: String,
    operator: {
        type: String,
        enum: ['equals', 'notEquals', 'contains'],
    },
    value: mongoose.Schema.Types.Mixed,
});

const fieldSchema = new mongoose.Schema({
    questionKey: String, // Internal unique ID for the question
    airtableFieldId: String,
    label: String,
    type: {
        type: String,
        enum: ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments'],
    },
    options: [String], // For select fields
    required: Boolean,
    conditionalRules: {
        logic: {
            type: String,
            enum: ['AND', 'OR'],
            default: 'AND',
        },
        conditions: [conditionSchema],
    },
});

const formSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: String,
    airtableBaseId: String,
    airtableTableId: String,
    fields: [fieldSchema],
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);
