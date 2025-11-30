import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BaseTableSelector from '../components/BaseTableSelector';
import FieldConfig from '../components/FieldConfig';

const SUPPORTED_TYPES = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments'];

const FormBuilder = () => {
    const [title, setTitle] = useState('New Form');
    const [baseId, setBaseId] = useState('');
    const [tableId, setTableId] = useState('');
    const [availableFields, setAvailableFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleSourceSelect = (base, table) => {
        setBaseId(base);
        setTableId(table.id);
        // Filter supported fields
        const supported = table.fields.filter(f => SUPPORTED_TYPES.includes(f.type));
        setAvailableFields(supported);
        setSelectedFields([]); // Reset selection on table change
    };

    const handleSave = async () => {
        if (!title || !baseId || !tableId || selectedFields.length === 0) {
            alert('Please complete the form configuration.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title,
                airtableBaseId: baseId,
                airtableTableId: tableId,
                fields: selectedFields.map(f => ({
                    questionKey: f.id,
                    airtableFieldId: f.id,
                    label: f.label,
                    type: f.type,
                    options: f.options ? f.options.choices.map(c => c.name) : [],
                    required: f.required,
                    conditionalRules: f.conditionalRules
                }))
            };

            await axios.post('http://localhost:5000/api/forms', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Form created successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to save form', err);
            alert('Failed to save form.');
        } finally {
            setSaving(false);
        }
    };

    const toggleFieldSelection = (field) => {
        const isSelected = selectedFields.find(f => f.id === field.id);
        if (isSelected) {
            // Remove
            setSelectedFields(selectedFields.filter(f => f.id !== field.id));
        } else {
            // Add with defaults
            setSelectedFields([...selectedFields, {
                ...field,
                questionKey: field.id,
                label: field.name,
                required: false,
                conditionalRules: null
            }]);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2>Create New Form</h2>

            <div style={{ marginBottom: '20px' }}>
                <label>Form Title: </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ padding: '5px', width: '300px' }}
                />
            </div>

            <BaseTableSelector onSelect={handleSourceSelect} />

            {availableFields.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>2. Select Fields</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {availableFields.map(field => (
                            <div key={field.id} style={{ padding: '10px', border: '1px solid #eee', background: selectedFields.find(f => f.id === field.id) ? '#e6f7ff' : 'white' }}>
                                <label style={{ display: 'block', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedFields.find(f => f.id === field.id)}
                                        onChange={() => toggleFieldSelection(field)}
                                    />
                                    <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{field.name}</span>
                                    <br />
                                    <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '24px' }}>{field.type}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedFields.length > 0 && (
                <FieldConfig fields={selectedFields} onUpdate={setSelectedFields} />
            )}

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px', padding: '10px 20px' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {saving ? 'Saving...' : 'Create Form'}
                </button>
            </div>
        </div>
    );
};

export default FormBuilder;
