import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import '../styles/ProductReviews.css';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'with_images', label: 'Có hình ảnh' },
  { key: '5', label: '★ 5 sao' },
  { key: 'newest', label: 'Mới nhất' },
];

const ProductReviews = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (productId) {
      fetchData();
    } else {
      // Demo data
      setStats({
        averageRating: 4.8,
        totalReviews: 1240,
        ratingDistribution: {
          '5': 75,
          '4': 15,
          '3': 5,
          '2': 3,
          '1': 2
        }
      });
      setReviews([
        {
          _id: '1',
          user: { name: 'Lê Minh Tuấn' },
          rating: 5,
          comment: 'NovaBook Pro chạy cực kỳ mượt mà, màn hình 4K hiển thị màu sắc rất trung thực. Build hoàn thiện cao cấp, vỏ nhôm cầm rất chắc tay. Rất đáng tiền cho dân đồ họa!',
          images: ['https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg', 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg', 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg'],
          helpfulCount: 12,
          verifiedPurchase: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          user: { name: 'Nguyễn Thị Hoa' },
          rating: 5,
          comment: 'Laptop thiết kế mỏng nhẹ, pin trâu đúng như mô tả. Giao hàng cực nhanh, mình ở HCM đặt sáng chiều có luôn. Rất hài lòng với dịch vụ NovaTech.',
          helpfulCount: 5,
          verifiedPurchase: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          user: { name: 'Trần Văn Đức' },
          rating: 5,
          comment: 'Hiệu năng tốt trong tầm giá, chiến game phà phà. Tuy nhiên máy hơi nóng khi render video dài, quạt tản nhiệt hơi ồn xíu nhưng không đáng kể.',
          helpfulCount: 2,
          verifiedPurchase: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoading(false);
    }
  }, [productId, activeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getProductReviews(productId, activeFilter === 'all' ? null : activeFilter, activeFilter === 'newest' ? 'newest' : null),
        reviewService.getProductReviewStats(productId)
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
    return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  };

  const handleHelpful = async (reviewId) => {
    try {
      if (productId) {
        await reviewService.markHelpful(reviewId);
        fetchData();
      } else {
        alert('Đã đánh dấu hữu ích');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReply = (reviewId) => {
    alert('Tính năng phản hồi đang phát triển');
  };

  const renderRatingBar = (rating, percentage) => {
    return (
      <div key={rating} className="rating-bar-row">
        <span className="rating-label">{rating} sao</span>
        <div className="rating-bar-container">
          <div className="rating-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="rating-percentage">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="product-reviews-container">
      {/* Header */}
      <div className="reviews-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h1 className="header-title">Đánh giá sản phẩm</h1>
        <button className="share-button">🔗</button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading">Đang tải...</div>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          {stats && (
            <div className="rating-summary">
              <div className="average-rating">{stats.averageRating}</div>
              {renderStars(stats.averageRating)}
              <div className="total-reviews">{stats.totalReviews.toLocaleString('vi-VN')} đánh giá</div>
            </div>
          )}

          {/* Rating Distribution */}
          {stats && (
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) =>
                renderRatingBar(rating, stats.ratingDistribution[rating.toString()] || 0)
              )}
            </div>
          )}

          {/* Filters */}
          <div className="filters-container">
            <div className="filters-wrapper">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  className={`filter-button ${activeFilter === filter.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="avatar">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="reviewer-details">
                      <div className="reviewer-name">{review.user?.name || 'Người dùng'}</div>
                      {review.verifiedPurchase && (
                        <div className="verified-badge">
                          ✓ <span>ĐÃ MUA HÀNG</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="time-ago">{formatTimeAgo(review.createdAt)}</span>
                </div>

                {renderStars(review.rating)}

                <div className="review-comment">{review.comment}</div>

                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.slice(0, 3).map((image, index) => (
                      <img key={index} src={image} alt="Review" className="review-image" />
                    ))}
                    {review.images.length > 3 && (
                      <div className="more-images">+{review.images.length - 3}</div>
                    )}
                  </div>
                )}

                <div className="review-actions">
                  <button
                    className="helpful-button"
                    onClick={() => handleHelpful(review._id)}
                  >
                    👍 Hữu ích ({review.helpfulCount || 0})
                  </button>
                  <button
                    className="reply-button"
                    onClick={() => handleReply(review._id)}
                  >
                    💬 Phản hồi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Write Review Button */}
      <div className="write-button-container">
        <button
          className="write-button"
          onClick={() => navigate(`/write-review/${productId || 'demo'}`)}
        >
          ✏️ Viết đánh giá của bạn
        </button>
      </div>
    </div>
  );
};

export default ProductReviews;
