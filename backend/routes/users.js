const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// GET /api/users - Get all users with filtering and sorting
router.get('/', [auth, adminOnly], async (req, res) => {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Whitelist valid columns for sorting to prevent SQL injection
    const validSortColumns = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role', store_rating: 'store_rating' };
    const orderByColumn = validSortColumns[sortBy] || 'u.name';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
        SELECT
            u.id, u.name, u.email, u.address, u.role,
            COALESCE(AVG(r.rating), 0) as store_rating
        FROM users u
        LEFT JOIN stores s ON u.id = s.owner_id
        LEFT JOIN ratings r ON s.id = r.store_id
    `;
    const conditions = [];
    const params = [];

    if (name) { params.push(`%${name}%`); conditions.push(`u.name ILIKE $${params.length}`); }
    if (email) { params.push(`%${email.toLowerCase()}%`); conditions.push(`u.email ILIKE $${params.length}`); }
    if (address) { params.push(`%${address}%`); conditions.push(`u.address ILIKE $${params.length}`); }
    if (role) { params.push(role); conditions.push(`u.role = $${params.length}`); }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` GROUP BY u.id ORDER BY ${orderByColumn} ${orderDirection}`;

    try {
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/users - Create a new user
router.post('/', [auth, adminOnly], async (req, res) => {
    let { name, email, password, address, role } = req.body;
    try {
        email = email.toLowerCase();
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) return res.status(400).json({ msg: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
            [name, email, password_hash, address, role]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET /api/users/dashboard - Get stats for the dashboard
router.get('/dashboard', [auth, adminOnly], async (req, res) => {
    try {
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const storeCount = await db.query('SELECT COUNT(*) FROM stores');
        const ratingCount = await db.query('SELECT COUNT(*) FROM ratings');
        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalStores: parseInt(storeCount.rows[0].count),
            totalRatings: parseInt(ratingCount.rows[0].count),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
