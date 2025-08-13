// API Base URL
const API_BASE = 'http://localhost:4001/api';

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    loadCustomers();
    loadInvoices();
    loadTransactions();
    
    // Setup form event listeners
    setupFormListeners();
    
    // Load customers in dropdowns
    loadCustomerDropdowns();
});

// Navigation setup
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Setup form event listeners
function setupFormListeners() {
    // Customer form
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);
    
    // Invoice form
    document.getElementById('invoice-form').addEventListener('submit', handleInvoiceSubmit);
    
    // Transaction form
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
}

// Customer CRUD functions
async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE}/customers`);
        const data = await response.json();
        
        if (data.success) {
            displayCustomers(data.data);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customers-tbody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No customers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.customer_id}</td>
            <td>${customer.customer_name || '-'}</td>
            <td>${customer.customer_address || '-'}</td>
            <td>${customer.customer_phone || '-'}</td>
            <td>${customer.customer_email || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editCustomer(${customer.customer_id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteCustomer(${customer.customer_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function editCustomer(customerId) {
    try {
        const response = await fetch(`${API_BASE}/customers/${customerId}`);
        const data = await response.json();
        
        if (data.success) {
            const customer = data.data;
            document.getElementById('customer-id').value = customer.customer_id;
            document.getElementById('customer-name').value = customer.customer_name || '';
            document.getElementById('customer-address').value = customer.customer_address || '';
            document.getElementById('customer-phone').value = customer.customer_phone || '';
            document.getElementById('customer-email').value = customer.customer_email || '';
        }
    } catch (error) {
        console.error('Error loading customer:', error);
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/customers/${customerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCustomers();
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
    }
}

function clearCustomerForm() {
    document.getElementById('customer-form').reset();
    document.getElementById('customer-id').value = '';
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('customer-id').value;
    const customerData = {
        customer_name: document.getElementById('customer-name').value,
        customer_address: document.getElementById('customer-address').value,
        customer_phone: document.getElementById('customer-phone').value,
        customer_email: document.getElementById('customer-email').value
    };
    
    try {
        const url = customerId ? `${API_BASE}/customers/${customerId}` : `${API_BASE}/customers`;
        const method = customerId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });
        
        if (response.ok) {
            clearCustomerForm();
            loadCustomers();
        }
    } catch (error) {
        console.error('Error saving customer:', error);
    }
}

// Invoice CRUD functions
async function loadInvoices() {
    try {
        const response = await fetch(`${API_BASE}/invoices`);
        const data = await response.json();
        
        if (data.success) {
            displayInvoices(data.data);
            // Reload invoice dropdown for transactions
            loadInvoiceDropdown();
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

function displayInvoices(invoices) {
    const tbody = document.getElementById('invoices-tbody');
    
    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No invoices found</td></tr>';
        return;
    }
    
    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td>${invoice.invoice_id}</td>
            <td>${invoice.customer_id}</td>
            <td>${invoice.billing_period || '-'}</td>
            <td>$${invoice.invoice_amount || 0}</td>
            <td>$${invoice.amount_paid || 0}</td>
            <td>
                <button class="btn btn-edit" onclick="editInvoice('${invoice.invoice_id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteInvoice('${invoice.invoice_id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function editInvoice(invoiceId) {
    try {
        const response = await fetch(`${API_BASE}/invoices/${invoiceId}`);
        const data = await response.json();
        
        if (data.success) {
            const invoice = data.data;
            document.getElementById('invoice-id').value = invoice.invoice_id;
            document.getElementById('invoice-customer').value = invoice.customer_id;
            document.getElementById('invoice-period').value = invoice.billing_period || '';
            document.getElementById('invoice-amount').value = invoice.invoice_amount || '';
            document.getElementById('invoice-paid').value = invoice.amount_paid || 0;
        }
    } catch (error) {
        console.error('Error loading invoice:', error);
    }
}

async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/invoices/${invoiceId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadInvoices();
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);
    }
}

function clearInvoiceForm() {
    document.getElementById('invoice-form').reset();
    document.getElementById('invoice-id').value = '';
}

async function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    const invoiceId = document.getElementById('invoice-id').value;
    const invoiceData = {
        customer_id: document.getElementById('invoice-customer').value,
        billing_period: document.getElementById('invoice-period').value,
        invoice_amount: parseFloat(document.getElementById('invoice-amount').value),
        amount_paid: parseFloat(document.getElementById('invoice-paid').value) || 0
    };
    
    try {
        const url = invoiceId ? `${API_BASE}/invoices/${invoiceId}` : `${API_BASE}/invoices`;
        const method = invoiceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });
        
        if (response.ok) {
            clearInvoiceForm();
            loadInvoices();
        }
    } catch (error) {
        console.error('Error saving invoice:', error);
    }
}

// Transaction CRUD functions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions`);
        const data = await response.json();
        
        if (data.success) {
            displayTransactions(data.data);
            // Load invoice dropdown for transactions
            loadInvoiceDropdown();
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactions-tbody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.transaction_id}</td>
            <td>${transaction.transaction_datetime || '-'}</td>
            <td>$${transaction.transaction_amount || 0}</td>
            <td>${transaction.transaction_status || '-'}</td>
            <td>${transaction.transaction_type || '-'}</td>
            <td>${transaction.platform || '-'}</td>
            <td>${transaction.invoice_id || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editTransaction('${transaction.transaction_id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteTransaction('${transaction.transaction_id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function editTransaction(transactionId) {
    try {
        const response = await fetch(`${API_BASE}/transactions/${transactionId}`);
        const data = await response.json();
        
        if (data.success) {
            const transaction = data.data;
            document.getElementById('transaction-id').value = transaction.transaction_id;
            document.getElementById('transaction-invoice').value = transaction.invoice_id;
            document.getElementById('transaction-amount').value = transaction.transaction_amount;
            document.getElementById('transaction-status').value = transaction.transaction_status;
            document.getElementById('transaction-type').value = transaction.transaction_type;
            document.getElementById('transaction-platform').value = transaction.platform;
        }
    } catch (error) {
        console.error('Error loading transaction:', error);
    }
}

async function deleteTransaction(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTransactions();
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
}

function clearTransactionForm() {
    document.getElementById('transaction-form').reset();
    document.getElementById('transaction-id').value = '';
}

async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const transactionId = document.getElementById('transaction-id').value;
    const transactionData = {
        invoice_id: document.getElementById('transaction-invoice').value,
        transaction_amount: parseFloat(document.getElementById('transaction-amount').value),
        transaction_status: document.getElementById('transaction-status').value,
        transaction_type: document.getElementById('transaction-type').value,
        platform: document.getElementById('transaction-platform').value
    };
    
    try {
        const url = transactionId ? `${API_BASE}/transactions/${transactionId}` : `${API_BASE}/transactions`;
        const method = transactionId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        if (response.ok) {
            clearTransactionForm();
            loadTransactions();
        }
    } catch (error) {
        console.error('Error saving transaction:', error);
    }
}

// Load customers in dropdowns for invoices and transactions
async function loadCustomerDropdowns() {
    try {
        const response = await fetch(`${API_BASE}/customers`);
        const data = await response.json();
        
        if (data.success) {
            const customers = data.data;
            
            // Fill invoice customer dropdown
            const invoiceCustomerSelect = document.getElementById('invoice-customer');
            if (invoiceCustomerSelect) {
                invoiceCustomerSelect.innerHTML = '<option value="">Select Customer</option>';
                customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.customer_id;
                    option.textContent = `${customer.customer_name} (ID: ${customer.customer_id})`;
                    invoiceCustomerSelect.appendChild(option);
                });
            }
            
            // Fill transaction invoice dropdown
            const transactionInvoiceSelect = document.getElementById('transaction-invoice');
            if (transactionInvoiceSelect) {
                transactionInvoiceSelect.innerHTML = '<option value="">Select Invoice</option>';
                // We'll load invoices here when needed
            }
        }
    } catch (error) {
        console.error('Error loading customer dropdowns:', error);
    }
}

// Load invoices in transaction dropdown
async function loadInvoiceDropdown() {
    try {
        const response = await fetch(`${API_BASE}/invoices`);
        const data = await response.json();
        
        if (data.success) {
            const invoices = data.data;
            const transactionInvoiceSelect = document.getElementById('transaction-invoice');
            
            if (transactionInvoiceSelect) {
                transactionInvoiceSelect.innerHTML = '<option value="">Select Invoice</option>';
                invoices.forEach(invoice => {
                    const option = document.createElement('option');
                    option.value = invoice.invoice_id;
                    option.textContent = `Invoice ${invoice.invoice_id} - $${invoice.invoice_amount}`;
                    transactionInvoiceSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading invoice dropdown:', error);
    }
}
