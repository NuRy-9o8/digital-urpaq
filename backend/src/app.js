import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { initDatabase } from './database/init.js';
import { seedDatabase } from './database/seed.js';
import authRoutes from './routes/authRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import { initTelegramBot } from './services/telegramService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academy', academyRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Digital Urpaq Backend is running' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

(async () => {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('✅ Database initialized');

    initTelegramBot();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation:`);
      console.log(`   Auth: POST /api/auth/register, /api/auth/login, GET /api/auth/profile, PUT /api/auth/profile`);
      console.log(`   Clubs: GET /api/clubs, POST /api/clubs`);
      console.log(`   Applications: POST /api/applications, GET /api/applications/my-applications`);
      console.log(`   Content: GET /api/content/news, POST /api/content/content`);
      console.log(`   Admin: GET /api/admin/statistics`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
