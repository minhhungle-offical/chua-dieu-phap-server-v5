import { sendError } from '../utils/sendError.js'

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role

      if (!userRole) {
        return sendError(res, 401, 'Bạn chưa đăng nhập')
      }

      if (!roles.includes(userRole)) {
        return sendError(res, 403, 'Bạn không có quyền truy cập')
      }

      next()
    } catch (err) {
      return sendError(res, 500, 'Phân quyền thất bại')
    }
  }
}
