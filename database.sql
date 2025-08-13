

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table (Independent entity - 1NF)
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_phone VARCHAR(100),
    customer_email VARCHAR(255)
);

-- Create invoices table (Depends on customers - 2NF)
CREATE TABLE invoices (
    invoice_id VARCHAR(20) PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    billing_period VARCHAR(10),
    invoice_amount DECIMAL(15,2),
    amount_paid DECIMAL(15,2)
);

-- Create transactions table (Depends on invoices and customers - 2NF)
CREATE TABLE transactions (
    transaction_id VARCHAR(20) PRIMARY KEY,
    transaction_datetime TIMESTAMP,
    transaction_amount DECIMAL(15,2),
    transaction_status VARCHAR(50),
    transaction_type VARCHAR(100),
    platform VARCHAR(50),
    invoice_id VARCHAR(20) REFERENCES invoices(invoice_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_datetime ON transactions(transaction_datetime);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(billing_period);
CREATE INDEX IF NOT EXISTS idx_transactions_platform ON transactions(platform);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(transaction_status);

-- Add constraints for data integrity
ALTER TABLE invoices ADD CONSTRAINT chk_amounts CHECK (amount_paid <= invoice_amount);
ALTER TABLE transactions ADD CONSTRAINT chk_transaction_amount CHECK (transaction_amount > 0);
