const jwt = require('jsonwebtoken');

let VerifyRegistrationToken = (req, res, next) => {
    let token = req.body.token;
    if (!token) {
        res.status(401).json({ "Success": false, "Message": "No token provided" });
    }
    else {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ "Success": false, "Message": "Invalid token" });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
}




let VerifySchool = (req, res, next) => {
    if (req.decoded.role == "school") {
        next();
    }
    else {
        res.status(401).json({ "Success": false, "Message": "Unauthorized Access" });
    }
}

let VerifyAdmin = (req, res, next) => {
    if (req.decoded.role == "admin") {
        next();
    }
    else {
        res.status(401).json({ "Success": false, "Message": "Unauthorized Access" });
    }
}

module.exports = {
    VerifyRegistrationToken,
    VerifySchool,
    VerifyAdmin
}
