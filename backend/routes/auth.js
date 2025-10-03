const express = require('express');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password, address } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const role = 'normal_user'; // Default role
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, role',
            [name, email, password_hash, address, role]
        );

        const payload = { user: { id: newUser.rows[0].id, role: newUser.rows[0].role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(400).json({ msg: 'Invalid Credentials' });

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/update-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];
        
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
