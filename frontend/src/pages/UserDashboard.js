import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// A reusable, interactive star rating component with hover effects
const StarRating = ({ rating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div
            className="star-rating"
            onMouseLeave={() => setHoverRating(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const displayRating = hoverRating || rating;
                return (
                    <span
                        key={star}
                        className={star <= displayRating ? 'star filled' : 'star'}
                        onClick={() => onRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

const UserDashboard = () => {
    const [stores, setStores] = useState([]);
    const [filters, setFilters] = useState({ name: '', address: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // Fetches stores based on current filters and sorting configuration
    const fetchStores = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                ...filters,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction === 'ascending' ? 'asc' : 'desc',
            }).toString();
            const { data } = await api.get(`/stores?${params}`);
            setStores(data);
        } catch (err) {
            console.error(err);
        }
    }, [filters, sortConfig]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleRating = async (storeId, rating) => {
        try {
            await api.post(`/stores/${storeId}/ratings`, { rating });
            fetchStores();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Find and Rate Stores</h2>
                <form onSubmit={(e) => { e.preventDefault(); fetchStores(); }} className="dashboard-filters">
                    <input type="text" name="name" placeholder="Search by Store Name..." value={filters.name} onChange={handleFilterChange} />
                    <input type="text" name="address" placeholder="Search by Address..." value={filters.address} onChange={handleFilterChange} />
                    <button type="submit">Search</button>
                </form>
            </header>

            <div className="sort-controls">
                <span>Sort by:</span>
                <button onClick={() => handleSort('name')} className={sortConfig.key === 'name' ? 'active' : ''}>Name</button>
                <button onClick={() => handleSort('overall_rating')} className={sortConfig.key === 'overall_rating' ? 'active' : ''}>Rating</button>
            </div>

            <div className="store-grid">
                {stores.length > 0 ? stores.map(store => (
                    <div key={store.id} className="store-card">
                        <h3>{store.name}</h3>
                        <p className="store-address">{store.address || 'N/A'}</p>
                        
                        <div className="rating-display">
                            <label>Overall Rating</label>
                            <div className="star-rating static">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} className={star <= Math.round(store.overall_rating) ? 'star filled' : 'star'}>★</span>
                                ))}
                            </div>
                            <span>({parseFloat(store.overall_rating).toFixed(2)})</span>
                        </div>

                        <div className="rating-display user-rating">
                            <label>Your Rating</label>
                            <StarRating rating={store.user_submitted_rating} onRate={(rating) => handleRating(store.id, rating)} />
                        </div>
                    </div>
                )) : (
                    <p className="no-results-message">No stores found.</p>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
