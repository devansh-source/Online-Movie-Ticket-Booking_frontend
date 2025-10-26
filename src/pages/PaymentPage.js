import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import api from '../utils/axiosConfig';

// Check if Stripe key is available before loading
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
    : Promise.resolve(null);

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
            <button type="submit" disabled={!stripe || loading} className="btn-pay">
                {loading ? t('processing') : `${t('pay')} ₹${totalPrice}`}
            </button>
        </form>
    );
};

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Assume data passed via navigate state or props
    const { selectedSeats, movie, showtime, pendingBookingId } = location.state || {};
    const seatPrice = 500; // Base price per ticket
    const totalPrice = (selectedSeats?.length * seatPrice).toFixed(2) || '0.00';

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [bookingError, setBookingError] = useState('');
    const [loading, setLoading] = useState(false);

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
                paymentMethod: 'online',
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

    // Validate required data before rendering payment options
    if (!selectedSeats || selectedSeats.length === 0 || !pendingBookingId) {
        return <div className="error-message">Invalid booking data. Please go back and select seats again.</div>;
    }

    return (
        <div className="payment-page-container">
            <h2>{t('payment')}</h2>
            <div className="booking-summary">
                <p>{t('selectedSeats')}: <span className="summary-seats">{selectedSeats.join(', ')}</span></p>
                <p>{t('pricePerSeat')}: ₹{seatPrice.toFixed(2)}</p>
                <h3>{t('totalPrice')}: <span className="summary-price">₹{totalPrice}</span></h3>
            </div>

            {bookingError && <p className="error-message-small">{bookingError}</p>}

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
                        {loading ? t('processing') : `${t('pay')} $${totalPrice} (${t('demoMode')})`}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
