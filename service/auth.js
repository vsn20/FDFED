const jwt = require("jsonwebtoken");

const secret = "avula";

function setuser(user, companyOrEmployee) {
    const payload = {
        _id: user._id || undefined,
        user_id: user.user_id,
        emp_id: user.emp_id || undefined,
        c_id: user.c_id || undefined, // Changed from cid to c_id
        cname: companyOrEmployee?.cname || undefined,
        type: user.c_id // Changed from cid to c_id
            ? "company" 
            : (user.emp_id 
                ? companyOrEmployee.role.toLowerCase() 
                : "customer")
    };
    
    return jwt.sign(payload, secret);
}

function getuser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("getuser error:", error.message);
        return null;
    }
}

module.exports = {
    setuser,
    getuser,
};