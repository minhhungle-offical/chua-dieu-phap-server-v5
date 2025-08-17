import cloudinary from 'cloudinary'
import * as yup from 'yup'
import { uploadToCloudinary } from '../../../configs/cloudinary.js'
import { Member } from '../../../models/member.model.js'
import { generateOTP } from '../../../utils/generateOTP.js'
import { sendError } from '../../../utils/sendError.js'
import { sendOtpEmail } from '../../../utils/sendOtp.js'
import { generateToken } from '../../../utils/token.js'

// ===== Yup Schemas =====
export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
})

export const verifyOtpSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
})

export const updateMeSchema = yup.object({
  fullName: yup.string().trim().max(100, 'Full name max 100 chars').nullable(),
  dharmaName: yup.string().trim().max(100, 'Dharma name max 100 chars').nullable(),
  dateOfBirth: yup.date().nullable(),
  gender: yup.string().oneOf(['male', 'female', 'other']).nullable(),
  maritalStatus: yup.string().oneOf(['single', 'married']).nullable(),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{9,15}$/, 'Invalid phone number')
    .nullable(),
  address: yup.string().trim().max(255, 'Address max 255 chars').nullable(),
  notes: yup.string().trim().max(500, 'Notes max 500 chars').nullable(),
  ordinationDate: yup.date().nullable(),
  avatar: yup
    .object({
      url: yup.string().trim().url().nullable(),
      publicId: yup.string().trim().nullable(),
    })
    .nullable(),
})

// ===== Helpers =====
const issueOtp = async (member, email) => {
  const otp = generateOTP()
  member.otp = otp
  member.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 min
  await member.save()
  await sendOtpEmail(email, otp)
}

const handleValidationError = (error) => {
  if (error.inner && error.inner.length) {
    return error.inner.map((e) => e.message).join(', ')
  }
  return error.message
}

// ===== Login =====
export const login = async (req, res) => {
  try {
    const { email } = await loginSchema.validate(req.body, { abortEarly: false })

    let member = await Member.findOne({ email })
    if (!member) member = new Member({ email })

    await issueOtp(member, email)

    return res.status(200).json({ message: 'OTP sent to email', data: { email } })
  } catch (error) {
    return sendError(res, 400, 'Login failed: ' + handleValidationError(error))
  }
}

// ===== Resend OTP =====
export const resendOtp = async (req, res) => {
  try {
    const { email } = await loginSchema.validate(req.body, { abortEarly: false })

    const member = await Member.findOne({ email })
    if (!member) return sendError(res, 404, 'Member not found')

    await issueOtp(member, email)

    return res.status(200).json({ message: 'OTP resent to email' })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Verify OTP =====
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = await verifyOtpSchema.validate(req.body, { abortEarly: false })

    const member = await Member.findOne({ email })
    if (!member) return sendError(res, 404, 'Member not found')

    if (!member.verifyOtp(otp)) return sendError(res, 400, 'Invalid or expired OTP')

    member.isVerified = true
    member.lastLoginAt = new Date()
    member.otp = null
    member.otpExpiresAt = null
    await member.save()

    const payload = { id: member._id, email: member.email }
    const token = generateToken(payload)

    return res.status(200).json({
      message: 'Login success',
      data: { token, user: payload },
    })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Get Me =====
export const getMe = async (req, res) => {
  try {
    const member = await Member.findById(req.user.id).select('-otp -otpExpiresAt')
    if (!member) return sendError(res, 404, 'Member not found')

    return res.status(200).json({ message: 'Profile fetched', data: member })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Update Me =====
export const updateMe = async (req, res) => {
  try {
    const validated = await updateMeSchema.validate(req.body, { abortEarly: false })
    const member = await Member.findByIdAndUpdate(req.user.id, validated, { new: true }).select(
      '-otp -otpExpiresAt',
    )

    if (!member) return sendError(res, 404, 'Member not found')

    return res.status(200).json({ message: 'Profile updated', data: member })
  } catch (error) {
    return sendError(res, 400, handleValidationError(error))
  }
}

// ===== Upload admin avatar =====
export const uploadAdminAvatar = async (req, res) => {
  try {
    const { id: memberId } = req.params
    if (!req.file) return sendError(res, 400, 'Chưa chọn file để tải lên')

    const member = await Member.findById(memberId)
    if (!member) return sendError(res, 404, 'Không tìm thấy member')

    // Upload new avatar to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'avatars', true)

    // Remove old avatar if exists
    if (member.avatar?.publicId) {
      await cloudinary.uploader.destroy(member.avatar.publicId).catch(() => null)
    }

    member.avatar = { url, publicId }
    await member.save()

    return res.json({ success: true, data: member })
  } catch (err) {
    return sendError(res, 500, 'Tải avatar thất bại: ' + err.message)
  }
}
