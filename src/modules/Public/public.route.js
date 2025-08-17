import express from 'express'
import authRouter from './auth/auth.route.js'

const publicRouter = express.Router()

publicRouter.use('/auth', authRouter)

export default publicRouter
