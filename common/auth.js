const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretKey = 'abyz@cdwx'

async function hashPassword(password) {
    let salt = await bcrypt.genSalt(10)
    let hash = await bcrypt.hash(password, salt)
    return hash
}

async function hashCompare(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

function createToken(payload) {
    let token = jwt.sign(payload, secretKey, { expiresIn: '2m' })
    return token
}

async function decodeToken(token) {
    let data = jwt.decode(token)
    return data
}

async function validate(req, res, next) {
    // console.log(req.headers.authorization.split(" ")[1]);
    if (req.headers.authorization) {
        let token = req.headers.authorization.split(" ")[1]
        let data = await decodeToken(token)
        // console.log(data);
        if (Math.round(Date.now() / 1000) <= data.exp) {
            next()
        }
        else {
            res.status(401).send({ message: 'Token expired' })
        }
    }
    else {
        res.status(400).send({ message: 'No token found' })
    }
}

module.exports = { hashPassword, hashCompare, createToken, validate }