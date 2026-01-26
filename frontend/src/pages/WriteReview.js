import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import '../styles/WriteReview.css';

const WriteReview = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      if (productId && productId !== 'demo') {
        await reviewService.createReview({
          productId,
          rating,
          comment: comment.trim(),
        });
        alert('Đánh giá của bạn đã được gửi thành công');
        navigate(-1);
      } else {
        alert('Đánh giá của bạn đã được gửi thành công');
        navigate(-1);
      }
    } catch (error) {
      setError(error.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className="star-button"
            onClick={() => setRating(star)}
          >
            <span className={star <= rating ? 'star-filled' : 'star-empty'}>
              ★
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="write-review-container">
      <div className="write-review-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h1 className="header-title">Viết đánh giá</h1>
        <div className="header-placeholder"></div>
      </div>

      <div className="write-review-content">
        <div className="form-section">
          <label className="form-label">Đánh giá của bạn</label>
          {renderStars()}
        </div>

        <div className="form-section">
          <label className="form-label">Nội dung đánh giá</label>
          <textarea
            className="comment-input"
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={8}
          />
        </div>

        <div className="hint-text">
          Đánh giá của bạn sẽ giúp người khác đưa ra quyết định mua hàng tốt hơn.
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="button-container">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  );
};

export default WriteReview;
