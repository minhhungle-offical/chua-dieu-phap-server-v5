import { Schema, model } from 'mongoose'

const retreatSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, required: true },
    slug: { type: String, required: true, trim: true, unique: true }, // auto-generated from title

    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate
        },
        message: 'End date must be after start date',
      },
    },
    maxParticipants: { type: Number, default: 0 },

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

    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },

    // --- Thumbnail / media ---
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // --- SEO ---
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
)

export const Retreat = model('Retreat', retreatSchema)
