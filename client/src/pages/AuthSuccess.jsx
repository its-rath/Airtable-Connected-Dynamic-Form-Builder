import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    }, [searchParams, navigate]);

    return <div>Authenticating...</div>;
};

export default AuthSuccess;
