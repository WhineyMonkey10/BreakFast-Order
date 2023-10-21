const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const MenuItem = require('./menu-item.model'); // Import the model
const Order = require('./order.model'); // Import your Order model

const { ObjectId } = require('mongoose').Types;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Set up MongoDB connection
mongoose.connect("uri", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

function sendAlertzyNotification(orderId, orderData, userName, userLocation, userInBed, notes) {
    const accountKey = 'm7c1jg1cjlp8hgu'; // Replace with your Alertzy account key
    const title = 'New Order';
    const items = orderData.items.map(item => item.name).join(', '); // Extract item names
    switch (userInBed) {
        case true:
            userInBed = 'Yes';
            break;
        case false:
            userInBed = 'No';
            break;
    }

    const message = `Order ID: ${orderId}\n\n, Name: ${userName}\n\n, Location: ${userLocation}\n\n, In Bed: ${userInBed}\n\n, Items: ${items} \n\n, Notes: ${notes}`;
    const orderPageURL = `http://127.0.0.1:3000/order/${orderId}`; // Replace with your actual application URL

    const notificationData = {
        accountKey,
        title,
        message,
        link: orderPageURL, // Include the link to the order details page
    };

    // Send the Alertzy notification
    fetch('https://alertzy.app/send?accountKey=' + accountKey + '&title=' + title + '&message=' + message + '&link=' + orderPageURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
        })
    .then(response => response.json())
    .catch(error => {
        console.error('Error sending Alertzy notification:', error);
    });
}

// Middleware
app.use(bodyParser.json());

// Serve the static index.html file
app.use(express.static(path.join(__dirname, 'public')));

// Serve the static index.html file from the "public" directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define a route to fetch menu items
app.get('/api/menu-items', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({});
        res.json(menuItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/send-order', async (req, res) => {
    const orderData = req.body;
    const userInformation = orderData.userInfo;

    if (!userInformation) {
        res.status(400).json({ error: 'User information is missing.' });
        return;
    }

    const userName = userInformation.userName;
    const userLocation = userInformation.userLocation;
    const userInBed = userInformation.userInBed;
    const notes = userInformation.notes;

    const orderId = new ObjectId();

    // Create a new order document in the database with user input
    const order = new Order({
        _id: orderId,
        items: orderData.items, // Ensure "items" is an array
        userInfo: {
            name: userName,
            location: userLocation,
            inBed: userInBed,
            notes: notes
        },
    });

    order.save()
        .then(() => {
            // Send an Alertzy notification with user information
            sendAlertzyNotification(orderId, orderData, userName, userLocation, userInBed, notes);

            // Respond with the order ID
            res.json({ orderId });
        })
        .catch(error => {
            console.error('Error saving order:', error);
            res.status(500).json({ error: 'Failed to save order' });
        });
});

app.get('/order/:id', async (req, res) => {
    const orderId = req.params.id; // Get the order ID from the URL

    try {
        // Use the new Mongoose query syntax for findById
        const order = await Order.findById(orderId).exec();

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
        } else {
            // Return the order details as JSON
            res.json(order);
        }
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ error: 'Failed to retrieve order details' });
    }
});

// Define routes for adding, removing, updating, and fetching menu items
app.post('/api/add-menu-item', async (req, res) => {
    const { name, type, inStock } = req.body;
    const newItem = new MenuItem({ name, type, inStock });
    try {
        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add the menu item.' });
    }
});

app.delete('/api/remove-menu-item/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    try {
        const deletedItem = await MenuItem.findByIdAndRemove(itemId);
        if (!deletedItem) {
            res.status(404).json({ error: 'Menu item not found.' });
        } else {
            res.json(deletedItem);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove the menu item.' });
    }
});

app.put('/api/update-menu-item/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    const { inStock } = req.body;
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(
            itemId,
            { inStock },
            { new: true }
        );
        if (!updatedItem) {
            res.status(404).json({ error: 'Menu item not found.' });
        } else {
            res.json(updatedItem);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update the menu item.' });
    }
});

app.use('/admin', express.static(path.join(__dirname, 'admin')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Add this line

// ... Your other routes ...

app.get('/admin/authenticate', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (username === 'admin' && password === 'password') {
        res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
    } else {
        res.sendFile(path.join(__dirname, 'admin', 'login.html'));
    }
});



// Protect the /admin route with authentication
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// TODO: Add estimated wait time to the order confirmation