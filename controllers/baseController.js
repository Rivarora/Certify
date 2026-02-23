export const homeController = (req, res) => {
  res.send("Welcome to ProofPoint Backend 🚀");
};

export const statusController = (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date(),
    method: req.method,
    url: req.url
  });
};