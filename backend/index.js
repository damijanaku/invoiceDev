import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, pool } from './src/config/db.js';
import userRoutes from './src/routes/user.routes.js';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

app.use((req, _res, next) => {
    req.db = pool;
    next();
  });

const PORT = 3000;

app.get('/health', async (req, res) => {
  const { query } = await import('./db.js');
  const { rows } = await query('SELECT NOW() AS now');
  res.json({ ok: true, db: rows[0].now });
});

app.use('/api/v1/users', userRoutes)

async function start() {
  await connectDB();  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();