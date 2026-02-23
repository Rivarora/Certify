exports.homeController = (req, res) => {
    res.send("Welcome to ProofPoint Backend 🚀");
};

exports.statusController = (req, res) => {
    res.json({
        status: "Server is running",
        timestamp: new Date(),
        method: req.method,
        url: req.url
    });
};