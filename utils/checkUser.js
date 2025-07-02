const checkUser = (req, res, user, message) => {
  const role = req.user.role;
  const users = user.trim().split(",");

  if (!users.includes(role)) {
    return res.status(403).json({ message });
  }
};

module.exports = checkUser;
