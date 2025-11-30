import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BaseTableSelector = ({ onSelect }) => {
    const [bases, setBases] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedBase, setSelectedBase] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [loadingBases, setLoadingBases] = useState(true);
    const [loadingTables, setLoadingTables] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchBases = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/airtable/bases', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBases(res.data);
            } catch (err) {
                console.error('Failed to fetch bases', err);
            } finally {
                setLoadingBases(false);
            }
        };
        fetchBases();
    }, [token]);

    useEffect(() => {
        if (!selectedBase) return;
        const fetchTables = async () => {
            setLoadingTables(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/airtable/bases/${selectedBase}/tables`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTables(res.data);
            } catch (err) {
                console.error('Failed to fetch tables', err);
            } finally {
                setLoadingTables(false);
            }
        };
        fetchTables();
    }, [selectedBase, token]);

    const handleBaseChange = (e) => {
        setSelectedBase(e.target.value);
        setSelectedTable('');
        setTables([]);
    };

    const handleTableChange = (e) => {
        const tableId = e.target.value;
        setSelectedTable(tableId);
        const table = tables.find(t => t.id === tableId);
        onSelect(selectedBase, table);
    };

    if (loadingBases) return <div>Loading Bases...</div>;

    return (
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>1. Select Source</h3>
            <div style={{ marginBottom: '10px' }}>
                <label>Base: </label>
                <select value={selectedBase} onChange={handleBaseChange} style={{ marginLeft: '10px', padding: '5px' }}>
                    <option value="">Select a Base</option>
                    {bases.map(base => (
                        <option key={base.id} value={base.id}>{base.name}</option>
                    ))}
                </select>
            </div>

            {selectedBase && (
                <div>
                    <label>Table: </label>
                    <select value={selectedTable} onChange={handleTableChange} disabled={loadingTables} style={{ marginLeft: '10px', padding: '5px' }}>
                        <option value="">Select a Table</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id}>{table.name}</option>
                        ))}
                    </select>
                    {loadingTables && <span style={{ marginLeft: '10px' }}>Loading Tables...</span>}
                </div>
            )}
        </div>
    );
};

export default BaseTableSelector;
