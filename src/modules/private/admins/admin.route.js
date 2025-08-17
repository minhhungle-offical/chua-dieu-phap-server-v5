import express from 'express'
// import { checkAuth } from '../../../middlewares/checkAuth.js'
// import { requireRole } from '../../../middlewares/requireRole.js'
import { upload } from '../../../middlewares/upload.js'
import {
  createAdmin,
  deleteAdmin,
  getAdminById,
  getAdmins,
  updateAdmin,
  uploadAdminAvatar,
} from './admin.controller.js'

const adminRouter = express.Router()

// ===== Admin CRUD routes (owner only) =====
// adminRouter.use(checkAuth, requireRole(['owner']))

adminRouter.post('/', createAdmin)
adminRouter.get('/', getAdmins)
adminRouter.get('/:id', getAdminById)
adminRouter.put('/:id', updateAdmin)
adminRouter.delete('/:id', deleteAdmin)
adminRouter.post('/:id/avatar', upload.single('avatar'), uploadAdminAvatar) // Upload avatar

export default adminRouter
