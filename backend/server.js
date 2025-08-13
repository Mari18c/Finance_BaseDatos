import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './db/connection.js';

import customersRoutes from './routes/customers.js';
import invoicesRoutes from './routes/invoices.js';
import transactionsRoutes from './routes/transactions.js';
import queriesRoutes from './routes/queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

testConnection()
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ Database connection failed:', err.message));

app.use('/api/customers', customersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/queries', queriesRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
