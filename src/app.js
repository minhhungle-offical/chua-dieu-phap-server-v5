import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import privateRouter from './modules/private/private.route.js'
import publicRouter from './modules/Public/public.route.js'

const app = express()

// ===== CORS Options =====
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173']

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
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
app.use('/public/api', publicRouter)

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
