let menuItems = [];

document.addEventListener("DOMContentLoaded", () => {
    const sendOrderButton = document.getElementById("sendOrderButton");
    sendOrderButton.addEventListener("click", openOrderForm);
});

fetch('/api/menu-items')
    .then(response => response.json())
    .then(data => {
        menuItems = data;
        renderMenu();
    })
    .catch(error => console.error(error));

const menuContainer = document.getElementById("menu");
let selectedItems = [];

function createMenuCard(item) {
    const card = document.createElement("div");
    card.className = `menu-card ${item.inStock ? 'in-stock' : 'out-of-stock'}`;

    const itemDetails = document.createElement("div");

    const name = document.createElement("span");
    name.textContent = `${item.name} - ${item.type}`;

    const actionButton = document.createElement("button");
    actionButton.textContent = item.inStock ? "Add to Order" : "Out of Stock";
    actionButton.disabled = !item.inStock;

    actionButton.addEventListener("click", () => {
        if (item.inStock) {
            if (!selectedItems.includes(item)) {
                selectedItems.push(item);
                actionButton.textContent = "Remove from Order";
                actionButton.style.backgroundColor = "#FFA500";
            } else {
                selectedItems.splice(selectedItems.indexOf(item), 1);
                actionButton.textContent = "Add to Order";
                actionButton.style.backgroundColor = "#39843c";
            }
        } else {
            // Handle Out of Stock action
        }
    });

    itemDetails.appendChild(name);
    card.appendChild(itemDetails);
    card.appendChild(actionButton);
    menuContainer.appendChild(card);
}

function renderMenu() {
    menuContainer.innerHTML = "";

    const sortOrder = ["Meal", "Side", "Drink"];

    // Sort menu items explicitly based on the sortOrder
    const sortedItems = menuItems.sort((a, b) => {
        return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
    });

    sortedItems.forEach(item => createMenuCard(item));
}


renderMenu();

function resetItems() {
    selectedItems = [];
    renderMenu();
}

const orderForm = document.getElementById("orderForm");
const nameInput = document.getElementById("name");
const locationInput = document.getElementById("location");
const inBedCheckbox = document.getElementById("inBed");
const confirmOrderButton = document.getElementById("confirmOrder");

function openOrderForm() {
    orderForm.classList.remove("hidden");
}

function closeOrderForm() {
    orderForm.classList.add("hidden");
    nameInput.value = "";
    locationInput.value = "";
    inBedCheckbox.checked = false;
}

confirmOrderButton.addEventListener("click", () => {
    const userName = nameInput.value;
    const userLocation = locationInput.value;
    const userInBed = inBedCheckbox.checked;
    let notes = document.getElementById("notes").value;

    if (notes === "") {
        notes = "No notes";
    }

    // Clear the "notes" input field explicitly
    document.getElementById("notes").value = ""; // Add this line

    const userInfo = {
        userName,
        userLocation,
        userInBed,
        notes
    };

    const orderData = {
        items: selectedItems, // Ensure "items" is an array
        userInfo,
    };

    fetch('/api/send-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
    .then(response => response.json())
    .then(data => {
        alert(`Order Sent! Order ID: ${data.orderId} \n\n All hot meals take around 20 - 25 minutes to prepare. Except for pre-orders. \n\n Thank you!`);
    })
    .catch(error => console.error(error));

    closeOrderForm();
    resetItems();
});
