
function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      // User not logged in
      return res.redirect('/login');
    }

    if (allowedRoles.includes(userRole)) {
      // User is authorized
      return next();
    }

    // User is unauthorized - redirect based on role
    switch (userRole) {
      case 'admin':
        return res.redirect('/admin');
      case 'artisan':
        return res.redirect('/artisan');
      case 'buyer':
        return res.redirect('/buyer');
      default:
        return res.redirect('/');
    }
  };
}

module.exports = authorizeRole;
