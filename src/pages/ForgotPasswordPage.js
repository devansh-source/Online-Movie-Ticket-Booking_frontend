import React, { useState } from 'react';
import api from '../utils/axiosConfig';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            // Call the backend route to send the reset email
            const { data } = await api.post('/auth/forgotpassword', { email });
            
            // Display a success message, even if the user wasn't found (for security)
            setMessage(data.message || 'If an account exists, a password reset link has been sent to your email.');
            setEmail('');
        } catch (err) {
            // Display a generic message to prevent leaking user existence
            setMessage('If an account exists, a password reset link has been sent to your email.');
            // setError(err.response?.data?.message || 'Error occurred during request.'); // Keep this line commented for security
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={submitHandler} className="auth-form">
                <h2>Forgot Password</h2>
                <p>Enter your email address to receive a password reset link.</p>
                
                {message && <div className="alert-success">{message}</div>}
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
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Sending...' : 'Request Reset Link'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;