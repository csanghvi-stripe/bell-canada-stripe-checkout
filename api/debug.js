module.exports = (req, res) => {
    // Return basic environment info for debugging
    res.json({
      nodejs: process.version,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      stripeKeyDefined: !!process.env.STRIPE_SECRET_KEY,
      deploymentUrl: process.env.VERCEL_URL || 'unknown'
    });
  };
  