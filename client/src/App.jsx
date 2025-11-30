import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import ResponseList from './pages/ResponseList';

const Dashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/forms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForms(res.data);
      } catch (err) {
        console.error('Failed to fetch forms', err);
      }
    };
    fetchForms();
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <button onClick={() => navigate('/create-form')} style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
        + Create New Form
      </button>

      <h3>Your Forms</h3>
      {forms.length === 0 ? <p>No forms created yet.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {forms.map(form => (
            <li key={form._id} style={{ padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{form.title}</strong>
                <br />
                <small style={{ color: '#666' }}>Created: {new Date(form.createdAt).toLocaleDateString()}</small>
              </div>
              <div>
                <Link to={`/form/${form._id}`} target="_blank" style={{ marginRight: '15px' }}>View Form</Link>
                <Link to={`/form/${form._id}/responses`}>View Responses</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-form"
          element={
            <ProtectedRoute>
              <FormBuilder />
            </ProtectedRoute>
          }
        />
        <Route path="/form/:id" element={<FormViewer />} />
        <Route
          path="/form/:id/responses"
          element={
            <ProtectedRoute>
              <ResponseList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
