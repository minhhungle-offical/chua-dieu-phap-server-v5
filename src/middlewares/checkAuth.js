import { verifyToken } from '../utils/token.js'

export function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' })
  }
}
