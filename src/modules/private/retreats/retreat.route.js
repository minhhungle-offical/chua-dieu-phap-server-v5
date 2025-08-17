import express from 'express'
import { checkAuth } from '../../../middlewares/checkAuth.js'
import { requireRole } from '../../../middlewares/requireRole.js'
import { upload } from '../../../middlewares/upload.js'
import {
  createRetreat,
  getRetreat,
  updateRetreat,
  deleteRetreat,
  getAllRetreats,
  uploadRetreatThumbnail,
} from './retreat.controller.js'

const retreatRouter = express.Router()

// ===== Protected routes (owner/manager) =====
retreatRouter.use(checkAuth)
retreatRouter.use(requireRole(['owner', 'admin']))

// ===== Retreat CRUD =====
retreatRouter.post('/', createRetreat)
retreatRouter.get('/', getAllRetreats)
retreatRouter.get('/:id', getRetreat)
retreatRouter.put('/:id', updateRetreat)
retreatRouter.delete('/:id', deleteRetreat)

// ===== Upload thumbnail =====
retreatRouter.post('/:id/thumbnail', upload.single('thumbnail'), uploadRetreatThumbnail)

export default retreatRouter
