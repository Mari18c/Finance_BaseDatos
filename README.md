# Financial Management System

## System Description

Comprehensive financial management system built with Node.js, Express, PostgreSQL, and vanilla JavaScript. This system helps organize and manage financial data from platforms like Nequi and Daviplata, providing a normalized database structure with complete CRUD operations.

### Main Features
- **Customer Management**: Complete CRUD operations for customer data
- **Invoice Management**: Create, read, update, and delete invoices
- **Transaction Tracking**: Monitor financial transactions with platform details
- **Normalized Database**: PostgreSQL database following 3NF normalization
- **RESTful API**: Complete backend API with Express.js
- **Modern Frontend**: Clean and responsive interface built with vanilla JavaScript
- **Real-time Updates**: Dynamic data loading and form management

## Project Structure

```
AssestmentSQL/
├── backend/                 # Backend application
│   ├── config/             # Configuration files
│   │   └── config.js       # Database and server config
│   ├── db/                 # Database connection
│   │   └── connection.js   # PostgreSQL connection pool
│   ├── routes/             # API route handlers
│   │   ├── customers.js    # Customer CRUD operations
│   │   ├── invoices.js     # Invoice CRUD operations
│   │   ├── transactions.js # Transaction CRUD operations
│   │   └── queries.js      # Advanced query endpoints
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server entry point
├── frontend/               # Frontend application
│   ├── css/                # Stylesheets
│   │   └── styles.css      # Custom CSS styles
│   ├── js/                 # JavaScript files
│   │   └── app.js          # Main application logic
│   ├── index.html          # Main HTML interface
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── data/                   # Data files
│   ├── clientes.csv        # Customer data
│   ├── invoices.csv        # Invoice data
│   └── transactions.csv    # Transaction data
├── database.sql            # Database schema
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## Project Execution Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm
- PostgreSQL database (or Supabase account)

### 1. Clone the Repository
```bash
git clone https://github.com/Mari18c/Finance_BaseDatos.git
cd Finance_BaseDatos
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure database connection in `config/config.js`:
   ```javascript
   export const config = {
       server: {
           port: 4001
       },
       database: {
           host: 'your-database-host',
           port: 5432,
           database: 'your-database-name',
           user: 'your-username',
           password: 'your-password'
       }
   };
   ```

4. Set up the database schema:
   ```bash
   psql -h your-host -U your-user -d your-database -f ../database.sql
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database system
- **pg**: PostgreSQL client for Node.js
- **CORS**: Cross-Origin Resource Sharing middleware

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling (no frameworks)
- **Vanilla JavaScript**: Modern ES6+ features
- **Vite**: Frontend build tool and development server

### Database
- **Supabase**: PostgreSQL hosting and management
- **Connection Pooling**: Optimized database connections

## Normalization Explanation

The system follows database normalization principles to eliminate redundancy and improve data integrity:

### 1NF (First Normal Form)
- **Atomic Values**: Each field contains a single value
- **No Repeating Groups**: No arrays or lists in individual fields
- **Customers Table**: Customer information in separate fields (name, address, phone, email)
- **Invoices Table**: Unique billing records with customer references
- **Transactions Table**: Individual transaction records with invoice references

### 2NF (Second Normal Form)
- **No Partial Dependencies**: All non-key fields depend completely on the primary key
- **Customer Dependencies**: Customer information depends completely on customer_id
- **Invoice Dependencies**: Invoice data depends on invoice_id and customer_id
- **Transaction Dependencies**: Transaction data depends on transaction_id and invoice_id

### 3NF (Third Normal Form)
- **No Transitive Dependencies**: All attributes depend directly on their primary keys
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Redundancy Eliminated**: Customer information stored once and referenced from invoices

### Relational Model
The system implements a three-table structure:
- **customers** (Independent entity)
- **invoices** (Depends on customers)
- **transactions** (Depends on invoices and customers)

## Relational Model

The database consists of three main entities with the following structure:

### Customers Table
- **Primary Key**: customer_id (SERIAL)
- **Attributes**: customer_name, customer_address, customer_phone, customer_email
- **Description**: Independent entity storing customer information

### Invoices Table
- **Primary Key**: invoice_id (SERIAL)
- **Foreign Key**: customer_id → customers(customer_id)
- **Attributes**: billing_period, invoice_amount, amount_paid
- **Description**: Billing records linked to customers

### Transactions Table
- **Primary Key**: transaction_id (SERIAL)
- **Foreign Key**: invoice_id → invoices(invoice_id)
- **Attributes**: transaction_datetime, transaction_amount, transaction_status, transaction_type, platform
- **Description**: Financial transactions linked to invoices

### Relationships
- **One-to-Many**: customers → invoices (one customer can have multiple invoices)
- **One-to-Many**: invoices → transactions (one invoice can have multiple transactions)
- **Many-to-One**: invoices → customers (many invoices belong to one customer)
- **Many-to-One**: transactions → invoices (many transactions belong to one invoice)

## Developer Information

- **Name**: Mariana Carmona
- **Clan**: Clan Lovelace
- **Email**: ma2007rianac@gmail.com
- **Repository**: https://github.com/Mari18c/Finance_BaseDatos.git

---

**Note**: This system is designed to handle financial data from Colombian Fintech platforms and follows Colombian financial data management best practices.
