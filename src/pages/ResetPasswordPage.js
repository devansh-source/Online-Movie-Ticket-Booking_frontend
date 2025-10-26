import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Get the reset token from the URL (e.g., /reset-password/TOKEN_HERE)
    const { token } = useParams(); 
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password.length < 6) {
            setLoading(false);
            return setError('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
            setLoading(false);
            return setError('Passwords do not match.');
        }

        try {
            // Call the backend route to reset the password with the token
            const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
            
            // On successful reset, the backend automatically logs the user in (sends token)
            localStorage.setItem('userInfo', JSON.stringify(data)); 

            setMessage('Password reset successful! You are now logged in.');
            setTimeout(() => {
                navigate('/movies'); // Redirect to the home page
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Password reset failed. Token may be expired or invalid.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={submitHandler} className="auth-form">
                <h2>Reset Password</h2>

                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                <div className="form-group">
                    <label>New Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter new password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        placeholder="Confirm new password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;