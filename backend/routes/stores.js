const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// POST /api/stores - Create a new store
router.post('/', [auth, adminOnly], async (req, res) => {
    const { name, address, owner_id } = req.body;
    try {
        const newStore = await db.query(
            'INSERT INTO stores (name, address, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [name, address, owner_id || null]
        );
        res.status(201).json(newStore.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/stores - Get all stores with filtering and sorting
router.get('/', auth, async (req, res) => {
    const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const validSortColumns = { name: 's.name', address: 's.address', owner_email: 'u.email', overall_rating: 'overall_rating' };
    const orderByColumn = validSortColumns[sortBy] || 's.name';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
        SELECT
            s.id, s.name, s.address,
            u.email as owner_email,
            COALESCE(AVG(r.rating), 0) as overall_rating,
            (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) as user_submitted_rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        LEFT JOIN users u ON s.owner_id = u.id
    `;
    const conditions = [];
    const params = [req.user.id];

    if (name) { params.push(`%${name}%`); conditions.push(`s.name ILIKE $${params.length}`); }
    if (address) { params.push(`%${address}%`); conditions.push(`s.address ILIKE $${params.length}`); }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` GROUP BY s.id, u.email ORDER BY ${orderByColumn} ${orderDirection}`;

    try {
        const { rows } = await db.query(query, params);
        rows.forEach(row => { row.overall_rating = parseFloat(row.overall_rating); });
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/stores/:storeId/ratings - Submit or update a rating for a store
router.post('/:storeId/ratings', auth, async (req, res) => {
    const { rating } = req.body;
    const { storeId } = req.params;
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }
    try {
        const query = `
            INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)
            ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating
            RETURNING *;
        `;
        const { rows } = await db.query(query, [req.user.id, storeId, rating]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/stores/owner/dashboard - Get dashboard data for a store owner
router.get('/owner/dashboard', auth, async (req, res) => {
    if (req.user.role !== 'store_owner') {
        return res.status(403).json({ msg: 'Access Denied' });
    }
    try {
        const storeResult = await db.query('SELECT id FROM stores WHERE owner_id = $1', [req.user.id]);
        if (storeResult.rows.length === 0) {
            return res.status(404).json({ msg: 'No store assigned to this owner.' });
        }
        const storeId = storeResult.rows[0].id;
        const avgRatingResult = await db.query('SELECT AVG(rating) as average_rating FROM ratings WHERE store_id = $1', [storeId]);
        const averageRating = parseFloat(avgRatingResult.rows[0].average_rating) || 0;
        const ratersResult = await db.query('SELECT u.name, u.email FROM users u JOIN ratings r ON u.id = r.user_id WHERE r.store_id = $1', [storeId]);
        res.json({
            averageRating: averageRating.toFixed(2),
            usersWhoRated: ratersResult.rows,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
