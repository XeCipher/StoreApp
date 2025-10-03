import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const { data } = await api.get(`/stores?name=${searchTerm}`);
      setStores(data);
    } catch (err) {
      console.error(err);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  }

  const handleRating = async (storeId, rating) => {
    try {
      await api.post(`/stores/${storeId}/ratings`, { rating });
      fetchStores();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Stores</h2>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button type="submit">Search</button>
      </form>
      {stores.map(store => (
        <div key={store.id} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
          <h3>{store.name}</h3>
          <p>{store.address}</p>
          <p>Overall Rating: {Number(store.overall_rating).toFixed(2)}</p>
          <p>Your Rating: {store.user_submitted_rating || 'Not rated yet'}</p>
          <div>
            Rate: {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => handleRating(store.id, star)}>
                {star}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserDashboard;
