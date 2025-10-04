const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/', [auth, adminOnly], async (req, res) => {
    const { name, email, role } = req.query;
    let query = 'SELECT id, name, email, address, role FROM users';
    const params = [];
    const conditions = [];

    if (name) {
        params.push(`%${name}%`);
        conditions.push(`name ILIKE $${params.length}`);
    }
    if (email) {
        params.push(`%${email.toLowerCase()}%`);
        conditions.push(`email ILIKE $${params.length}`);
    }
     if (role) {
        params.push(role);
        conditions.push(`role = $${params.length}`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
