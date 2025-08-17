import { Schema, model } from 'mongoose'

// ===== Member Schema =====
const memberSchema = new Schema(
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
    phone: {
      type: String,
      unique: true,
      sparse: true, // allow null
      trim: true,
      match: [/^\+?\d{7,15}$/, 'Invalid phone number'],
    },
    isVerified: { type: Boolean, default: false },

    // --- Personal info ---
    fullName: { type: String, trim: true },
    dharmaName: { type: String, trim: true },
    ordinationDate: { type: Date },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: {
      type: String,
      enum: ['single', 'married'],
      default: 'single',
    },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },

    // --- Authentication & security ---
    otp: { type: String },
    otpExpiresAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lastLoginAt: { type: Date },

    // --- Avatar / media ---
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // --- Activity / status flags ---
    isActive: { type: Boolean, default: true }, // soft delete / ban
    isMonk: { type: Boolean, default: false }, // đánh dấu nếu là monk / ordained

    // --- participants ---
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Participant',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ===== Indexes =====
memberSchema.index({ email: 1 })
memberSchema.index({ phone: 1 })

// ===== Instance methods =====
memberSchema.methods.verifyOtp = function (otpInput) {
  return this.otp === otpInput && this.otpExpiresAt && this.otpExpiresAt > new Date()
}

// ===== Static methods =====
memberSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
}

export const Member = model('Member', memberSchema)
