import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage';
import MyBookingsPage from './pages/MyBookingsPage'; 
import MovieListPageAdmin from './pages/MovieListPageAdmin'; 
import AdminDashboard from './pages/AdminDashboard'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // KEEPING
import ResetPasswordPage from './pages/ResetPasswordPage'; // KEEPING

function App() {
    return (
        <Router>
            <Header />
            <main className="main-content-area">
                <Routes>
                    {/* Public & User Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movies" element={<HomePage />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} /> 
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/mybookings" element={<MyBookingsPage />} /> 
                    
                    {/* --- Password Reset Routes (KEPT) --- */}
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                    {/* --- Admin Routes --- */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
                    <Route path="/admin/movielist" element={<MovieListPageAdmin />} /> 
                </Routes>
            </main>
        </Router>
    );
}

export default App;