import { Schema, model } from 'mongoose'

// ===== Participant Schema =====
const participantSchema = new Schema(
  {
    // --- Link to Retreat ---
    retreat: {
      type: Schema.Types.ObjectId,
      ref: 'Retreat',
      required: true, // each participant must belong to a retreat
    },

    // --- Link to Member (the participant/monk) ---
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true, // each participant must be associated with a member
    },

    // --- Participation status ---
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending', // registration is pending by default
    },

    // --- Payment info ---
    paymentAmount: { type: Number, default: 0 }, // payment amount for the retreat
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid', // default is unpaid
    },

    // --- Registration date & notes ---
    registeredAt: { type: Date, default: Date.now }, // date of registration
    notes: { type: String, trim: true }, // optional notes about the participant
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  },
)

// ===== Indexes =====
participantSchema.index(
  { retreat: 1, member: 1 },
  { unique: true }, // ensures each member can only join the same retreat once
)

export const Participant = model('Participant', participantSchema)
