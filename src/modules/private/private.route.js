import express from 'express'
import adminRouter from './admins/admin.route.js'
import authRouter from './auth/auth.route.js'

const privateRouter = express.Router()

privateRouter.use('/auth', authRouter)
privateRouter.use('/admins', adminRouter)

export default privateRouter
