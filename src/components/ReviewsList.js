import React from 'react';

const ReviewsList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <p>No reviews yet. Be the first to review!</p>;
    }

    return (
        <div className="reviews-list">
            <h3>Reviews</h3>
            {reviews.map((review) => (
                <div key={review._id} className="review-item">
                    <div className="review-header">
                        <strong>{review.userId.name}</strong>
                        <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p>{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewsList;
