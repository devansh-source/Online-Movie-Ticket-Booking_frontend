import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();

    // Ensure you have a valid poster URL before displaying
    const posterUrl = movie.posterUrl || '/placeholder.jpg';

    const handleImageError = (e) => {
        e.target.src = '/placeholder.jpg'; // Fallback to a local placeholder image
    };

    return (
        <div className="movie-card" onClick={() => navigate(`/movie/${movie._id}`)}>
            <img src={posterUrl} alt={movie.title} className="movie-poster" onError={handleImageError} />
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>Genre: {movie.genre || 'N/A'}</p>
                <button className="book-btn">View Showtimes</button>
            </div>
        </div>
    );
};

export default MovieCard;