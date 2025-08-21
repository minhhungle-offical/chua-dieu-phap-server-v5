import { Retreat } from '../../../models/retreat.model.js'
import { sendError } from '../../../utils/sendError.js'

// ===== Get all retreats with pagination, filters, search =====
export const getAllRetreats = async (req, res) => {
  try {
    // --- Pagination ---
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.max(parseInt(req.query.limit) || 10, 1)
    const skip = (page - 1) * limit

    // --- Filters ---
    const filters = {}
    if (req.query.isPublished) filters.isPublished = req.query.isPublished === 'true'
    if (req.query.startDate) filters.startDate = { $gte: new Date(req.query.startDate) }
    if (req.query.endDate) filters.endDate = { $lte: new Date(req.query.endDate) }

    // --- Search ---
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i')
      filters.$or = [{ title: regex }, { location: regex }, { description: regex }]
    }

    // --- Query DB ---
    const [retreats, total] = await Promise.all([
      Retreat.find(filters).sort({ startDate: 1 }).skip(skip).limit(limit).populate('participants'), // populate participant references
      Retreat.countDocuments(filters),
    ])

    // --- Response ---
    return res.json({
      success: true,
      data: {
        data: retreats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (err) {
    return sendError(res, 500, 'Lấy danh sách retreat thất bại: ' + err.message)
  }
}

// ===== Get Retreat by slug =====
export const getRetreat = async (req, res) => {
  try {
    const retreat = await Retreat.findOne({ slug: req.params.slug }).populate('participants')

    console.log('retreat: ', retreat)
    if (!retreat) return sendError(res, 'Không tìm thấy retreat', 404)
    res.json(retreat)
  } catch (err) {
    sendError(res, err)
  }
}
