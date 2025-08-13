import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// GET total paid by each customer
router.get('/total-paid-by-customer', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                c.customer_id,
                c.customer_name,
                c.customer_email,
                COUNT(i.invoice_id) as total_invoices,
                SUM(i.invoice_amount) as total_invoiced,
                SUM(i.amount_paid) as total_paid,
                (SUM(i.invoice_amount) - SUM(i.amount_paid)) as total_pending
            FROM customers c
            LEFT JOIN invoices i ON c.customer_id = i.customer_id
            GROUP BY c.customer_id, c.customer_name, c.customer_email
            ORDER BY total_paid DESC
        `);
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error getting total paid by customer:', error);
        res.status(500).json({
            success: false,
            error: 'Error retrieving total paid by customer'
        });
    }
});

// GET pending invoices with client and transaction data
router.get('/pending-invoices', async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                i.invoice_id,
                i.billing_period,
                i.invoice_amount,
                i.amount_paid,
                (i.invoice_amount - i.amount_paid) as pending_amount,
                c.customer_id,
                c.customer_name,
                c.customer_email,
                c.customer_phone,
                COUNT(t.transaction_id) as transaction_count,
                MAX(t.transaction_datetime) as last_transaction_date
            FROM invoices i
            JOIN customers c ON i.customer_id = c.customer_id
            LEFT JOIN transactions t ON i.invoice_id = t.invoice_id
            WHERE i.amount_paid < i.invoice_amount
            GROUP BY i.invoice_id, i.billing_period, i.invoice_amount, i.amount_paid,
                     c.customer_id, c.customer_name, c.customer_email, c.customer_phone
            ORDER BY pending_amount DESC
        `);
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error getting pending invoices:', error);
        res.status(500).json({
            success: false,
            error: 'Error retrieving pending invoices'
        });
    }
});

// GET transactions by platform (Nequi/Daviplata)
router.get('/transactions-by-platform/:platform', async (req, res) => {
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
                i.invoice_id,
                i.billing_period,
                i.invoice_amount,
                c.customer_name,
                c.customer_email
            FROM transactions t
            JOIN invoices i ON t.invoice_id = i.invoice_id
            JOIN customers c ON i.customer_id = c.customer_id
            WHERE t.platform = $1
            ORDER BY t.transaction_datetime DESC
        `, [platform]);
        
        res.json({
            success: true,
            platform: platform,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error getting transactions by platform:', error);
        res.status(500).json({
            success: false,
            error: 'Error retrieving transactions by platform'
        });
    }
});

// GET financial summary dashboard
router.get('/financial-summary', async (req, res) => {
    try {
        const summaryResult = await query(`
            SELECT 
                COUNT(DISTINCT c.customer_id) as total_customers,
                COUNT(DISTINCT i.invoice_id) as total_invoices,
                COUNT(DISTINCT t.transaction_id) as total_transactions,
                SUM(i.invoice_amount) as total_invoiced,
                SUM(i.amount_paid) as total_paid,
                (SUM(i.invoice_amount) - SUM(i.amount_paid)) as total_pending,
                AVG(i.invoice_amount) as average_invoice_amount
            FROM customers c
            LEFT JOIN invoices i ON c.customer_id = i.customer_id
            LEFT JOIN transactions t ON i.invoice_id = t.invoice_id
        `);
        
        const platformResult = await query(`
            SELECT 
                platform,
                COUNT(*) as transaction_count,
                SUM(transaction_amount) as total_amount,
                AVG(transaction_amount) as average_amount
            FROM transactions
            GROUP BY platform
            ORDER BY total_amount DESC
        `);
        
        const statusResult = await query(`
            SELECT 
                transaction_status,
                COUNT(*) as count,
                SUM(transaction_amount) as total_amount
            FROM transactions
            GROUP BY transaction_status
            ORDER BY count DESC
        `);
        
        res.json({
            success: true,
            summary: summaryResult.rows[0],
            platforms: platformResult.rows,
            statuses: statusResult.rows
        });
    } catch (error) {
        console.error('Error getting financial summary:', error);
        res.status(500).json({
            success: false,
            error: 'Error retrieving financial summary'
        });
    }
});

export default router;
