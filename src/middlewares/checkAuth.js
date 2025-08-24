import { verifyToken } from '../utils/token.js'

export function checkAuth(req, res, next) {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' })
    }

    const decoded = verifyToken(token)
    req.user = decoded

    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' })
  }
}
