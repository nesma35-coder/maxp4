const permissions = (...allowedPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const hasPermission = allowedPermissions.some(perm => 
      req.user.hasPermission(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for this action',
        requiredPermissions: allowedPermissions
      });
    }

    next();
  };
};

module.exports = permissions;
