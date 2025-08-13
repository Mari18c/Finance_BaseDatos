import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET all transactions with invoice and customer information
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                t.transaction_id,
                t.transaction_datetime,
                t.transaction_amount,
                t.transaction_status,
                t.transaction_type,
                t.platform,
                t.invoice_id,
                i.invoice_amount,
                i.amount_paid,
                c.customer_id,
                c.customer_name,
                c.customer_email
            FROM transactions t
            LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            ORDER BY t.transaction_datetime DESC
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions',
            details: error.message
        });
    }
});

// GET transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(`
            SELECT 
                t.transaction_id,
                t.transaction_datetime,
                t.transaction_amount,
                t.transaction_status,
                t.transaction_type,
                t.platform,
                t.invoice_id,
                i.invoice_amount,
                i.amount_paid,
                c.customer_id,
                c.customer_name,
                c.customer_email
            FROM transactions t
            LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE t.transaction_id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transaction',
            details: error.message
        });
    }
});

// GET transactions by platform
router.get('/platform/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        
        const result = await query(`
            SELECT 
                t.transaction_id,
                t.transaction_datetime,
                t.transaction_amount,
                t.transaction_status,
                t.transaction_type,
                t.platform,
                t.invoice_id,
                i.invoice_amount,
                i.amount_paid,
                c.customer_id,
                c.customer_name,
                c.customer_email
            FROM transactions t
            LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE t.platform = $1
            ORDER BY t.transaction_datetime DESC
        `, [platform]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
            platform: platform
        });
    } catch (error) {
        console.error('Error fetching transactions by platform:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions by platform',
            details: error.message
        });
    }
});

// GET transactions by status
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        
        const result = await query(`
            SELECT 
                t.transaction_id,
                t.transaction_datetime,
                t.transaction_amount,
                t.transaction_status,
                t.transaction_type,
                t.platform,
                t.invoice_id,
                i.invoice_amount,
                i.amount_paid,
                c.customer_id,
                c.customer_name,
                c.customer_email
            FROM transactions t
            LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE t.transaction_status = $1
            ORDER BY t.transaction_datetime DESC
        `, [status]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
            status: status
        });
    } catch (error) {
        console.error('Error fetching transactions by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions by status',
            details: error.message
        });
    }
});

// POST create new transaction
router.post('/', async (req, res) => {
    try {
        const { 
            invoice_id, 
            transaction_datetime, 
            transaction_amount, 
            transaction_status, 
            transaction_type, 
            platform 
        } = req.body;
        
        // Validation
        if (!invoice_id || !transaction_datetime || !transaction_amount || !transaction_status || !transaction_type || !platform) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: invoice_id, transaction_datetime, transaction_amount, transaction_status, transaction_type, platform'
            });
        }
        
        if (transaction_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Transaction amount must be greater than 0'
            });
        }
        
        // Validate transaction status
        const validStatuses = ['Pending', 'Completed', 'Failed'];
        if (!validStatuses.includes(transaction_status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction status. Must be one of: Pending, Completed, Failed'
            });
        }
        
        // Validate platform
        const validPlatforms = ['Nequi', 'Daviplata'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid platform. Must be one of: Nequi, Daviplata'
            });
        }
        
        // Check if invoice exists
        const invoiceCheck = await query('SELECT * FROM invoices WHERE invoice_id = $1', [invoice_id]);
        if (invoiceCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invoice not found'
            });
        }
        
        // Generate transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const result = await query(`
            INSERT INTO transactions (transaction_id, invoice_id, transaction_datetime, transaction_amount, transaction_status, transaction_type, platform)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [transactionId, invoice_id, transaction_datetime, transaction_amount, transaction_status, transaction_type, platform]);
        
        // Update invoice amount_paid if transaction is completed
        if (transaction_status === 'Completed') {
            await query(`
                UPDATE invoices 
                SET amount_paid = amount_paid + $1
                WHERE invoice_id = $2
            `, [transaction_amount, invoice_id]);
        }
        
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create transaction',
            details: error.message
        });
    }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            invoice_id, 
            transaction_datetime, 
            transaction_amount, 
            transaction_status, 
            transaction_type, 
            platform 
        } = req.body;
        
        // Check if transaction exists
        const existingTransaction = await query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
        if (existingTransaction.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        // Validation
        if (transaction_amount !== undefined && transaction_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Transaction amount must be greater than 0'
            });
        }
        
        // Validate transaction status
        if (transaction_status !== undefined) {
            const validStatuses = ['Pending', 'Completed', 'Failed'];
            if (!validStatuses.includes(transaction_status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid transaction status. Must be one of: Pending, Completed, Failed'
                });
            }
        }
        
        // Validate platform
        if (platform !== undefined) {
            const validPlatforms = ['Nequi', 'Daviplata'];
            if (!validPlatforms.includes(platform)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid platform. Must be one of: Nequi, Daviplata'
                });
            }
        }
        
        // Check if invoice exists if updating invoice_id
        if (invoice_id) {
            const invoiceCheck = await query('SELECT * FROM invoices WHERE invoice_id = $1', [invoice_id]);
            if (invoiceCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
        }
        
        // Build update query dynamically
        const updateFields = [];
        const values = [];
        let paramCount = 1;
        
        if (invoice_id !== undefined) {
            updateFields.push(`invoice_id = $${paramCount++}`);
            values.push(invoice_id);
        }
        if (transaction_datetime !== undefined) {
            updateFields.push(`transaction_datetime = $${paramCount++}`);
            values.push(transaction_datetime);
        }
        if (transaction_amount !== undefined) {
            updateFields.push(`transaction_amount = $${paramCount++}`);
            values.push(transaction_amount);
        }
        if (transaction_status !== undefined) {
            updateFields.push(`transaction_status = $${paramCount++}`);
            values.push(transaction_status);
        }
        if (transaction_type !== undefined) {
            updateFields.push(`transaction_type = $${paramCount++}`);
            values.push(transaction_type);
        }
        if (platform !== undefined) {
            updateFields.push(`platform = $${paramCount++}`);
            values.push(platform);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        
        values.push(id);
        
        const result = await query(`
            UPDATE transactions 
            SET ${updateFields.join(', ')}, 
                updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = $${paramCount}
            RETURNING *
        `, values);
        
        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update transaction',
            details: error.message
        });
    }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if transaction exists
        const existingTransaction = await query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
        if (existingTransaction.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        // If transaction was completed, update invoice amount_paid
        if (existingTransaction.rows[0].transaction_status === 'Completed') {
            await query(`
                UPDATE invoices 
                SET amount_paid = amount_paid - $1
                WHERE invoice_id = $2
            `, [existingTransaction.rows[0].transaction_amount, existingTransaction.rows[0].invoice_id]);
        }
        
        await query('DELETE FROM transactions WHERE transaction_id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete transaction',
            details: error.message
        });
    }
});

export default router;
