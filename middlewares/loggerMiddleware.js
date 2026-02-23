module.exports = (req, res, next) => {

    console.log("========== REQUEST RECEIVED ==========");
    console.log("Time:", new Date().toISOString());
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Headers:", req.headers);
    console.log("======================================");

    next(); // move to next middleware or route
};