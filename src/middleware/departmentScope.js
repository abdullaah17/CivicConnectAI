/**
 * Enforces department scope for dept_admin users.
 * Sets req.scopedDepartmentId so controllers can filter by it.
 */
function enforceDeptScope(req, res, next) {
  if (req.user && req.user.role === 'dept_admin') {
    req.scopedDepartmentId = req.user.department_id;
  }
  next();
}

module.exports = enforceDeptScope;
