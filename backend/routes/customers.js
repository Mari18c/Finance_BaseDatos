import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET all customers
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM customers ORDER BY customer_id');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM customers WHERE customer_id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST new customer
router.post('/', async (req, res) => {
    try {
        const { customer_name, customer_address, customer_phone, customer_email } = req.body;
        const result = await query(
            'INSERT INTO customers (customer_name, customer_address, customer_phone, customer_email) VALUES ($1, $2, $3, $4) RETURNING *',
            [customer_name, customer_address, customer_phone, customer_email]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT update customer
router.put('/:id', async (req, res) => {
    try {
        const { customer_name, customer_address, customer_phone, customer_email } = req.body;
        const result = await query(
            'UPDATE customers SET customer_name = $1, customer_address = $2, customer_phone = $3, customer_email = $4 WHERE customer_id = $5 RETURNING *',
            [customer_name, customer_address, customer_phone, customer_email, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM customers WHERE customer_id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
