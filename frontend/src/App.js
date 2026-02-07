import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
<<<<<<< HEAD
import CancelOrder from './pages/CancelOrder';
import OrderHistory from './pages/OrderHistory';
import ProductReviews from './pages/ProductReviews';
import WriteReview from './pages/WriteReview';
=======
>>>>>>> origin/long
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
<<<<<<< HEAD
        <Route path="/cancel-order/:orderId" element={<CancelOrder />} />
        <Route path="/cancel-order" element={<CancelOrder />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/product-reviews/:productId" element={<ProductReviews />} />
        <Route path="/product-reviews" element={<ProductReviews />} />
        <Route path="/write-review/:productId" element={<WriteReview />} />
        <Route path="/write-review" element={<WriteReview />} />
=======
>>>>>>> origin/long
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
