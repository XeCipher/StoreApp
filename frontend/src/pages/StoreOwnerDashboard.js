import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StoreOwnerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/stores/owner/dashboard');
        setDashboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!dashboard) return <p>You are not assigned to a store.</p>

  return (
    <div>
      <h2>Store Dashboard</h2>
      <h3>Average Rating: {dashboard.averageRating}</h3>
      <h4>Users Who Rated Your Store:</h4>
      <ul>
        {dashboard.usersWhoRated.map((user, index) => (
          <li key={index}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
};

export default StoreOwnerDashboard;
