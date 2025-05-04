// Application configuration
module.exports = {
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '30d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 30
  },
  
  // User roles
  roles: {
    CUSTOMER: 'customer',
    PROVIDER: 'provider',
    ADMIN: 'admin'
  },
  
  // Order status
  orderStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  }
};
