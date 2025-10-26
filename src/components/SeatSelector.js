import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import io from 'socket.io-client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
    : Promise.resolve(null);
// --- FIX: Dynamically set Socket.IO URL for production/development ---
const SOCKET_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || '/')
    : 'http://localhost:5000';
const PaymentForm = ({ totalPrice, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        const cardElement = elements.getElement(CardElement);
        const { error, token } = await stripe.createToken(cardElement);
        if (error) {
            onPaymentError(error.message);
            setLoading(false);
            return;
        }
        onPaymentSuccess(token.id);
        setLoading(false);
    };
    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <CardElement />
            <button type="submit" disabled={!stripe || loading}>
                {loading ? t('processing') : `${t('pay')} $${totalPrice}`}
            </button>
        </form>
    );
};
const seatPrice = 500; // Base price per ticket in INR
const SeatSelector = ({ movie, showtime, navigate }) => {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [socket, setSocket] = useState(null); // eslint-disable-line no-unused-vars
    const [pendingSeats, setPendingSeats] = useState(new Set(showtime.pendingSeats || []));
    const [bookedSeats, setBookedSeats] = useState(new Set(showtime.bookedSeats || []));
    const [pendingBookingId, setPendingBookingId] = useState(null);
    
    // --- FIX: Changed from 'useState' to 'const' since it never changes ---
    const paymentMethod = 'online'; 
    
    const [showPayment, setShowPayment] = useState(false);
    const { t } = useTranslation();
    // Extract dynamic screen dimensions
    const { rows, cols, screenName } = showtime.screenDetails;
    const totalPrice = (selectedSeats.length * seatPrice).toFixed(2);
    // Socket.IO setup
    useEffect(() => {
        // --- FIX: Use dynamic SOCKET_URL ---
        const newSocket = io(SOCKET_URL); 
        setSocket(newSocket);
        newSocket.emit('join-showtime', showtime._id);
        newSocket.on('seat-update', (data) => {
            setPendingSeats(new Set(data.pendingSeats || []));
            setBookedSeats(new Set(data.bookedSeats || []));
        });
        return () => newSocket.close();
    }, [showtime._id]);
    
    // Helper to generate seat labels (A1, A2, B1, B2...)
    const getRowLabel = (index) => String.fromCharCode(65 + index); // 65 is 'A'
    // --- Utility Functions ---
    const getSeatId = (rowLabel, number) => `${rowLabel}${number}`;
    
    const isSeatAvailable = (seatId) => !bookedSeats.has(seatId) && !pendingSeats.has(seatId);
    const toggleSeatSelection = async (seatId) => {
        if (!isSeatAvailable(seatId)) return;
        let userInfo = null;
        try {
            userInfo = JSON.parse(localStorage.getItem('userInfo'));
        } catch (e) {
            console.warn('localStorage access blocked or invalid data');
        }
        if (!userInfo || !userInfo.token) {
            alert('Please log in to select seats.');
            navigate('/login');
            return;
        }
        setSelectedSeats(prev => {
            const isSelected = prev.includes(seatId);
            if (isSelected) {
                // Deselect: release seat
                setPendingSeats(prevPending => {
                    const newPending = new Set(prevPending);
                    newPending.delete(seatId);
                    return newPending;
                });
                return prev.filter(s => s !== seatId);
            } else {
                // Select: lock seat
                setPendingSeats(prevPending => new Set([...prevPending, seatId]));
                return [...prev, seatId];
            }
        });
        // Lock/release seats on backend
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            if (selectedSeats.includes(seatId)) {
                // Release
                await api.delete('/bookings/release-seats', {
                    ...config,
                    data: { movieId: movie._id, showtimeId: showtime._id, seatsToRelease: [seatId] }
                });
            } else {
                // Lock
                const res = await api.post('/bookings/lock-seats', {
                    movieId: movie._id,
                    showtimeId: showtime._id,
                    seatsToLock: [seatId]
                }, config);
                setPendingBookingId(res.data.pendingBookingId);
            }
        } catch (error) {
            setBookingError('Failed to lock/release seat. Please try again.');
            // Revert UI
            setSelectedSeats(prev => prev.filter(s => s !== seatId));
            setPendingSeats(prevPending => {
                const newPending = new Set(prevPending);
                newPending.delete(seatId);
                return newPending;
            });
        }
    };
    // --- Ticket Booking & Payment Gateway ---
    const handleProceedToPayment = () => {
        if (selectedSeats.length === 0) {
            setBookingError('Please select at least one seat.');
            return;
        }
        setShowPayment(true);
    };
    const handlePaymentSuccess = async (stripeToken) => {
        setLoading(true);
        setBookingError('');
        try {
            let userInfo = null;
            try {
                userInfo = JSON.parse(localStorage.getItem('userInfo'));
            } catch (e) {
                console.warn('localStorage access blocked or invalid data');
            }
            if (!userInfo || !userInfo.token) {
                setBookingError('User not authenticated. Please log in again.');
                return;
            }
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const confirmPayload = {
                pendingBookingId,
                totalPrice: parseFloat(totalPrice),
                paymentMethod,
                stripeToken,
            };
            const res = await api.post('/bookings/confirm-booking', confirmPayload, config);
            alert('Booking successful! QR code generated.');
            if (res.data.qrCodeUrl) {
                console.log('QR Code URL:', res.data.qrCodeUrl);
            }
            navigate('/mybookings');
        } catch (error) {
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : 'Booking failed due to server error or seat conflict.';
            setBookingError(message);
        } finally {
            setLoading(false);
        }
    };
    const handlePaymentError = (errorMessage) => {
        setBookingError(errorMessage);
    };
    // --- Rendering ---
    const renderSeat = (rowLabel, number) => {
        const seatId = getSeatId(rowLabel, number);
        const isSelected = selectedSeats.includes(seatId);
        const isBooked = bookedSeats.has(seatId);
        const isPending = pendingSeats.has(seatId);
        let seatClass = 'seat';
        if (isBooked) seatClass += ' booked';
        else if (isPending) seatClass += ' pending';
        else if (isSelected) seatClass += ' selected';
        else seatClass += ' available';
        // --- FIX: Set grid column to 'number + 1' to account for the label column ---
        const gridStyle = {
            gridColumn: number + 1,
        };
        return (
            <div
                key={seatId}
                className={seatClass}
                style={gridStyle}
                onClick={() => toggleSeatSelection(seatId)}
            >
                {rowLabel}
            </div>
        );
    };
    return (
        <div className="seat-selector-container">
            <h2>Select Your Seats for {screenName}</h2>
            <div className="screen-indicator">Screen</div>
            {/* Seat Map Grid */}
            <div className="seat-map-wrapper">
                {/* --- FIX: Set template columns to 'auto' (for labels) + 'repeat(cols, 1fr)' (for seats) --- */}
                <div className="seat-grid" style={{ gridTemplateColumns: `auto repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: rows }, (_, rowIndex) => {
                        const rowLabel = getRowLabel(rowIndex);
                        return (
                            <React.Fragment key={rowLabel}>
                                {/* --- FIX: Explicitly place label in column 1 --- */}
                                <div className="row-label" style={{ gridColumn: 1 }}>{rowLabel}</div> 
                                {/* Seats for the Row */}
                                {Array.from({ length: cols }, (_, colIndex) => colIndex + 1).map(number =>
                                    renderSeat(rowLabel, number)
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {/* Legend */}
            <div className="seat-legend">
                <div className="legend-item"><span className="legend-box available"></span> Available</div>
                <div className="legend-item"><span className="legend-box selected"></span> Selected</div>
                <div className="legend-item"><span className="legend-box pending"></span> Pending</div>
                <div className="legend-item"><span className="legend-box booked"></span> Booked</div>
            </div>
            <div className="booking-summary">
                <p>{t('selectedSeats')}: <span className="summary-seats">{selectedSeats.join(', ') || 'None'}</span></p>
                <p>{t('pricePerSeat')}: ₹{seatPrice.toFixed(2)}</p>
                <h3>{t('totalPrice')}: <span className="summary-price">₹{totalPrice}</span></h3>
                {bookingError && <p className="error-message-small">{bookingError}</p>}
                {!showPayment ? (
                    <button
                        className="btn-book-final"
                        onClick={handleProceedToPayment}
                        disabled={loading || selectedSeats.length === 0}
                    >
                        {t('proceedToPayment')}
                    </button>
                ) : (
                    <div className="payment-section">
                        <h4>Online Payment</h4>
                        {process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? (
                            <Elements stripe={stripePromise}>
                                <PaymentForm
                                    totalPrice={totalPrice}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onPaymentError={handlePaymentError}
                                />
                            </Elements>
                        ) : (
                            <button onClick={() => handlePaymentSuccess(null)} className="btn-pay-direct" disabled={loading}>
                                {loading ? t('processing') : `${t('pay')} ₹${totalPrice}`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default SeatSelector;