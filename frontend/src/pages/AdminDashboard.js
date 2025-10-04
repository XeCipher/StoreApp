import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [users, setUsers] = useState([]);
    const [storeOwners, setStoreOwners] = useState([]);
    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'normal_user' });
    const [newStore, setNewStore] = useState({ name: '', address: '', owner_id: '' });

    // Fetches all necessary data on initial component load.
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const statsRes = await api.get('/users/dashboard');
                setStats(statsRes.data);

                const ownersRes = await api.get('/users?role=store_owner');
                setStoreOwners(ownersRes.data);

                const usersRes = await api.get('/users');
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };
        fetchInitialData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: name === 'email' ? value.toLowerCase() : value });
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams(filters).toString();
            const usersRes = await api.get(`/users?${params}`);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Error fetching filtered users:", err);
        }
    };

    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: name === 'email' ? value.toLowerCase() : value });
    };

    const handleNewStoreChange = (e) => setNewStore({ ...newStore, [e.target.name]: e.target.value });

    const refreshData = async () => {
        const statsRes = await api.get('/users/dashboard');
        setStats(statsRes.data);
        const ownersRes = await api.get('/users?role=store_owner');
        setStoreOwners(ownersRes.data);
        handleFilterSubmit(new Event('submit'));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            alert('User added successfully!');
            refreshData();
            setNewUser({ name: '', email: '', password: '', address: '', role: 'normal_user' });
        } catch (err) { alert(err.response?.data?.msg || 'Failed to add user.'); }
    };

    const handleAddStore = async (e) => {
        e.preventDefault();
        const storeData = { name: newStore.name, address: newStore.address, owner_id: newStore.owner_id || null };
        try {
            await api.post('/stores', storeData);
            alert('Store added successfully!');
            refreshData();
            setNewStore({ name: '', address: '', owner_id: '' });
        } catch (err) { alert(err.response?.data?.msg || 'Failed to add store.'); }
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <div className="stats-grid"><div className="stat-item">Total Users: <strong>{stats.totalUsers}</strong></div><div className="stat-item">Total Stores: <strong>{stats.totalStores}</strong></div><div className="stat-item">Total Ratings: <strong>{stats.totalRatings}</strong></div></div>
            <div className="forms-grid">
                <form onSubmit={handleAddUser} className="admin-form">
                    <h3>Add New User</h3>
                    <input type="text" name="name" value={newUser.name} onChange={handleNewUserChange} placeholder="Name" required />
                    <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} placeholder="Email" required />
                    <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} placeholder="Password" required />
                    <input type="text" name="address" value={newUser.address} onChange={handleNewUserChange} placeholder="Address" />
                    <select name="role" value={newUser.role} onChange={handleNewUserChange}><option value="normal_user">Normal User</option><option value="store_owner">Store Owner</option><option value="system_administrator">System Administrator</option></select>
                    <button type="submit">Add User</button>
                </form>
                <form onSubmit={handleAddStore} className="admin-form">
                    <h3>Add New Store</h3>
                    <input type="text" name="name" value={newStore.name} onChange={handleNewStoreChange} placeholder="Store Name" required />
                    <input type="text" name="address" value={newStore.address} onChange={handleNewStoreChange} placeholder="Store Address" />
                    <select name="owner_id" value={newStore.owner_id} onChange={handleNewStoreChange}><option value="">Assign an Owner (Optional)</option>{storeOwners.map(owner => (<option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>))}</select>
                    <button type="submit">Add Store</button>
                </form>
            </div>
            <div className="user-list">
                <h3>All Users</h3>
                <form onSubmit={handleFilterSubmit} className="filter-controls">
                    <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by Name" />
                    <input type="email" name="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by Email" />
                    <select name="role" value={filters.role} onChange={handleFilterChange}><option value="">All Roles</option><option value="normal_user">Normal User</option><option value="store_owner">Store Owner</option><option value="system_administrator">System Administrator</option></select>
                    <button type="submit">Filter</button>
                </form>
                <div className="table-container">
                    <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                        <tbody>
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{user.role.replace(/_/g, ' ')}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No users match the current filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
