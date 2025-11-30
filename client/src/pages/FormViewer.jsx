import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { shouldShowQuestion } from '../utils/logicEngine';

const FormViewer = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
                setForm(res.data);
            } catch (err) {
                console.error('Failed to load form', err);
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id]);

    const handleChange = (questionKey, value) => {
        setAnswers(prev => ({ ...prev, [questionKey]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        const errors = [];
        form.fields.forEach(field => {
            const isVisible = shouldShowQuestion(field.conditionalRules, answers);
            if (isVisible && field.required && !answers[field.questionKey]) {
                errors.push(`${field.label} is required.`);
            }
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`http://localhost:5000/api/forms/${id}/submit`, { answers });
            setSubmitted(true);
        } catch (err) {
            console.error('Submission failed', err);
            alert('Failed to submit form.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading Form...</div>;
    if (!form) return <div>Form not found.</div>;
    if (submitted) return <div style={{ padding: '20px', textAlign: 'center' }}><h2>Thank you!</h2><p>Your response has been recorded.</p></div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>{form.title}</h1>
            <form onSubmit={handleSubmit}>
                {form.fields.map(field => {
                    const isVisible = shouldShowQuestion(field.conditionalRules, answers);
                    if (!isVisible) return null;

                    return (
                        <div key={field.questionKey} style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                            </label>

                            {field.type === 'singleLineText' && (
                                <input
                                    type="text"
                                    value={answers[field.questionKey] || ''}
                                    onChange={(e) => handleChange(field.questionKey, e.target.value)}
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            )}

                            {field.type === 'multilineText' && (
                                <textarea
                                    value={answers[field.questionKey] || ''}
                                    onChange={(e) => handleChange(field.questionKey, e.target.value)}
                                    style={{ width: '100%', padding: '8px', minHeight: '80px' }}
                                />
                            )}

                            {field.type === 'singleSelect' && (
                                <select
                                    value={answers[field.questionKey] || ''}
                                    onChange={(e) => handleChange(field.questionKey, e.target.value)}
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="">Select an option</option>
                                    {field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            )}

                            {/* Add other types as needed */}
                        </div>
                    );
                })}

                <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default FormViewer;
