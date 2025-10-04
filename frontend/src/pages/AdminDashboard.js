import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    // State for stats, lists, forms, and the new owners list
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [storeOwners, setStoreOwners] = useState([]);
    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'normal_user' });
    const [newStore, setNewStore] = useState({ name: '', address: '', owner_id: '' }); // Add owner_id to state

    // Fetch all necessary data on component load
    const fetchDashboardData = useCallback(async () => {
        try {
            const statsRes = await api.get('/users/dashboard');
            setStats(statsRes.data);
            
            // Fetch all users for the main list
            const usersRes = await api.get('/users');
            setUsers(usersRes.data);

            // Fetch only store owners for the dropdown
            const ownersRes = await api.get('/users?role=store_owner');
            setStoreOwners(ownersRes.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Fetch filtered users
    const fetchFilteredUsers = async () => {
        try {
            const params = new URLSearchParams(filters).toString();
            const usersRes = await api.get(`/users?${params}`);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchFilteredUsers();
    };

    const handleNewUserChange = (e) => setNewUser({ ...newUser, [e.target.name]: e.target.value });
    const handleNewStoreChange = (e) => setNewStore({ ...newStore, [e.target.name]: e.target.value });

    // Form submission handlers
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            alert('User added successfully!');
            fetchDashboardData(); // Refresh all data
            setNewUser({ name: '', email: '', password: '', address: '', role: 'normal_user' });
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to add user.');
        }
    };

    const handleAddStore = async (e) => {
        e.preventDefault();
        // Prepare store data, ensuring owner_id is null if not selected
        const storeData = {
            name: newStore.name,
            address: newStore.address,
            owner_id: newStore.owner_id || null,
        };
        try {
            await api.post('/stores', storeData);
            alert('Store added successfully!');
            fetchDashboardData();
            setNewStore({ name: '', address: '', owner_id: '' });
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to add store.');
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            {/* Stats Section */}
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ border: '1px solid black', padding: '1rem' }}>Total Users: {stats.totalUsers}</div>
                <div style={{ border: '1px solid black', padding: '1rem' }}>Total Stores: {stats.totalStores}</div>
                <div style={{ border: '1px solid black', padding: '1rem' }}>Total Ratings: {stats.totalRatings}</div>
            </div>

            {/* Forms Section */}
            <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0' }}>
                {/* Add User Form */}
                <form onSubmit={handleAddUser} style={{ flex: 1, border: '1px solid #ccc', padding: '1rem' }}>
                    <h3>Add New User</h3>
                    <input name="name" value={newUser.name} onChange={handleNewUserChange} placeholder="Name" required />
                    <input name="email" type="email" value={newUser.email} onChange={handleNewUserChange} placeholder="Email" required />
                    <input name="password" type="password" value={newUser.password} onChange={handleNewUserChange} placeholder="Password" required />
                    <input name="address" value={newUser.address} onChange={handleNewUserChange} placeholder="Address" />
                    <select name="role" value={newUser.role} onChange={handleNewUserChange}>
                        <option value="normal_user">Normal User</option>
                        <option value="store_owner">Store Owner</option>
                        <option value="system_administrator">System Administrator</option>
                    </select>
                    <button type="submit">Add User</button>
                </form>

                {/* 3. Update the "Add New Store" form with the dropdown */}
                <form onSubmit={handleAddStore} style={{ flex: 1, border: '1px solid #ccc', padding: '1rem' }}>
                    <h3>Add New Store</h3>
                    <input name="name" value={newStore.name} onChange={handleNewStoreChange} placeholder="Store Name" required />
                    <input name="address" value={newStore.address} onChange={handleNewStoreChange} placeholder="Store Address" />
                    <select name="owner_id" value={newStore.owner_id} onChange={handleNewStoreChange}>
                        <option value="">Assign an Owner (Optional)</option>
                        {storeOwners.map(owner => (
                            <option key={owner.id} value={owner.id}>
                                {owner.name} ({owner.email})
                            </option>
                        ))}
                    </select>
                    <button type="submit">Add Store</button>
                </form>
            </div>

            {/* User List Section */}
            <h3>All Users</h3>
            <form onSubmit={handleFilterSubmit}>
                <input name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by Name" />
                <input name="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by Email" />
                <select name="role" value={filters.role} onChange={handleFilterChange}>
                    <option value="">All Roles</option>
                    <option value="normal_user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="system_administrator">System Administrator</option>
                </select>
                <button type="submit">Filter</button>
            </form>

            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem'}}>
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
