import * as yup from 'yup'
import { Admin } from '../../../models/admin.model.js'
import { generateOTP } from '../../../utils/generateOTP.js'
import { sendOtpEmail } from '../../../utils/sendOtp.js'
import { generateToken } from '../../../utils/token.js'
import { sendError } from '../../../utils/sendError.js'

// ===== Yup Schemas =====
const loginSchema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
})

const verifyOtpSchema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  otp: yup.string().length(6, 'OTP phải gồm 6 chữ số').required('Vui lòng nhập OTP'),
})

const updateMeSchema = yup.object({
  fullName: yup.string().trim().max(100, 'Họ tên tối đa 100 ký tự').nullable(),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{9,15}$/, 'Số điện thoại không hợp lệ')
    .nullable(),
})

// ===== Helpers =====
const issueOtp = async (admin, email) => {
  const otp = generateOTP()
  admin.otp = otp
  admin.otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 phút
  await admin.save()
  await sendOtpEmail(email, otp)
}

const handleValidationError = (error) => {
  if (error.inner && error.inner.length) {
    return error.inner.map((e) => e.message).join(', ')
  }
  return error.message
}

// ===== Đăng nhập =====
export const login = async (req, res) => {
  try {
    const { email } = await loginSchema.validate(req.body, { abortEarly: false })

    let admin = await Admin.findOne({ email })
    if (!admin) admin = new Admin({ email })

    await issueOtp(admin, email)

    return res.status(200).json({ message: 'OTP đã được gửi đến email của bạn', data: { email } })
  } catch (error) {
    return sendError(res, 400, 'Đăng nhập thất bại: ' + handleValidationError(error))
  }
}

// ===== Gửi lại OTP =====
export const resendOtp = async (req, res) => {
  try {
    const { email } = await loginSchema.validate(req.body, { abortEarly: false })

    const admin = await Admin.findOne({ email })
    if (!admin) return sendError(res, 404, 'Không tìm thấy quản trị viên')

    await issueOtp(admin, email)

    return res.status(200).json({ message: 'OTP đã được gửi lại đến email của bạn' })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Xác thực OTP =====
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = await verifyOtpSchema.validate(req.body, { abortEarly: false })

    const admin = await Admin.findOne({ email })
    if (!admin) return sendError(res, 404, 'Không tìm thấy quản trị viên')

    if (admin.otp !== otp) return sendError(res, 400, 'OTP không chính xác')
    if (!admin.otpExpires || admin.otpExpires < new Date()) {
      return sendError(res, 400, 'OTP đã hết hạn')
    }

    admin.isVerified = true
    admin.lastLoginAt = new Date()
    admin.otp = null
    admin.otpExpires = null
    await admin.save()

    const payload = {
      id: admin._id,
      role: admin.role,
      name: admin.fullName,
      email: admin.email,
    }

    const token = generateToken(payload)

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      data: { token, user: payload },
    })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Lấy thông tin cá nhân =====
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-otp -otpExpires')
    if (!admin) return sendError(res, 404, 'Không tìm thấy quản trị viên')

    return res.status(200).json({
      message: 'Lấy thông tin thành công',
      data: admin,
    })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Cập nhật thông tin cá nhân =====
export const updateMe = async (req, res) => {
  try {
    const { fullName, phone } = await updateMeSchema.validate(req.body, { abortEarly: false })

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { fullName, phone },
      { new: true },
    ).select('-otp -otpExpires')

    if (!admin) return sendError(res, 404, 'Không tìm thấy quản trị viên')

    return res.status(200).json({ message: 'Cập nhật hồ sơ thành công', data: admin })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}
