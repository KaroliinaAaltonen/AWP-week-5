document.addEventListener('DOMContentLoaded', function () {
    // Function to handle search when Enter key is pressed
    document.getElementById('search-bar').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            const searchTerm = event.target.value.trim();
            if (searchTerm) {
                fetchAndDisplayRecipe(searchTerm);
                // Clear the search bar after initiating the fetch
                event.target.value = '';
            }
        }
    });

    // Function to fetch and display recipe data
    function fetchAndDisplayRecipe(food) {
        fetch(`/recipe/${food}`)
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Recipe not found');
                }
                return res.json();
            })
            .then(function (data) {
                // Clear existing recipe data
                clearRecipe();
                // Update recipe details
                document.getElementById('recipe-name').textContent = data.name;
                displayIngredients(data.ingredients);
                displayInstructions(data.instructions);
                displayCategories(data.categories);
                // Display images if available
                displayImages(data.images[0]._id);
            })
            .catch(function (error) {
                console.error('Error:', error.message);
                clearRecipe(); // Clear recipe data on error
                document.getElementById('recipe-name').textContent = 'Recipe not found';
            });
    }

    function displayCategories(categories) {
        const categoriesList = document.getElementById('recipe-categories');
        categories.forEach(category => {
            const listItem = document.createElement('li');
            // Display category name
            listItem.textContent = category.name; // Assuming category object has a 'name' property
            categoriesList.appendChild(listItem);
        });
    }

    function displayIngredients(ingredients) {
        const ingredientList = document.getElementById('recipe-ingredients');
        ingredients.forEach(ingredient => {
            const listItem = document.createElement('li');
            listItem.textContent = ingredient;
            ingredientList.appendChild(listItem);
        });
    }

    function displayInstructions(instructions) {
        const instructionList = document.getElementById('recipe-instructions');
        instructions.forEach(instruction => {
            const listItem = document.createElement('li');
            listItem.textContent = instruction;
            instructionList.appendChild(listItem);
        });
    }

    // Function to clear existing recipe data
    function clearRecipe() {
        document.getElementById('recipe-name').textContent = '';
        document.getElementById('recipe-ingredients').textContent = '';
        document.getElementById('recipe-instructions').textContent = '';
        // Clear images
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = '';
        // Clear categories
        const categoriesList = document.getElementById('recipe-categories');
        categoriesList.innerHTML = '';
    }

    // Function to display images
    function displayImages(imageId) {
        const imageContainer = document.getElementById('image-container');
        // Clear previous images
        imageContainer.innerHTML = '';
        if (imageId) {
            console.log(imageId);
            fetch(`/images/${imageId}`)
                .then(function (res) {
                    if (!res.ok) {
                        throw new Error('Image not found');
                    }
                    return res.blob(); // Get image data as a Blob
                })
                .then(function (blob) {
                    // Create an img element and set its source to the Blob URL
                    const imgElement = document.createElement('img');
                    imgElement.src = URL.createObjectURL(blob);
                    imgElement.alt = 'Recipe Image';
                    imgElement.classList.add('rounded-image');
                    imageContainer.appendChild(imgElement);
                })
                .catch(function (error) {
                    console.error('Error:', error.message);
                });
        }
    }

    // Display default recipe (Pizza) when the page loads
    fetchAndDisplayRecipe('Pizza');

    // Add event listener for adding ingredients
    document.getElementById('add-ingredient').addEventListener('click', function () {
        // Clear existing recipe data
        if(document.getElementById('recipe-name').textContent !== ''){
            clearRecipe();
        } 
        var ingredientText = document.getElementById('ingredients-text').value.trim();
        if (ingredientText) {
            // Append the new ingredient to the ingredient list
            const ingredientList = document.getElementById('recipe-ingredients');
            const listItem = document.createElement('li');
            listItem.textContent = ingredientText;
            ingredientList.appendChild(listItem);
            // Clear the ingredient input field
            document.getElementById('ingredients-text').value = '';
        }
    });
    // Add event listener for adding instructions
    document.getElementById('add-instruction').addEventListener('click', function () {
        // Clear existing recipe data
        if(document.getElementById('recipe-name').textContent !== ''){
            clearRecipe();
        } 
        var instructionText = document.getElementById('instructions-text').value.trim();
        if (instructionText) {
            // Append the new instruction to the instruction list
            const instructionList = document.getElementById('recipe-instructions');
            const listItem = document.createElement('li');
            listItem.textContent = instructionText;
            instructionList.appendChild(listItem);
            // Clear the instruction input field
            document.getElementById('instructions-text').value = '';
        }
    });
    // Add event listener for form submission to fetch and display the submitted recipe
    document.getElementById('recipe-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        const name = document.getElementById('name-text').value.trim();
        const ingredients = Array.from(document.querySelectorAll('#recipe-ingredients li')).map(li => li.textContent.trim());
        const instructions = Array.from(document.querySelectorAll('#recipe-instructions li')).map(li => li.textContent.trim());
        // Get checkbox values
        const vegan = document.getElementById('vegan-checkbox').checked;
        const glutenFree = document.getElementById('gluten-free-checkbox').checked;
        const ovo = document.getElementById('ovo-checkbox').checked;
        // Assign checkbox values to recipe data
        const categories = { vegan: vegan, glutenFree: glutenFree, ovo: ovo };
        const recipeData = {
            name: name,
            ingredients: ingredients,
            instructions: instructions,
            categories: categories
        };
        // Upload images
        const formData = new FormData();
        const imageInput = document.getElementById('image-input');
        for (const file of imageInput.files) {
            formData.append('images', file);
        }
        try {
            // Send a POST request to upload images
            const imageResponse = await fetch('/images', {
                method: 'POST',
                body: formData
            });
            if (!imageResponse.ok) {
                throw new Error('Failed to upload images');
            }
            const imageData = await imageResponse.json();
            // Add the uploaded image IDs to the recipe data
            recipeData.images = imageData.map(image => image._id);
    
            // Send a POST request to add the new recipe along with the image IDs
            const recipeResponse = await fetch('/recipe/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            });
            if (!recipeResponse.ok) {
                throw new Error('Failed to add recipe');
            }
            const recipeResult = await recipeResponse.json();
            // Display the newly added recipe
            fetchAndDisplayRecipe(name);
            // Clear all input fields and checkbox selections
            document.getElementById('name-text').value = '';
            document.getElementById('ingredients-text').value = '';
            document.getElementById('instructions-text').value = '';
            document.getElementById('image-input').value = '';
            document.getElementById('vegan-checkbox').checked = false;
            document.getElementById('gluten-free-checkbox').checked = false;
            document.getElementById('ovo-checkbox').checked = false;
        } catch (error) {
            console.error('Error:', error.message);
        }
    });    
});
