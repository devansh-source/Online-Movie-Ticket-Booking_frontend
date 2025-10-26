import React, { useState, useEffect, useCallback } from 'react';
// --- FIX: Import the configured api instance ---
import api from '../utils/axiosConfig'; 
import { useNavigate } from 'react-router-dom';
const MovieListPageAdmin = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const fetchMovies = useCallback(async () => {
        let userInfo = null;
        try {
            userInfo = JSON.parse(localStorage.getItem('userInfo'));
        } catch (e) {
            console.warn('localStorage access blocked or invalid data');
        }
        if (!userInfo || !userInfo.isAdmin) {
            alert('Access Denied. Admin privileges required.');
            return navigate('/');
        }
        
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            // --- FIX: Use api instance, not hardcoded axios.get ---
            const { data } = await api.get('/movies', config);
            setMovies(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load movies or unauthorized access.');
            setLoading(false);
        }
    }, [navigate]);
    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);
    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this movie?')) {
            let userInfo = null;
            try {
                userInfo = JSON.parse(localStorage.getItem('userInfo'));
            } catch (e) {
                console.warn('localStorage access blocked or invalid data');
            }
            if (!userInfo || !userInfo.token) {
                alert('User not authenticated. Please log in again.');
                return;
            }
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                // --- FIX: Use api instance, not hardcoded axios.delete ---
                await api.delete(`/movies/${id}`, config);
                alert('Movie Deleted!');
                fetchMovies(); // Refresh list
            } catch (err) {
                alert('Failed to delete movie.');
            }
        }
    };
    
    if (loading) return <div className="loading-container">Loading Admin Panel...</div>;
    if (error) return <div className="error-message">{error}</div>;
    return (
        <div className="admin-movie-list-page">
            <h1>Movie Management (Admin)</h1>
            <button className="btn-primary mb-3" onClick={() => alert('Navigate to Movie Creation Form')}>
                + Create New Movie
            </button>
            <table className="movie-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>TITLE</th>
                        <th>SHOWTIMES</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((movie) => (
                        <tr key={movie._id}>
                            <td>{movie._id}</td>
                            <td>{movie.title}</td>
                            <td>{movie.showtimes.length}</td>
                            <td>
                                <button 
                                    className="btn-action edit" 
                                    onClick={() => alert(`Edit ${movie.title}`)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn-action delete" 
                                    onClick={() => deleteHandler(movie._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default MovieListPageAdmin;