import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import privateRouter from './modules/private/private.route.js'

const app = express()

// ===== CORS Options =====
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

// ===== Middlewares =====
app.use(cors(corsOptions))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ===== Routes =====
app.use('/private/api', privateRouter)
// app.use('/public/api')

// ===== Not Found =====
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

export default app
