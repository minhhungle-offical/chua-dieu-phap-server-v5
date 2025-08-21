import express from 'express'
import { getAllRetreats, getRetreat } from './retreat.controller.js'

const retreatRouter = express.Router()

// ===== Retreat CRUD =====

retreatRouter.get('/', getAllRetreats)
retreatRouter.get('/:slug', getRetreat)

export default retreatRouter
