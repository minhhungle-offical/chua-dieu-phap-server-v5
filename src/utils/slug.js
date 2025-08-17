import slugify from 'slugify'

export const generateUniqueSlug = async (title, Model, currentId = null) => {
  let baseSlug = slugify(title, { lower: true, strict: true })
  let slug = baseSlug
  let count = 0

  // check if slug exists
  while (await Model.findOne({ slug, _id: { $ne: currentId } })) {
    count++
    slug = `${baseSlug}-${count}`
  }

  return slug
}
