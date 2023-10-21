const addItemButton = document.getElementById('addItemButton');
const addItemForm = document.getElementById('addItemForm');
const closeForm = document.getElementById('closeForm');
const addItemFormContent = document.getElementById('addItemFormContent');
const menuItems = document.getElementById('menuItems');

function createMenuCard(item) {
    const card = document.createElement('div');
    const cardClass = item.inStock ? 'menu-card in-stock' : 'menu-card out-of-stock';
    card.className = cardClass;
    card.innerHTML = `
        <h2>${item.name}</h2>
        <p>Type: ${item.type}</p>
        <button class="remove-button" onclick="removeItem('${item._id}')">Remove Item</button>
        <button class="out-of-stock-button" onclick="toggleStock('${item._id}', ${item.inStock})">
            ${item.inStock ? 'Out of Stock' : 'In Stock'}
        </button>
    `;
    menuItems.appendChild(card);
}

// Function to fetch menu items from the server
function fetchMenuItems() {
    fetch('/api/menu-items')
        .then(response => response.json())
        .then(data => {
            menuItems.innerHTML = '';
            data.forEach(item => createMenuCard(item));
        })
        .catch(error => console.error(error));
}

// Render menu items
fetchMenuItems();

// Function to add a new item
addItemFormContent.addEventListener('submit', event => {
    event.preventDefault();
    const itemName = document.getElementById('itemName').value;
    const itemType = document.getElementById('itemType').value;
    const newItem = { name: itemName, type: itemType, inStock: true };

    fetch('/api/add-menu-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
    })
        .then(response => response.json())
        .then(data => {
            fetchMenuItems(); // Refresh menu items after adding
            addItemForm.style.display = 'none';
            addItemFormContent.reset();
        })
        .catch(error => console.error(error));
});

// Function to remove an item
function removeItem(itemId) {
    fetch(`/api/remove-menu-item/${itemId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => fetchMenuItems()) // Refresh menu items after removing
        .catch(error => console.error(error));
}

// Function to toggle item stock status
function toggleStock(itemId, inStock) {
    const newStatus = !inStock;
    fetch(`/api/update-menu-item/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inStock: newStatus }),
    })
        .then(response => response.json())
        .then(data => fetchMenuItems()) // Refresh menu items after updating stock status
        .catch(error => console.error(error));
}

// Show the add item form when the button is clicked
addItemButton.addEventListener('click', () => {
    addItemForm.style.display = 'block';
});

// Close the add item form
closeForm.addEventListener('click', () => {
    addItemForm.style.display = 'none';
});

// Close the add item form when clicking outside the form
window.addEventListener('click', event => {
    if (event.target === addItemForm) {
        addItemForm.style.display = 'none';
    }
});
