var express = require('express');
var router = express.Router();
const { dbName, dbUrl, MongoClient } = require('./../config/dbConfig')

// get all recipes
router.get('/', async (req, res) => {
    const client = new MongoClient(dbUrl)
    await client.connect()
    try {
        const db = client.db(dbName)
        const collection = db.collection('All_Recipes')
        let recipes = await collection.find().toArray()
        if (recipes.length) {
            res.status(200).send(recipes)
        }
        else {
            res.status(400).send({ message: "Recipes data not found" })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
});

// save recipes
router.put('/saveRecipe/:userId', async (req, res) => {
    const client = await MongoClient.connect(dbUrl)
    try {
        const db = client.db('Recipe_Book')
        delete req.body._id
        req.params.userId = parseInt(req.params.userId)
        let saveRecipe = await db.collection('All_Users').updateOne({ userId: req.params.userId }, { $set: req.body })
        res.status(200).send({ message: 'recipe saved', data: saveRecipe })
    }
    catch (error) {
        res.status(500).send({ message: 'Internal server error', error })
    }
    finally {
        client.close()
    }
})

// delete recipe
router.delete('/delete/:recipeId', async (req, res) => {
    const client = new MongoClient(dbUrl)
    await client.connect()
    try {
        const db = client.db(dbName)
        const collection = db.collection('All_Recipes')
        let deletedRecipe = await collection.deleteOne({ recipeId: parseInt(req.params.recipeId) })
        res.status(200).send({ message: 'Recipe successfully deleted', data: deletedRecipe })
    }
    catch (error) {
        res.status(500).send({ message: 'Internal server error' })
    }
    finally {
        client.close()
    }
})

module.exports = router;