import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminRoute = () => {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.user?.role === 'system_administrator';
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
