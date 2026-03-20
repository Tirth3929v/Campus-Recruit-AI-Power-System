// This is a placeholder for your actual authentication middleware.
// It should verify a token (e.g., JWT) and attach the user's data to the request object.

const protect = (req, res, next) => {
  // In a real app, you would have real authentication logic here.
  // For demonstration, we'll attach a mock user ID.
  if (true) { // Replace with actual token verification
    req.user = {
      id: '60d0fe4f5311236168a109ca', // Mock user ID
    };
    next();
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
};

export { protect };