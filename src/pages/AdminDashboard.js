import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMetrics = async () => {
            let userInfo = null;
            try {
                userInfo = JSON.parse(localStorage.getItem('userInfo'));
            } catch (e) {
                console.warn('localStorage access blocked or invalid data');
            }

            if (!userInfo || !userInfo.isAdmin) {
                // If not an admin, redirect immediately
                alert('Access Denied. Not authorized as an administrator.');
                return navigate('/');
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                // Fetch metrics from the protected admin endpoint
                const { data } = await api.get('/admin/metrics', config);
                setMetrics(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch dashboard data. Check server connection.');
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [navigate]);

    if (loading) return <div className="loading-container">Loading Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const { 
        totalUsers, 
        totalMovies, 
        totalBookings, 
        latestBookings 
    } = metrics;

    return (
        <div className="admin-dashboard-page">
            <h1 className="dashboard-title">System Overview Dashboard</h1>
            
            {/* Metric Cards */}
            <div className="metrics-grid">
                <div className="metric-card bg-primary">
                    <h3>Total Users</h3>
                    <p className="metric-value">{totalUsers}</p>
                </div>
                <div className="metric-card bg-success">
                    <h3>Total Movies</h3>
                    <p className="metric-value">{totalMovies}</p>
                </div>
                <div className="metric-card bg-info">
                    <h3>Total Bookings</h3>
                    <p className="metric-value">{totalBookings}</p>
                </div>
            </div>

            {/* Latest Bookings Table */}
            <h2 className="section-title">Latest Bookings</h2>
            <div className="latest-bookings-panel">
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th>ID (Last 4)</th>
                            <th>Movie</th>
                            <th>User</th>
                            <th>Total Price</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestBookings && latestBookings.length > 0 ? (
                            latestBookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>...{booking._id.slice(-4)}</td>
                                    <td>{booking.movieId.title}</td>
                                    <td>{booking.userId.name}</td>
                                    <td>Rs.{booking.totalPrice.toFixed(2)}</td>
                                    <td>{new Date(booking.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5">No recent bookings found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Link to Movie Management */}
            <div className="dashboard-links">
                 <button 
                    className="btn-primary" 
                    onClick={() => navigate('/admin/movielist')}
                 >
                    Go to Movie Management
                 </button>
            </div>
        </div>
    );
};
export default AdminDashboard;