import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [scheme, token] = authorization?.split(' ') || [];

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: { message: 'Authentication required.' } });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Invalid or expired token.' } });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: { message: 'You do not have permission to perform this action.' } });
  }
  next();
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
};
