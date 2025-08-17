import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    // --- Basic info ---
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Invalid email address'],
    },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },

    // --- Role & permissions ---
    role: { type: String, enum: ['admin', 'owner'], default: 'admin' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // soft delete

    lastLoginAt: { type: Date },

    // --- OTP login fields ---
    otp: { type: String },
    otpExpires: { type: Date },
    loginAttempts: { type: Number, default: 0 },

    // --- Avatar / media ---
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false },
)

// --- Indexes ---
adminSchema.index({ email: 1 })

// --- Instance methods ---
adminSchema.methods.verifyOtp = function (otpInput) {
  return this.otp === otpInput && this.otpExpiresAt && this.otpExpiresAt > new Date()
}

// --- Static methods ---
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
}

export const Admin = mongoose.model('Admin', adminSchema)
