export function checkPrivileged(req, res, next) {
  const user = req.user

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (user.role === 'admin' || user.role === 'owner') {
    return next()
  }

  return res.status(403).json({ message: 'Forbidden: insufficient privileges' })
}
