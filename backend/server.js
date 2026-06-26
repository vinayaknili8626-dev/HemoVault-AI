const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const labRoutes = require('./routes/labRoutes');
const adminRoutes = require('./routes/adminRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Set security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows images/PDFs to be loaded by frontend
  })
);

// Sanitize data (NoSQL injection protection)
app.use(mongoSanitize());

// Rate limiting (Capped at 200 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// Serve static uploaded PDF files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Standard error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
