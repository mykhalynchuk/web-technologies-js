const productsMap = new Map();
const ordersSet = new Set();
const productHistory = new WeakMap();
const activeUsers = new WeakSet();

const currentUser = { username: "Admin", role: "Manager" };
activeUsers.add(currentUser);

let nextProductId = 1;

const sysLogs = document.getElementById('system-logs');
const catalogList = document.getElementById('catalog-list');

function logMsg(msg) {
    const time = new Date().toLocaleTimeString();
    sysLogs.innerHTML += `[${time}] ${msg}\n`;
    sysLogs.scrollTop = sysLogs.scrollHeight;
}

function renderCatalog() {
    catalogList.innerHTML = '';

    for (let [id, prod] of productsMap) {
        const li = document.createElement('li');
        li.textContent = `ID: ${id} | ${prod.name} | Ціна: ₴${prod.price} | На складі: ${prod.stock} шт.`;
        catalogList.appendChild(li);
    }
}

document.getElementById('btn-add').addEventListener('click', () => {
    const name = document.getElementById('add-name').value;
    const price = parseFloat(document.getElementById('add-price').value);
    const stock = parseInt(document.getElementById('add-stock').value);

    if (!name || isNaN(price) || isNaN(stock)) return alert('Заповніть всі поля коректно!');

    const product = { id: nextProductId, name, price, stock };

    productsMap.set(nextProductId, product);

    productHistory.set(product, [`Створено з ціною ${price} та к-тю ${stock}`]);

    logMsg(`Додано новий продукт: ${name} (ID: ${nextProductId})`);

    nextProductId++;
    renderCatalog();
});

document.getElementById('btn-delete').addEventListener('click', () => {
    const id = parseInt(document.getElementById('manage-id').value);

    if (productsMap.has(id)) {
        const prod = productsMap.get(id);
        productsMap.delete(id);
        logMsg(`Видалено продукт: ${prod.name} (ID: ${id})`);
        renderCatalog();
    } else {
        logMsg(`Помилка видалення: Продукт з ID ${id} не знайдено.`);
    }
});

document.getElementById('btn-update').addEventListener('click', () => {
    const id = parseInt(document.getElementById('manage-id').value);
    const newPrice = parseFloat(document.getElementById('manage-price').value);
    const newStock = parseInt(document.getElementById('manage-stock').value);

    if (productsMap.has(id)) {
        const product = productsMap.get(id);

        let updateLog = `Оновлено: `;
        if (!isNaN(newPrice)) {
            product.price = newPrice;
            updateLog += `ціна -> ${newPrice}; `;
        }
        if (!isNaN(newStock)) {
            product.stock = newStock;
            updateLog += `залишок -> ${newStock};`;
        }

        const history = productHistory.get(product);
        history.push(updateLog);

        logMsg(` Продукт ID ${id} оновлено. Історія змін:`);
        history.forEach(entry => logMsg(`   - ${entry}`));

        renderCatalog();
    } else {
        logMsg(`Помилка: Продукт з ID ${id} не знайдено.`);
    }
});

document.getElementById('btn-search').addEventListener('click', () => {
    const query = document.getElementById('search-name').value.toLowerCase();
    let found = false;

    for (let product of productsMap.values()) {
        if (product.name.toLowerCase().includes(query)) {
            logMsg(` Знайдено: ID ${product.id} - ${product.name} (₴${product.price}), Залишок: ${product.stock}`);
            found = true;
        }
    }
    if (!found) logMsg(` За запитом "${query}" нічого не знайдено.`);
});

document.getElementById('btn-order').addEventListener('click', () => {
    const orderId = document.getElementById('order-id').value;
    const prodId = parseInt(document.getElementById('order-prod-id').value);
    const qty = parseInt(document.getElementById('order-qty').value);

    if (!activeUsers.has(currentUser)) {
        return logMsg("Помилка: Користувач не авторизований для створення замовлень.");
    }

    if (!orderId || isNaN(prodId) || isNaN(qty)) return alert("Заповніть всі поля замовлення!");

    if (ordersSet.has(orderId)) {
        return logMsg(`Замовлення з ID ${orderId} вже було оброблено!`);
    }

    if (productsMap.has(prodId)) {
        const product = productsMap.get(prodId);

        if (product.stock >= qty) {
            product.stock -= qty;
            ordersSet.add(orderId);

            productHistory.get(product).push(`Продано ${qty} шт. (Замовлення ${orderId})`);

            logMsg(`Успіх: Замовлення ${orderId} оформлено! Списано ${qty} шт. товару "${product.name}".`);
            renderCatalog();
        } else {
            logMsg(`Відмова: Недостатньо товару "${product.name}" на складі (Залишок: ${product.stock}).`);
        }
    } else {
        logMsg(`Відмова: Продукт з ID ${prodId} не існує.`);
    }
});

document.getElementById('add-name').value = "Ноутбук";
document.getElementById('add-price').value = "25000";
document.getElementById('add-stock').value = "10";
document.getElementById('btn-add').click();

document.getElementById('add-name').value = "";
document.getElementById('add-price').value = "";
document.getElementById('add-stock').value = "";
logMsg("Віртуальний магазин готовий до роботи!");