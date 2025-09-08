const { getuser } = require("../service/auth");

function restrictlogedinuser(req, res, next) {
    const token = req.cookies.uid;
    const user = getuser(token);

    if (!user) return res.redirect("/");

    req.user = user;
    next();
}

function restrict(role) {
    return (req, res, next) => {
        const token = req.cookies.uid;
        const user = getuser(token);

        if (!user || user.type !== role.toLowerCase()) {
            return res.status(403).send("Unauthorized");
        }

        req.user = user;
        next();
    };
}

module.exports = {
    restrictlogedinuser,
    restrict,
};