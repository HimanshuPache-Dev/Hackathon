import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Use mock database (no Supabase needed)
import { db } from './db-mock';

// Import routes
import junctionsRoutes from './routes/junctions.routes';
import officersRoutes from './routes/officers.routes';
import incidentsRoutes from './routes/incidents.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import baselineRoutes from './routes/baseline.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  res.json({ status: 'ok', database: 'connected (MOCK)' });
});

// Routes
app.use('/api/junctions', junctionsRoutes);
app.use('/api/officers', officersRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/baseline', baselineRoutes);

export default app;