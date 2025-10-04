import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Helper component for creating sortable table headers
const SortableHeader = ({ children, name, sortConfig, onSort }) => {
    const isSorted = sortConfig.key === name;
    const direction = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';
    return (
        <th onClick={() => onSort(name)} style={{ cursor: 'pointer' }}>
            {children} {direction}
        </th>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [storeOwners, setStoreOwners] = useState([]);
    const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
    const [storeFilters, setStoreFilters] = useState({ name: '', address: '' });
    const [userSortConfig, setUserSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [storeSortConfig, setStoreSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'normal_user' });
    const [newStore, setNewStore] = useState({ name: '', address: '', owner_id: '' });

    // Fetches static data like stats and the list of potential store owners
    const fetchStaticData = useCallback(async () => {
        try {
            const [statsRes, ownersRes] = await Promise.all([
                api.get('/users/dashboard'),
                api.get('/users?role=store_owner')
            ]);
            setStats(statsRes.data);
            setStoreOwners(ownersRes.data);
        } catch (err) {
            console.error("Error fetching static data:", err);
        }
    }, []);

    // Fetches the list of users based on current filters and sorting
    const fetchUsers = useCallback(async () => {
        const params = new URLSearchParams({
            ...userFilters,
            sortBy: userSortConfig.key,
            sortOrder: userSortConfig.direction === 'ascending' ? 'asc' : 'desc'
        }).toString();
        try {
            const res = await api.get(`/users?${params}`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    }, [userFilters, userSortConfig]);

    // Fetches the list of stores based on current filters and sorting
    const fetchStores = useCallback(async () => {
        const params = new URLSearchParams({
            ...storeFilters,
            sortBy: storeSortConfig.key,
            sortOrder: storeSortConfig.direction === 'ascending' ? 'asc' : 'desc'
        }).toString();
        try {
            const res = await api.get(`/stores?${params}`);
            setStores(res.data);
        } catch (err) {
            console.error("Error fetching stores:", err);
        }
    }, [storeFilters, storeSortConfig]);

    useEffect(() => {
        fetchStaticData();
    }, [fetchStaticData]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    // Handles changing the sort column or direction
    const handleSort = (key, type) => {
        let direction = 'ascending';
        const config = type === 'users' ? userSortConfig : storeSortConfig;
        const setConfig = type === 'users' ? setUserSortConfig : setStoreSortConfig;

        if (config.key === key && config.direction === 'ascending') {
            direction = 'descending';
        }
        setConfig({ key, direction });
    };

    const handleUserFilterChange = (e) => setUserFilters({ ...userFilters, [e.target.name]: e.target.value });
    const handleStoreFilterChange = (e) => setStoreFilters({ ...storeFilters, [e.target.name]: e.target.value });
    const handleNewUserChange = (e) => setNewUser({ ...newUser, [e.target.name]: e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value });
    const handleNewStoreChange = (e) => setNewStore({ ...newStore, [e.target.name]: e.target.value });

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            alert('User added successfully!');
            fetchStaticData();
            fetchUsers();
            setNewUser({ name: '', email: '', password: '', address: '', role: 'normal_user' });
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to add user.');
        }
    };

    const handleAddStore = async (e) => {
        e.preventDefault();
        try {
            await api.post('/stores', { ...newStore, owner_id: newStore.owner_id || null });
            alert('Store added successfully!');
            fetchStaticData();
            fetchStores();
            setNewStore({ name: '', address: '', owner_id: '' });
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to add store.');
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <div className="stats-grid">
                <div className="stat-item">Total Users: <strong>{stats.totalUsers}</strong></div>
                <div className="stat-item">Total Stores: <strong>{stats.totalStores}</strong></div>
                <div className="stat-item">Total Ratings: <strong>{stats.totalRatings}</strong></div>
            </div>

            <div className="forms-grid">
                <form onSubmit={handleAddUser} className="admin-form">
                    <h3>Add New User</h3>
                    <input type="text" name="name" value={newUser.name} onChange={handleNewUserChange} placeholder="Name" required />
                    <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} placeholder="Email" required />
                    <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} placeholder="Password" required />
                    <input type="text" name="address" value={newUser.address} onChange={handleNewUserChange} placeholder="Address" />
                    <select name="role" value={newUser.role} onChange={handleNewUserChange}>
                        <option value="normal_user">Normal User</option>
                        <option value="store_owner">Store Owner</option>
                        <option value="system_administrator">System Administrator</option>
                    </select>
                    <button type="submit">Add User</button>
                </form>

                <form onSubmit={handleAddStore} className="admin-form">
                    <h3>Add New Store</h3>
                    <input type="text" name="name" value={newStore.name} onChange={handleNewStoreChange} placeholder="Store Name" required />
                    <input type="text" name="address" value={newStore.address} onChange={handleNewStoreChange} placeholder="Store Address" />
                    <select name="owner_id" value={newStore.owner_id} onChange={handleNewStoreChange}>
                        <option value="">Assign an Owner (Optional)</option>
                        {storeOwners.map(owner => (
                            <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                        ))}
                    </select>
                    <button type="submit">Add Store</button>
                </form>
            </div>

            <div className="list-section">
                <h3>All Users</h3>
                <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="filter-controls">
                    <input type="text" name="name" value={userFilters.name} onChange={handleUserFilterChange} placeholder="Filter by Name" />
                    <input type="email" name="email" value={userFilters.email} onChange={handleUserFilterChange} placeholder="Filter by Email" />
                    <input type="text" name="address" value={userFilters.address} onChange={handleUserFilterChange} placeholder="Filter by Address" />
                    <select name="role" value={userFilters.role} onChange={handleUserFilterChange}>
                        <option value="">All Roles</option>
                        <option value="normal_user">Normal User</option>
                        <option value="store_owner">Store Owner</option>
                        <option value="system_administrator">System Administrator</option>
                    </select>
                    <button type="submit">Filter Users</button>
                </form>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <SortableHeader name="name" sortConfig={userSortConfig} onSort={(key) => handleSort(key, 'users')}>Name</SortableHeader>
                                <SortableHeader name="email" sortConfig={userSortConfig} onSort={(key) => handleSort(key, 'users')}>Email</SortableHeader>
                                <SortableHeader name="address" sortConfig={userSortConfig} onSort={(key) => handleSort(key, 'users')}>Address</SortableHeader>
                                <SortableHeader name="role" sortConfig={userSortConfig} onSort={(key) => handleSort(key, 'users')}>Role</SortableHeader>
                                <SortableHeader name="store_rating" sortConfig={userSortConfig} onSort={(key) => handleSort(key, 'users')}>Store Rating</SortableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.address || 'N/A'}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{user.role.replace(/_/g, ' ')}</td>
                                    <td>{user.role === 'store_owner' ? parseFloat(user.store_rating).toFixed(2) : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="list-section">
                <h3>All Stores</h3>
                <form onSubmit={(e) => { e.preventDefault(); fetchStores(); }} className="filter-controls">
                    <input type="text" name="name" value={storeFilters.name} onChange={handleStoreFilterChange} placeholder="Filter by Name" />
                    <input type="text" name="address" value={storeFilters.address} onChange={handleStoreFilterChange} placeholder="Filter by Address" />
                    <button type="submit">Filter Stores</button>
                </form>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <SortableHeader name="name" sortConfig={storeSortConfig} onSort={(key) => handleSort(key, 'stores')}>Name</SortableHeader>
                                <SortableHeader name="address" sortConfig={storeSortConfig} onSort={(key) => handleSort(key, 'stores')}>Address</SortableHeader>
                                <SortableHeader name="owner_email" sortConfig={storeSortConfig} onSort={(key) => handleSort(key, 'stores')}>Owner Email</SortableHeader>
                                <SortableHeader name="overall_rating" sortConfig={storeSortConfig} onSort={(key) => handleSort(key, 'stores')}>Overall Rating</SortableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store.id}>
                                    <td>{store.name}</td>
                                    <td>{store.address || 'N/A'}</td>
                                    <td>{store.owner_email || 'Unassigned'}</td>
                                    <td>{parseFloat(store.overall_rating).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
