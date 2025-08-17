import { Schema, model } from 'mongoose'

// ===== Post Schema =====
const postSchema = new Schema(
  {
    // --- Basic info ---
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true }, // auto-generated from title
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },

    // --- Creator (instead of 'author') ---
    createdBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true }, // who created the post

    // --- Banner / media ---
    banner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // --- Status ---
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },

    // --- Tags / categories ---
    tags: [{ type: String, trim: true }],
    category: { type: String, trim: true },

    // --- SEO ---
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ===== Indexes =====
postSchema.index({ slug: 1 })
postSchema.index({ title: 1 })

export const Post = model('Post', postSchema)
