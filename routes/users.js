var express = require('express');
var router = express.Router();
const { dbName, dbUrl, MongoClient } = require('./../config/dbConfig')
const { hashPassword, hashCompare, createToken, validate } = require('../common/auth')

// get all users
router.get('/', async (req, res) => {
  const client = new MongoClient(dbUrl)
  await client.connect()
  try {
    const db = client.db(dbName)
    const collection = db.collection('All_Users')
    let user = await collection.find().toArray()
    if (user.length) {
      res.status(200).send(user)
    }
    else {
      res.status(400).send({ message: "Users data not found" })
    }
  }
  catch (error) {
    // console.log(error);
    res.status(500).send({ message: 'Internal server error', error })
  }
  finally {
    client.close()
  }
});

// user login
router.get('/login/:email/:password', async (req, res) => {
  const client = new MongoClient(dbUrl)
  await client.connect()
  try {
    const db = client.db(dbName)
    const collection = db.collection('All_Users')
    let user = await collection.aggregate([{ $match: { email: req.params.email } }]).toArray()
    if (user.length) {
      if (req.params.password === undefined || req.params.password === null) {
        let token = createToken({ name: user[0].name, email: user[0].email })
        res.status(200).send({ message: 'Login successful', userData: user, tokenData: token })
      }
      else {
        // let passwordCheck = await hashCompare(req.params.password, user[0].password)
        if (await hashCompare(req.params.password, user[0].password)) {
          let token = createToken({ name: user[0].name, email: user[0].email })
          res.status(200).send({ message: 'Login successful', userData: user, tokenData: token })
        }
        else {
          res.status(400).send({ message: 'Invalid login credentials' })
        }
      }
    }
    else {
      res.status(400).send({ message: 'Invalid login credentials' })
    }
  }
  catch (error) {
    // console.log(error);
    res.status(500).send({ message: 'Internal server error', error })
  }
  finally {
    client.close()
  }
});

// user signup
router.post('/signup', async (req, res) => {
  const client = new MongoClient(dbUrl)
  await client.connect()
  try {
    const db = client.db(dbName)
    const collection = db.collection('All_Users')
    let user = await collection.aggregate([{ $match: { email: req.body.email } }]).toArray()
    if (user.length) {
      res.status(400).send({ message: "Email address already exist" })
    }
    else {
      const userInfo = await collection.aggregate([{ $sort: { userId: -1 } }]).toArray()
      if (userInfo.length) {
        if (userInfo[0].userId === undefined || userInfo[0].userId === null) {
          req.body.userId = 1
        }
        else {
          req.body.userId = userInfo[0].userId + 1
        }
      }
      else {
        req.body.userId = 1
      }
      if (req.body.password === undefined || req.body.password === null) {
        await collection.insertOne(req.body)
        res.status(201).send({ message: 'Signup successful', data: req.body })
      }
      else {
        let hashedPassword = await hashPassword(req.body.password)
        req.body.password = hashedPassword
        await collection.insertOne(req.body)
        res.status(201).send({ message: 'Signup successful', data: req.body })
      }
    }
  }
  catch (error) {
    // console.log(error);
    res.status(500).send({ message: 'Internal server error', error })
  }
  finally {
    client.close()
  }
})

// user password change
router.put('/changePassword/:email/:securityCode', async (req, res) => {
  const client = new MongoClient(dbUrl)
  await client.connect()
  try {
    const db = client.db(dbName)
    const collection = db.collection('All_Users')
    let user = await collection.aggregate([{ $match: { email: req.params.email, securityCode: req.params.securityCode } }]).toArray()
    if (user.length) {
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword
      await collection.updateOne({ email: req.params.email, securityCode: req.params.securityCode }, { $set: req.body })
      res.status(200).send({ message: 'Password updated successfully' })
    }
    else {
      res.status(400).send({ message: 'Invalid credentials' })
    }
  }
  catch (error) {
    res.status(500).send({ message: 'Internal server error', error })
  }
  finally {
    client.close()
  }
})

// update user info and save recipes
router.put('/update/:email', validate, async (req, res) => {
  const client = new MongoClient(dbUrl)
  await client.connect()
  try {
    const db = client.db(dbName)
    const collection = db.collection('All_Users')
    if (req.body.password) {
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword
    }
    let updatedData = await collection.updateOne({ email: req.params.email }, { $set: req.body })
    res.status(200).send({ message: 'Information successfully updated', data: updatedData })
  }
  catch (error) {
    res.status(500).send({ message: 'Internal server error', error })
  }
  finally {
    client.close()
  }
})

// delete user account
router.delete('/delete/:email', async (req, res) => {
  const client = new MongoClient(dbUrl)
  await client.connect()
  try {
    const db = client.db(dbName)
    const collection = db.collection('All_Users')
    let deletedUser = await collection.deleteOne({ email: req.params.email })
    res.status(200).send({ message: 'User successfully deleted', data: deletedUser })
  }
  catch (error) {
    res.status(500).send({ message: 'Internal server error' })
  }
  finally {
    client.close()
  }
})

module.exports = router;