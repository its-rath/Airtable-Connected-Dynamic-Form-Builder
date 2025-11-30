import React, { useState } from 'react';

const SUPPORTED_TYPES = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments'];

const FieldConfig = ({ fields, onUpdate }) => {
    const handleToggleField = (field) => {
        const exists = fields.find(f => f.id === field.id);
        if (exists) {
            onUpdate(fields.filter(f => f.id !== field.id));
        } else {
            onUpdate([...fields, { ...field, questionKey: field.id, label: field.name, required: false, conditionalRules: null }]);
        }
    };

    const handleUpdateField = (id, updates) => {
        onUpdate(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    return (
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>2. Configure Fields</h3>
            {fields.length === 0 && <p>Select fields from the table below to add them to your form.</p>}

            {fields.map((field, index) => (
                <div key={field.id} style={{ marginBottom: '15px', padding: '10px', background: '#f9f9f9', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{field.name} <small>({field.type})</small></strong>
                        <button onClick={() => handleToggleField(field)} style={{ color: 'red' }}>Remove</button>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>Label: </label>
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                            style={{ marginLeft: '5px', marginRight: '15px' }}
                        />

                        <label>
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                            /> Required
                        </label>
                    </div>

                    {/* Placeholder for Conditional Logic Builder */}
                    <div style={{ marginTop: '10px' }}>
                        <details>
                            <summary>Conditional Logic (Optional)</summary>
                            <p style={{ fontSize: '0.9em', color: '#666' }}>Logic builder coming soon...</p>
                        </details>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FieldConfig;
