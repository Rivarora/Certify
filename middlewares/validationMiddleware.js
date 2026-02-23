const validateCertificate = (req, res, next) => {
  const { name, email, company, role, duration } = req.body;

  if (!name || !email || !company || !role || !duration) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // simple email check
  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  next(); // continue to controller
};

export default validateCertificate;