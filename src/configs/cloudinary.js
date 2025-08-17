import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = (fileBuffer, folder = 'uploads', square = false) => {
  const transformation = [
    {
      width: 800,
      crop: square ? 'fill' : 'limit',
      quality: 'auto:low',
      fetch_format: 'auto',
      ...(square && { height: 800, gravity: 'auto' }),
    },
  ]

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `chua-dieu-phap/${folder}`,
        resource_type: 'image',
        overwrite: true,
        discard_original_filename: true,
        transformation,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error('No result from Cloudinary'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )

    Readable.from(fileBuffer).pipe(uploadStream)
  })
}

export default cloudinary
