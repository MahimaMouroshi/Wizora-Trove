export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.code === 11000 ? 'A record with this value already exists.' : err.message || 'Server error';
  res.status(status).json({ success: false, message, ...(err.details ? { details: err.details } : {}) });
}
