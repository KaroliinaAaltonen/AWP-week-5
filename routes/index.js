var express = require('express');
var router = express.Router();
const multer = require('multer');
router.use(express.urlencoded({extended: true}))
// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/') // Destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname); // Keep the original filename
  }
});
const upload = multer({ storage: storage });
// recipes array with some recipes to begin with
const recipes = {
  pizza: {
    name: 'Pizza',
    instructions: ['Step 1: Prepare the dough', 'Step 2: Add toppings', 'Step 3: Bake in oven'],
    ingredients: ['Dough', 'Tomato Sauce', 'Cheese', 'Toppings']
  },
  pasta: {
    name: 'Pasta',
    instructions: ['Step 1: Boil water', 'Step 2: Cook pasta', 'Step 3: Add sauce'],
    ingredients: ['Pasta', 'Tomato Sauce', 'Herbs']
  }
};
// Route to get the home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Recipes' });
});
// Route to get a recipe
router.get('/recipe/:food', function(req, res) {
  // Convert the food parameter to lowercase
  const food = req.params.food.toLowerCase();
  // Check if the food exists in the recipes array
  if (recipes.hasOwnProperty(food)) { 
      const recipe = recipes[food];
      res.json({
          name: recipe.name,
          instructions: recipe.instructions,
          ingredients: recipe.ingredients
      });
  } else {
      // Return placeholder values if the food is not found
      res.json({
          name: 'Unknown',
          instructions: ['Instructions not available'],
          ingredients: ['Ingredients not available']
      });
  }
});
// Route to append new recipe to the array
router.post('/recipe/', function(req, res) {
  const newRecipe = req.body;
  // case-insensitive comparison
  const foodName = newRecipe.name.toLowerCase();
  // Check if the recipe already exists
  if (recipes.hasOwnProperty(foodName)) {
      res.status(400).json({ error: 'Recipe already exists' });
  } else {
      // Add the new recipe to the recipes object
      recipes[foodName] = {
          name: newRecipe.name,
          instructions: newRecipe.instructions,
          ingredients: newRecipe.ingredients
      };
      // Return the added recipe
      res.json(recipes[foodName]); 
  }
});
// Route to handle image uploads but it doesn't do anything
router.post('/images', upload.array('images', 2), function(req, res) {
  // Array of uploaded files
  const uploadedFiles = req.files;
  res.json({ message: 'Hi' });
});
module.exports = router;