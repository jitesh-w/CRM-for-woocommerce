import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database schema and seed if empty
initDb();

// Mount Routes
app.use('/api', apiRoutes);

// Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'WooCommerce CRM System',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`[WooCommerce CRM Backend] Server running on http://localhost:${PORT}`);
});
