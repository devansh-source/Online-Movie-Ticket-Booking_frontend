import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig'; // Use the configured API instance

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                navigate('/movies');
            }
        } catch (e) {
            console.warn('localStorage access blocked or invalid data');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };

            const response = await api.post(
                '/auth/login',
                { email, password },
                config
            );

            // Store user data (including token)
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            
            alert('Login Successful!');
            navigate('/movies'); 

        } catch (err) {
            const message = err.response && err.response.data.message
                ? err.response.data.message
                : 'Login failed. Please check your credentials.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={submitHandler} className="auth-form">
                <h2>Sign In</h2>
                {error && <div className="alert-error">{error}</div>}

                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        placeholder="Enter email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                {/* Link to Forgot Password Page */}
                <div className="forgot-password-link">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
                
            </form>
            <div className="register-link">
                New Customer? <span onClick={() => navigate('/register')}>Register Here</span>
            </div>
        </div>
    );
};

export default LoginPage;