var express = require('express');
var router = express.Router();
const multer = require('multer');
router.use(express.urlencoded({extended: true}))
const mongoose = require('mongoose');
const fs = require('fs'); // file system module for dealing with the images
// Multer configuration
const upload = multer({ dest: 'uploads/' });
// MongoDB schema for recipes the image is not required
  const recipesSchema = new mongoose.Schema({
  instructions: { type: Array, required: true },
  ingredients: { type: Array, required: true },
  name: { type: String, required: true },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
});
// MongoDB schema for categories
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});
// MongoDB schema for images
const imageSchema = new mongoose.Schema({
  buffer: { type: Buffer, required: true },
  mimetype: { type: String, required: true },
  name: { type: String, required: true },
  encoding: { type: String, required: true }
});
// create models
const Recipe = mongoose.model('Recipe', recipesSchema);
const Category = mongoose.model('Category', categorySchema);
const Image = mongoose.model('Image', imageSchema);

// Middleware to serve static files
router.use(express.static('uploads/'));

// Route to get the home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Recipes' });
});
// Route to get a recipe
router.get('/recipe/:food', async function(req, res) {
  try {
    const food = req.params.food;
    const recipe = await Recipe.findOne({ name: food }).populate('images').populate('categories'); // Find recipe by name and populate images
    if (recipe) {
      res.json(recipe); // Return recipe if found
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/recipe/', async function(req, res) {
  try {
      const newRecipe = req.body;
      const existingRecipe = await Recipe.findOne({ name: newRecipe.name });
      if (existingRecipe) {
          return res.status(400).json({ error: 'Recipe already exists' });
      }
      // Find or create categories based on the checkbox values
      const categoryIds = [];
      if (newRecipe.categories.vegan) {
          const veganCategory = await Category.findOne({ name: 'vegan' });
          if (!veganCategory) {
              const createdVeganCategory = await Category.create({ name: 'vegan' });
              categoryIds.push(createdVeganCategory._id);
          } else {
              categoryIds.push(veganCategory._id);
          }
      }
      if (newRecipe.categories.glutenFree) {
          const glutenFreeCategory = await Category.findOne({ name: 'gluten-free' });
          if (!glutenFreeCategory) {
              const createdGlutenFreeCategory = await Category.create({ name: 'gluten-free' });
              categoryIds.push(createdGlutenFreeCategory._id);
          } else {
              categoryIds.push(glutenFreeCategory._id);
          }
      }
      if (newRecipe.categories.ovo) {
          const ovoCategory = await Category.findOne({ name: 'ovo' });
          if (!ovoCategory) {
              const createdOvoCategory = await Category.create({ name: 'ovo' });
              categoryIds.push(createdOvoCategory._id);
          } else {
              categoryIds.push(ovoCategory._id);
          }
      }
      // Get the latest uploaded image
      const latestImage = await Image.findOne().sort({ _id: -1 }).limit(1);

      // Create new recipe with the associated image
      const createdRecipe = await Recipe.create({
        ...newRecipe,
        images: latestImage._id, // Assuming images field in Recipe schema is ObjectId type
        categories: categoryIds
      });
      console.log("image meni");
      res.status(201).json(createdRecipe);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
// Route to handle image uploads
router.post('/images', upload.array('images', 2), async function(req, res) {
  try {
    const files = req.files;
    const uploadedImages = [];
    // Iterate over each file in req.files array
    for (const fileData of files) {
      // Create an instance of imageSchema using fileData
      const imageInstance = new Image({
        buffer: fs.readFileSync(fileData.path),
        mimetype: fileData.mimetype,
        name: fileData.originalname,
        encoding: fileData.encoding
      });
      // Save the image instance to the database
      const savedImage = await imageInstance.save();
      uploadedImages.push(savedImage);
    }
    console.log('Uploaded Images:', uploadedImages);
    res.status(201).json(uploadedImages);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Route to get an image by its ID
router.get('/images/:imageId', async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    // Set necessary headers for sending image
    res.set('Content-Type', image.mimetype);
    res.set('Content-Disposition', 'inline');
    res.send(image.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;