document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch and display recipe data
    function fetchAndDisplayRecipe(food) {
        fetch(`http://localhost:3000/recipe/${food}`)
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                // Clear existing recipe data
                clearRecipe();
                // Update recipe details
                document.getElementById('recipe-name').textContent = data.name;
                document.getElementById('recipe-ingredients').textContent = data.ingredients.join(', ');
                document.getElementById('recipe-instructions').textContent = data.instructions.join('\n');
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    }
    // Function to clear existing recipe data
    function clearRecipe() {
        document.getElementById('recipe-name').textContent = '';
        document.getElementById('recipe-ingredients').textContent = '';
        document.getElementById('recipe-instructions').textContent = '';
    }
    // Function to display the current recipe details
    function displayRecipe() {
        // Display recipe logic goes here
    }
    // Display default recipe (pizza) when the page loads
    fetchAndDisplayRecipe('pizza');
    // Add event listener for form submission to fetch and display the submitted recipe
    document.getElementById('recipe-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name-text').value.trim();
        const ingredients = document.getElementById('ingredients-text').value.trim().split('\n');
        const instructions = document.getElementById('instructions-text').value.trim().split('\n');
        const recipeData = {
            name: name,
            ingredients: ingredients,
            instructions: instructions
        };
        // Send a POST request to add the new recipe
        fetch('http://localhost:3000/recipe/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        })
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            // Display the newly added recipe
            fetchAndDisplayRecipe(name);
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
        // Upload images
        const formData = new FormData();
        const imageInput = document.getElementById('image-input');
        for (const file of imageInput.files) {
            formData.append('images', file);
        }
        fetch('http://localhost:3000/images', {
            method: 'POST',
            body: formData
        })
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            // Handle response if needed
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
        // Clear all input fields
        document.getElementById('name-text').value = '';
        document.getElementById('ingredients-text').value = '';
        document.getElementById('instructions-text').value = '';
        document.getElementById('image-input').value = ''; // Clear file input field
    });
    // Add event listeners for adding ingredients and instructions
    var recipe = {
        name: '',
        ingredients: [],
        instructions: []
    };
    document.getElementById('add-ingredient').addEventListener('click', function () {
        var ingredientText = document.getElementById('ingredients-text').value.trim();
        if (ingredientText) {
            recipe.ingredients.push(ingredientText);
            document.getElementById('ingredients-text').value = '';
            displayRecipe();
        }
    });
    document.getElementById('add-instruction').addEventListener('click', function () {
        var instructionText = document.getElementById('instructions-text').value.trim();
        if (instructionText) {
            recipe.instructions.push(instructionText);
            document.getElementById('instructions-text').value = '';
            displayRecipe();
        }
    });
});
