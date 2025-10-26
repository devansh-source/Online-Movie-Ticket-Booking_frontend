import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig'; 
import MovieCard from '../components/MovieCard'; // <--- FIX: IMPORT MISSING COMPONENT

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await api.get('/movies'); 
                setMovies(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load movies. Server error.');
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    if (loading) return <h2>Loading Movies...</h2>;
    if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

    return (
        <div className="homepage-container">
            <h1>Now Showing</h1>
            <div className="movie-list-grid">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} /> 
                    ))
                ) : (
                    <h2>No movies currently available.</h2>
                )}
            </div>
        </div>
    );
};

export default HomePage;