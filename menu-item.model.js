const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: String,
    type: String,
    inStock: Boolean,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
