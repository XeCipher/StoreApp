import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import './App.css';

const Home = () => {
  const { auth } = useContext(AuthContext);
  if (!auth.user) return <Navigate to="/login" />;

  switch (auth.user.role) {
    case 'system_administrator':
      return <Navigate to="/admin/dashboard" />;
    case 'store_owner':
      return <Navigate to="/store-owner/dashboard" />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/store-owner/dashboard" element={<StoreOwnerDashboard />} />
            
            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
