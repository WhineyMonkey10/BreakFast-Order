const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  items: [
    {
      name: String, // Name of the item
      type: String, // Type of the item (e.g., meal, side, drink)
    },
  ],
  userInfo: {
    name: String, // User's name
    location: String, // User's location
    inBed: Boolean, // User's choice of in bed or not
  },
  timestamp: { type: Date, default: Date.now }, // Timestamp of when the order was created
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
