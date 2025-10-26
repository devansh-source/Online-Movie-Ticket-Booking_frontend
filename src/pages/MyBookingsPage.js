import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
    : Promise.resolve(null);

const WalletTopUpForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        try {
            let userInfo = null;
            try {
                userInfo = JSON.parse(localStorage.getItem('userInfo'));
            } catch (e) {
                console.warn('localStorage access blocked or invalid data');
            }
            if (!userInfo || !userInfo.token) {
                alert('User not authenticated. Please log in again.');
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            if (stripe && elements) {
                const cardElement = elements.getElement(CardElement);
                const { error, token } = await stripe.createToken(cardElement);
                if (error) {
                    alert(error.message);
                    setLoading(false);
                    return;
                }
                await api.post('/bookings/add-to-wallet', { amount: parseFloat(amount), stripeToken: token.id }, config);
            } else {
                // For demo purposes, allow top-up without Stripe
                await api.post('/bookings/add-to-wallet', { amount: parseFloat(amount) }, config);
            }

            alert('Wallet topped up successfully!');
            window.location.reload();
        } catch (err) {
            alert('Failed to top up wallet.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="wallet-form">
            <h3>{t('topUpWallet')}</h3>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
            {stripe && <CardElement />}
            <button type="submit" disabled={loading} className="btn-topup">{loading ? 'Processing...' : t('topUp')}</button>
        </form>
    );
};

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [wallet, setWallet] = useState({ walletBalance: 0, loyaltyPoints: 0, membershipTier: 'Basic' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let userInfo = null;
                try {
                    userInfo = JSON.parse(localStorage.getItem('userInfo'));
                } catch (e) {
                    console.warn('localStorage access blocked or invalid data');
                }

                if (!userInfo || !userInfo.token) {
                    alert('You need to be logged in to view your bookings.');
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };

                const [bookingsRes, walletRes] = await Promise.all([
                    api.get('/bookings/mybookings', config),
                    api.get('/bookings/wallet-balance', config)
                ]);
                setBookings(bookingsRes.data);
                setWallet(walletRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                const message = err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to fetch data.';
                setError(message);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
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
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await api.post('/bookings/cancel', { bookingId }, config);
            alert('Booking canceled and refunded.');
            window.location.reload();
        } catch (err) {
            alert('Failed to cancel booking.');
        }
    };

    if (loading) return <div className="loading-message">Loading bookings...</div>;
    if (error) return <div className="alert-error my-bookings-container">{error}</div>;

    return (
        <div className="my-bookings-container">
            <h1>{t('myTicketsBookings')}</h1>
            <div className="wallet-section">
                <h2>{t('wallet')}</h2>
                <p>{t('balance')}: ₹{wallet.walletBalance.toFixed(2)}</p>
                <p>{t('loyaltyPoints')}: {wallet.loyaltyPoints}</p>
                <p>{t('membershipTier')}: {wallet.membershipTier}</p>
                <Elements stripe={stripePromise}>
                    <WalletTopUpForm />
                </Elements>
            </div>
            {bookings.length === 0 ? (
                <div className="no-bookings-message">
                    <p>{t('noBookings')}</p>
                    <button className="btn-primary" onClick={() => navigate('/movies')}>{t('findMovie')}</button>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            {booking.movieId?.posterUrl && (
                                <img
                                    src={booking.movieId.posterUrl}
                                    alt={booking.movieId.title}
                                    className="booking-poster"
                                    onError={(e) => e.target.src = '/placeholder.jpg'}
                                />
                            )}
                            <div className="booking-details">
                                <h3>{booking.movieId?.title || 'Unknown Movie'}</h3>

                                <div className="booking-detail-item">
                                    <strong>{t('bookingId')}:</strong> <span>{booking._id.slice(-6)}</span>
                                </div>
                                <div className="booking-detail-item">
                                    <strong>{t('status')}:</strong> <span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                                </div>

                                <div className="booking-detail-item">
                                    <strong>{t('seats')}:</strong>
                                    <span>{booking.seatsBooked && booking.seatsBooked.length > 0 ? booking.seatsBooked.join(', ') : 'N/A'}</span>
                                </div>

                                <div className="booking-detail-item booking-total">
                                    <strong>{t('total')}:</strong> <span>₹{booking.totalPrice?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="booking-detail-item">
                                    <strong>{t('bookedOn')}:</strong> <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.qrCodeUrl && (
                                    <div className="booking-detail-item">
                                        <strong>{t('eTicket')}:</strong>
                                        <img src={booking.qrCodeUrl} alt="QR Code" className="qr-code" />
                                    </div>
                                )}
                                {booking.status === 'Confirmed' && (
                                    <button onClick={() => handleCancelBooking(booking._id)} className="btn-cancel">{t('cancelBooking')}</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;