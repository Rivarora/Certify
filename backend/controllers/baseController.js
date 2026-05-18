export const homeController = (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/api/login");
  }

  res.render("home", { user: req.session.user });
};

export const statusController = (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date(),
    method: req.method,
    url: req.url
  });
};