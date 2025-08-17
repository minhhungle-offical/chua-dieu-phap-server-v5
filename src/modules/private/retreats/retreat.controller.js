import * as Yup from 'yup'
import cloudinary, { uploadToCloudinary } from '../../../configs/cloudinary.js'
import { Retreat } from '../../../models/retreat.model.js'
import { sendError } from '../../../utils/sendError.js'
import { generateUniqueSlug } from '../../../utils/slug.js'
import { Participant } from '../../../models/participant.model.js'

// ===== Yup schema =====
const retreatValidationSchema = Yup.object().shape({
  title: Yup.string().required('Tiêu đề bắt buộc'),
  description: Yup.string(),
  location: Yup.string().required('Địa điểm bắt buộc'),
  startTime: Yup.string().required('Thời gian bắt đầu bắt buộc'),
  endTime: Yup.string().required('Thời gian kết thúc bắt buộc'),
  startDate: Yup.date().required('Ngày bắt đầu bắt buộc'),
  endDate: Yup.date()
    .required('Ngày kết thúc bắt buộc')
    .min(Yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  maxParticipants: Yup.number().min(1, 'Số lượng tham gia tối thiểu là 1'),
  price: Yup.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  isPublished: Yup.boolean(),
})

// ===== Create Retreat =====
export const createRetreat = async (req, res) => {
  try {
    const validatedData = await retreatValidationSchema.validate(req.body, { abortEarly: false })

    // Generate unique slug based on title
    const slug = await generateUniqueSlug(validatedData.title, Retreat)

    const newRetreat = await Retreat.create({
      ...validatedData,
      slug,
      createdBy: req.user.id,
    })

    res.status(201).json({ message: 'Tạo retreat thành công', retreat: newRetreat })
  } catch (err) {
    sendError(res, err)
  }
}

// ===== Get Retreat by ID =====
export const getRetreat = async (req, res) => {
  try {
    const retreat = await Retreat.findById(req.params.id).populate('participants')
    if (!retreat) return sendError(res, 'Không tìm thấy retreat', 404)
    res.json(retreat)
  } catch (err) {
    sendError(res, err)
  }
}

// ===== Update Retreat =====
export const updateRetreat = async (req, res) => {
  try {
    const retreat = await Retreat.findById(req.params.id)
    if (!retreat) return sendError(res, 'Không tìm thấy retreat', 404)

    const validatedData = await retreatValidationSchema.validate(req.body, { abortEarly: false })

    // Create new slug only if title changed
    let slug = retreat.slug
    if (validatedData.title && validatedData.title !== retreat.title) {
      slug = await generateUniqueSlug(validatedData.title, Retreat, retreat._id)
    }

    const updateData = { ...validatedData, slug }

    const updatedRetreat = await Retreat.findByIdAndUpdate(req.params.id, updateData, { new: true })

    res.json({ message: 'Cập nhật retreat thành công', retreat: updatedRetreat })
  } catch (err) {
    sendError(res, err)
  }
}

// ===== Delete Retreat =====
export const deleteRetreat = async (req, res) => {
  try {
    const retreat = await Retreat.findById(req.params.id)
    if (!retreat) return sendError(res, 'Không tìm thấy retreat', 404)

    // --- Xóa file thumbnail nếu có ---
    if (retreat.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(retreat.thumbnail.publicId).catch(() => null)
    }

    // --- Xóa file banner nếu có ---
    if (retreat.banner?.publicId) {
      await cloudinary.uploader.destroy(retreat.banner.publicId).catch(() => null)
    }

    // --- Xóa tất cả participants liên quan ---
    await Participant.deleteMany({ retreat: retreat._id })

    // --- Xóa retreat ---
    await Retreat.findByIdAndDelete(retreat._id)

    res.json({ message: 'Xóa retreat thành công' })
  } catch (err) {
    sendError(res, 500, err.message)
  }
}

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

// ===== Upload thumbnail for Retreat =====
export const uploadRetreatThumbnail = async (req, res) => {
  try {
    const { id: retreatId } = req.params
    if (!req.file) return sendError(res, 400, 'Chưa chọn file để tải lên')

    const retreat = await Retreat.findById(retreatId)
    if (!retreat) return sendError(res, 404, 'Không tìm thấy retreat')

    // Upload new thumbnail to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'retreat_thumbnails', true)

    // Remove old thumbnail if exists
    if (retreat.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(retreat.thumbnail.publicId).catch(() => null)
    }

    retreat.thumbnail = { url, publicId }
    await retreat.save()

    return res.json({ success: true, message: 'Tải thumbnail thành công', data: retreat })
  } catch (err) {
    return sendError(res, 500, 'Tải thumbnail thất bại: ' + err.message)
  }
}
