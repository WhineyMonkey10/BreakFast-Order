const mongoose = require('mongoose');
const MenuItem = require('./menu-item.model'); // Import the model

// Connect to MongoDB (use your connection string)
mongoose.connect('mongodb+srv://gabriel:muDCV76wh0GFb2FL@foodordering.vkjjrtk.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const sampleItems = [
    { name: "Burger", type: "Meal", inStock: true },
    { name: "Fries", type: "Side", inStock: true },
    { name: "Soda", type: "Drink", inStock: false },
];

// Function to seed the database with sample menu items
const seedDatabase = async () => {
    try {
        await MenuItem.deleteMany({}); // Remove existing items
        await MenuItem.insertMany(sampleItems); // Insert sample items
        console.log("Sample items have been added to the database.");
    } catch (error) {
        console.error("Error seeding the database:", error);
    } finally {
        mongoose.connection.close(); // Close the database connection
    }
};

seedDatabase();
