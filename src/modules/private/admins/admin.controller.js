import * as Yup from 'yup'
import { Admin } from '../../../models/admin.model.js'
import { sendError } from '../../../utils/sendError.js'
import cloudinary, { uploadToCloudinary } from '../../../configs/cloudinary.js'

// ===== Yup validation schema =====
const adminValidationSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập Email'),
  fullName: Yup.string().required('Vui lòng nhập Họ và tên'),
  phone: Yup.string()
    .matches(/^(?:\+84|0)[0-9]{9}$/, 'Số điện thoại không hợp lệ')
    .nullable()
    .transform((val) => (val === '' ? null : val)),
})

// ===== Create new admin =====
export const createAdmin = async (req, res) => {
  try {
    const body = await adminValidationSchema.validate(req.body, { abortEarly: false })
    body.role = 'admin'
    body.isVerified = false

    const admin = new Admin(body)
    await admin.save()

    return res.status(201).json({ success: true, data: admin })
  } catch (err) {
    return sendError(res, 400, 'Tạo admin thất bại: ' + err.message)
  }
}

// ===== Get all admins =====
export const getAdmins = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.max(parseInt(req.query.limit) || 10, 1)
    const skip = (page - 1) * limit

    const filters = {}
    if (req.query.role) filters.role = req.query.role
    if (req.query.isVerified) filters.isVerified = req.query.isVerified === 'true'
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i')
      filters.$or = [{ fullName: regex }, { email: regex }]
    }

    const [admins, total] = await Promise.all([
      Admin.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Admin.countDocuments(filters),
    ])

    return res.json({
      success: true,
      data: {
        data: admins,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (err) {
    return sendError(res, 500, 'Lấy danh sách admin thất bại: ' + err.message)
  }
}

// ===== Get single admin by ID =====
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
    if (!admin) return sendError(res, 404, 'Không tìm thấy admin')

    return res.json({ success: true, data: admin })
  } catch (err) {
    return sendError(res, 500, 'Lấy thông tin admin thất bại: ' + err.message)
  }
}

// ===== Update admin by ID =====
export const updateAdmin = async (req, res) => {
  try {
    const body = await adminValidationSchema.validate(req.body, { abortEarly: false })
    const admin = await Admin.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    })
    if (!admin) return sendError(res, 404, 'Không tìm thấy admin')

    return res.json({ success: true, data: admin })
  } catch (err) {
    return sendError(res, 400, 'Cập nhật admin thất bại: ' + err.message)
  }
}

// ===== Delete admin by ID =====
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id)
    if (!admin) return sendError(res, 404, 'Không tìm thấy admin')

    return res.json({ success: true, message: 'Xóa admin thành công' })
  } catch (err) {
    return sendError(res, 500, 'Xóa admin thất bại: ' + err.message)
  }
}

// ===== Upload admin avatar =====
export const uploadAdminAvatar = async (req, res) => {
  try {
    const { id: adminId } = req.params
    if (!req.file) return sendError(res, 400, 'Chưa chọn file để tải lên')

    const admin = await Admin.findById(adminId)
    if (!admin) return sendError(res, 404, 'Không tìm thấy admin')

    // Upload new avatar to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'avatars', true)

    // Remove old avatar if exists
    if (admin.avatar?.publicId) {
      await cloudinary.uploader.destroy(admin.avatar.publicId).catch(() => null)
    }

    admin.avatar = { url, publicId }
    await admin.save()

    return res.json({ success: true, data: admin })
  } catch (err) {
    return sendError(res, 500, 'Tải avatar thất bại: ' + err.message)
  }
}
