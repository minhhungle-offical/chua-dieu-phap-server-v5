import express from 'express'
import authRouter from './auth/auth.route.js'
import retreatRouter from './retreats/retreat.route.js'

const publicRouter = express.Router()

publicRouter.use('/auth', authRouter)
publicRouter.use('/retreats', retreatRouter)

export default publicRouter
