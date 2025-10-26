import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import SeatSelector from '../components/SeatSelector'; // Import the new component

const MovieDetailPage = () => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const { id } = useParams(); // Gets the movie ID from the URL
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const { data } = await api.get(`/movies/${id}`);
                setMovie(data);
                setLoading(false);
            } catch (err) {
                setError('Movie not found or server error.');
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    const handleShowtimeSelect = (showtime) => {
        // When a user selects a showtime, store it in state
        setSelectedShowtime(showtime);
        window.scrollTo(0, document.body.scrollHeight); // Scroll down to seat selector
    };

    if (loading) return <div className="loading">Loading movie details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!movie) return <div className="not-found">Movie not available.</div>;

    // --- Good CSS Styling Placeholder Classes ---

    const handleImageError = (e) => {
        e.target.src = '/placeholder.jpg'; // Fallback to a local placeholder image
    };

    return (
        <div className="movie-detail-page">
            <div className="detail-header">
                <img src={movie.posterUrl} alt={movie.title} className="detail-poster" onError={handleImageError} />
                <div className="detail-info">
                    <h1>{movie.title}</h1>
                    <p className="detail-genre">Genre: {movie.genre}</p>
                    <p className="detail-duration">Duration: {movie.duration} minutes</p>
                    <p className="detail-description">{movie.description}</p>
                </div>
            </div>

            <div className="showtime-section">
                <h2>Available Showtimes</h2>
                <div className="showtime-list">
                    {movie.showtimes.map((showtime) => (
                        <button
                            key={showtime._id}
                            className={`showtime-btn ${selectedShowtime?._id === showtime._id ? 'selected' : ''}`}
                            onClick={() => handleShowtimeSelect(showtime)}
                        >
                            <span className="showtime-time">{showtime.time}</span>
                            <span className="showtime-date">{new Date(showtime.date).toLocaleDateString()}</span>
                            <span className="showtime-screen">{showtime.screenDetails?.screenName || 'Screen N/A'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {selectedShowtime && (
                <SeatSelector 
                    movie={movie} 
                    showtime={selectedShowtime} 
                    navigate={navigate}
                />
            )}
        </div>
    );
};

export default MovieDetailPage;