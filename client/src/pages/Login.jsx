import React from 'react';

const Login = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/login';
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h1>Airtable Form Builder</h1>
            <p>Please log in with your Airtable account to continue.</p>
            <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                Log in with Airtable
            </button>
        </div>
    );
};

export default Login;
