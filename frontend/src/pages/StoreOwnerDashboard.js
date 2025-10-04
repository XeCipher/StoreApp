import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StoreOwnerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/stores/owner/dashboard');
                setDashboardData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <p className="loading-message">Loading dashboard...</p>;
    if (!dashboardData) return <p className="no-results-message">You have not been assigned to a store. Please contact an administrator.</p>;

    return (
        <div className="dashboard-container">
             <header className="dashboard-header">
                <h2>Your Store Dashboard</h2>
            </header>
            <div className="owner-stat-card">
                <label>Average Store Rating</label>
                <strong>{dashboardData.averageRating}</strong>
                <span>based on {dashboardData.usersWhoRated.length} rating(s)</span>
            </div>

            <div className="list-section">
                <h3>Users Who Rated Your Store</h3>
                {dashboardData.usersWhoRated.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.usersWhoRated.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-results-message">Your store has not received any ratings yet.</p>
                )}
            </div>
        </div>
    );
};

export default StoreOwnerDashboard;
