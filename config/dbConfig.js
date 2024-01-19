const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const dbName = 'Recipe_Book'
const dbUrl = `mongodb+srv://rohit10231:rohitkaranpujari@cluster0.kjynvxt.mongodb.net/${dbName}`
const client = new MongoClient(dbUrl)
const db = client.db(dbName)

module.exports = { MongoClient, dbName, dbUrl }