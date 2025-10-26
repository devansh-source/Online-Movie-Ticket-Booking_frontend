import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const [user, setUser] = useState(null); // Use a user object to store name and admin status
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            } else {
                setUser(null);
            }
        } catch (e) {
            console.warn('localStorage access blocked or invalid data');
            setUser(null);
        }
    }, [navigate]); // Re-run effect when navigation state changes

    const logoutHandler = () => {
        localStorage.removeItem('userInfo'); // Clear stored user data
        setUser(null);
        navigate('/login');
    };

    const isAdmin = user && user.isAdmin;
    const userName = user ? user.name : '';

    return (
        <header className="main-header">
            <nav className="nav-container">
                <Link to="/" className="logo">MERN Tickets 🍿</Link>
                <div className="nav-links">
                    <Link to="/movies" className="nav-item">Movies</Link>
                    
                    {/* --- CONDITIONAL ADMIN LINK --- */}
                    {isAdmin && (
                        <Link to="/admin/dashboard" className="nav-item admin-link">Dashboard</Link>
                    )}
                    {/* ------------------------------ */}
                    
                    {userName ? (
                        <>
                            <Link to="/mybookings" className="nav-item">My Bookings</Link>
                            <span className="welcome-user">Welcome, {userName}!</span>
                            <button onClick={logoutHandler} className="btn-logout">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item">Sign In</Link>
                            <Link to="/register" className="btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;