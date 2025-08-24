import express from 'express'
import { checkAuth } from '../../../middlewares/checkAuth.js'
import { getMe, login, logout, resendOtp, updateMe, verifyOtp } from './auth.controller.js'

const authRouter = express.Router()

// ===== Public auth routes =====
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/verify-otp', verifyOtp)
authRouter.post('/resend-otp', resendOtp)

// ===== Protected auth routes =====
authRouter.get('/me', checkAuth, getMe)
authRouter.patch('/me', checkAuth, updateMe)

export default authRouter
