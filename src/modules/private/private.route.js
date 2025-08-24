import express from 'express'
import adminRouter from './admins/admin.route.js'
import authRouter from './auth/auth.route.js'
import retreatRouter from './retreats/retreat.route.js'
import { checkPrivileged } from '../../middlewares/checkPrivileged.js'

const privateRouter = express.Router()
privateRouter.use(checkPrivileged)

privateRouter.use('/auth', authRouter)
privateRouter.use('/admins', adminRouter)
privateRouter.use('/retreats', retreatRouter)

export default privateRouter
