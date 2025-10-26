import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setLoading(false);
            return setError('Passwords do not match.');
        }
        
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };

            const response = await api.post(
                '/auth/register',
                { name, email, password },
                config
            );

            // Store the user info and token in localStorage (automatic login)
            try {
                localStorage.setItem('userInfo', JSON.stringify(response.data));
            } catch (e) {
                console.warn('localStorage access blocked, user will need to login manually');
            }

            alert('Registration Successful!');
            navigate('/movies'); // Redirect to the main movie page

        } catch (err) {
            const message = err.response && err.response.data.message
                ? err.response.data.message
                : 'Registration failed. Server error.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={submitHandler} className="auth-form">
                <h2>Create Account</h2>
                {error && <div className="alert-error">{error}</div>}

                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        placeholder="Enter Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        placeholder="Enter Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter Password (min 6 chars)" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;