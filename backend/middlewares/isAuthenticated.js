export async function isAuthenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        })
    }
    next();
}