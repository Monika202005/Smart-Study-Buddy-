/**
 * Authentication Middleware
 * Checks for JWT in Authorization header.
 * Provides fallback mock user context for development mode.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // In production, Member B verifies with jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      userId: 'default_student_1',
      name: 'Monika Sharma',
      email: 'monika@studybuddy.dev',
      token,
    };
    return next();
  }

  // Development fallback for seamless testing
  req.user = {
    userId: 'default_student_1',
    name: 'Monika Sharma',
    email: 'monika@studybuddy.dev',
  };
  return next();
}
