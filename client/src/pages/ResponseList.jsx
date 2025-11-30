import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import API_URL from '../config';

const ResponseList = () => {
    const { id } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/forms/${id}/responses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResponses(res.data);
            } catch (err) {
                console.error('Failed to fetch responses', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResponses();
    }, [id, token]);

    if (loading) return <div>Loading Responses...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Form Responses</h2>
                <Link to="/dashboard">Back to Dashboard</Link>
            </div>

            {responses.length === 0 ? (
                <p>No responses yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Submitted At</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Airtable ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Answers Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.map(response => (
                            <tr key={response._id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    {new Date(response.createdAt).toLocaleString()}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    {response.airtableRecordId}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <pre style={{ margin: 0, fontSize: '0.8em' }}>
                                        {JSON.stringify(response.answers, null, 2).substring(0, 100)}...
                                    </pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ResponseList;
