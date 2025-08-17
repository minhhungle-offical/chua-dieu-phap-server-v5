import { Schema, model } from 'mongoose'

const robeSchema = new Schema(
  {
    participant: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
    type: { type: String, enum: ['borrow', 'buy'], required: true },
    size: { type: String },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'borrowed', 'returned', 'paid'], default: 'pending' },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'robe_transactions',
  },
)

export const RobeTransaction = model('RobeTransaction', robeSchema)
