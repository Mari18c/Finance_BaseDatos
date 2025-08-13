import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET all invoices with customer information
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                i.invoice_id,
                i.customer_id,
                i.billing_period,
                i.invoice_amount,
                i.amount_paid,
                c.customer_name,
                c.customer_email,
                c.customer_phone
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            ORDER BY i.invoice_id
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoices',
            details: error.message
        });
    }
});

// GET invoice by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(`
            SELECT 
                i.invoice_id,
                i.customer_id,
                i.billing_period,
                i.invoice_amount,
                i.amount_paid,
                c.customer_name,
                c.customer_email,
                c.customer_phone
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE i.invoice_id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoice',
            details: error.message
        });
    }
});

// GET invoices by customer ID
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const result = await query(`
            SELECT 
                i.invoice_id,
                i.customer_id,
                i.billing_period,
                i.invoice_amount,
                i.amount_paid,
                c.customer_name,
                c.customer_email,
                c.customer_phone
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE i.customer_id = $1
            ORDER BY i.billing_period DESC
        `, [customerId]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching customer invoices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch customer invoices',
            details: error.message
        });
    }
});

// POST create new invoice
router.post('/', async (req, res) => {
    try {
        const { customer_id, billing_period, invoice_amount, amount_paid = 0 } = req.body;
        
        // Validation
        if (!customer_id || !billing_period || !invoice_amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: customer_id, billing_period, invoice_amount'
            });
        }
        
        if (invoice_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invoice amount must be greater than 0'
            });
        }
        
        if (amount_paid < 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount paid cannot be negative'
            });
        }
        
        if (amount_paid > invoice_amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount paid cannot exceed invoice amount'
            });
        }
        
        // Check if customer exists
        const customerCheck = await query('SELECT customer_id FROM customers WHERE customer_id = $1', [customer_id]);
        if (customerCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Customer not found'
            });
        }
        
        // Generate invoice ID
        const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const result = await query(`
            INSERT INTO invoices (invoice_id, customer_id, billing_period, invoice_amount, amount_paid)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [invoiceId, customer_id, billing_period, invoice_amount, amount_paid]);
        
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create invoice',
            details: error.message
        });
    }
});

// PUT update invoice
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_id, billing_period, invoice_amount, amount_paid } = req.body;
        
        // Check if invoice exists
        const existingInvoice = await query('SELECT * FROM invoices WHERE invoice_id = $1', [id]);
        if (existingInvoice.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }
        
        // Validation
        if (invoice_amount !== undefined && invoice_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invoice amount must be greater than 0'
            });
        }
        
        if (amount_paid !== undefined && amount_paid < 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount paid cannot be negative'
            });
        }
        
        if (amount_paid !== undefined && invoice_amount !== undefined && amount_paid > invoice_amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount paid cannot exceed invoice amount'
            });
        }
        
        // Check if customer exists if updating customer_id
        if (customer_id) {
            const customerCheck = await query('SELECT customer_id FROM customers WHERE customer_id = $1', [customer_id]);
            if (customerCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
        }
        
        // Build update query dynamically
        const updateFields = [];
        const values = [];
        let paramCount = 1;
        
        if (customer_id !== undefined) {
            updateFields.push(`customer_id = $${paramCount++}`);
            values.push(customer_id);
        }
        if (billing_period !== undefined) {
            updateFields.push(`billing_period = $${paramCount++}`);
            values.push(billing_period);
        }
        if (invoice_amount !== undefined) {
            updateFields.push(`invoice_amount = $${paramCount++}`);
            values.push(invoice_amount);
        }
        if (amount_paid !== undefined) {
            updateFields.push(`amount_paid = $${paramCount++}`);
            values.push(amount_paid);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        
        values.push(id);
        
        const result = await query(`
            UPDATE invoices 
            SET ${updateFields.join(', ')}, 
                updated_at = CURRENT_TIMESTAMP
            WHERE invoice_id = $${paramCount}
            RETURNING *
        `, values);
        
        res.json({
            success: true,
            message: 'Invoice updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update invoice',
            details: error.message
        });
    }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if invoice exists
        const existingInvoice = await query('SELECT * FROM invoices WHERE invoice_id = $1', [id]);
        if (existingInvoice.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }
        
        // Check if there are related transactions
        const transactionsCheck = await query('SELECT transaction_id FROM transactions WHERE invoice_id = $1', [id]);
        if (transactionsCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete invoice with related transactions. Delete transactions first.'
            });
        }
        
        await query('DELETE FROM invoices WHERE invoice_id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete invoice',
            details: error.message
        });
    }
});

export default router;
