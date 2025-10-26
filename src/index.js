import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          payment: 'Payment',
          selectedSeats: 'Selected Seats',
          pricePerSeat: 'Price per Seat',
          totalPrice: 'Total Price',
          selectPaymentMethod: 'Select Payment Method',
          online: 'Online',
          pay: 'Pay',
          payWithWallet: 'Pay with Wallet',
          processing: 'Processing...',
          proceedToPayment: 'Proceed to Payment',
          demoMode: 'Demo Mode',
          myTicketsBookings: 'My Tickets & Bookings',
          wallet: 'Wallet',
          balance: 'Balance',
          loyaltyPoints: 'Loyalty Points',
          membershipTier: 'Membership Tier',
          topUpWallet: 'Top Up Wallet',
          // --- FIX: Removed the 3 duplicate lines that were here ---
          topUp: 'Top Up',
          noBookings: 'No bookings found.',
          findMovie: 'Find a Movie',
          bookingId: 'Booking ID',
          status: 'Status',
          seats: 'Seats',
          total: 'Total',
          bookedOn: 'Booked On',
          eTicket: 'E-Ticket',
          cancelBooking: 'Cancel Booking',
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();