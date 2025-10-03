import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await api.get('/users/dashboard');
                setStats(statsRes.data);
                const usersRes = await api.get('/users');
                setUsers(usersRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ border: '1px solid black', padding: '1rem' }}>Total Users: {stats.totalUsers}</div>
                <div style={{ border: '1px solid black', padding: '1rem' }}>Total Stores: {stats.totalStores}</div>
                <div style={{ border: '1px solid black', padding: '1rem' }}>Total Ratings: {stats.totalRatings}</div>
            </div>
            <h3>All Users</h3>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                    <tr style={{background: '#f2f2f2'}}>
                        <th style={{padding: '8px', border: '1px solid #ddd'}}>Name</th>
                        <th style={{padding: '8px', border: '1px solid #ddd'}}>Email</th>
                        <th style={{padding: '8px', border: '1px solid #ddd'}}>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{padding: '8px', border: '1px solid #ddd'}}>{user.name}</td>
                            <td style={{padding: '8px', border: '1px solid #ddd'}}>{user.email}</td>
                            <td style={{padding: '8px', border: '1px solid #ddd'}}>{user.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
