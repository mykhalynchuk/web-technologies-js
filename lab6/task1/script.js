let state = {
    products: [],
    filter: 'all',
    sort: 'default'
};

const addProduct = (products, newProduct) => [
    ...products,
    {
        ...newProduct,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

const removeProduct = (products, id) => products.filter(p => p.id !== id);

const updateProduct = (products, updatedProduct) => products.map(p =>
    p.id === updatedProduct.id
        ? { ...p, ...updatedProduct, updatedAt: Date.now() }
        : p
);

const filterProducts = (products, filterType) => {
    if (filterType === 'all') return products;
    return products.filter(p => p.category === filterType);
};

const sortProducts = (products, sortType) => {
    const copy = [...products];
    switch (sortType) {
        case 'price': return copy.sort((a, b) => Number(a.price) - Number(b.price));
        case 'dateCreated': return copy.sort((a, b) => b.createdAt - a.createdAt);
        case 'dateUpdated': return copy.sort((a, b) => b.updatedAt - a.updatedAt);
        default: return copy;
    }
};

const calculateTotal = (products) => products.reduce((sum, p) => sum + Number(p.price), 0);


const getProcessedProducts = (currentState) => {
    const filtered = filterProducts(currentState.products, currentState.filter);
    return sortProducts(filtered, currentState.sort);
};


const dispatch = (newState) => {
    state = { ...state, ...newState };
    render();
};

const render = () => {
    const listContainer = document.getElementById('product-list');
    const totalPriceEl = document.getElementById('total-price');

    const visibleProducts = getProcessedProducts(state);

    totalPriceEl.textContent = calculateTotal(visibleProducts).toFixed(2);

    listContainer.innerHTML = '';

    if (visibleProducts.length === 0) {
        listContainer.innerHTML = `<div class="empty-message">Наразі список товарів пустий. Додайте новий товар.</div>`;
        return;
    }

    visibleProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=Немає+фото'">
            <div class="product-info">
                <span class="product-id">ID: ${product.id}</span>
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <div class="product-price">${product.price} ₴</div>
                <div class="product-actions">
                    <button class="btn btn-edit" onclick="handleEdit('${product.id}')">Редагувати</button>
                    <button class="btn btn-danger" onclick="handleDelete('${product.id}')">Видалити</button>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });

    document.querySelectorAll('#filter-buttons .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === state.filter);
    });
    document.querySelectorAll('#sort-buttons .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === state.sort);
    });
};

const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');

const openModal = (isEdit = false, product = null) => {
    document.getElementById('modal-title').textContent = isEdit ? 'Редагувати товар' : 'Додати товар';
    if (product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-image').value = product.image;
    } else {
        form.reset();
        document.getElementById('product-id').value = '';
    }
    modal.classList.add('active');
};

const closeModal = () => modal.classList.remove('active');

document.getElementById('btn-open-add-modal').addEventListener('click', () => openModal(false));
document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        price: document.getElementById('product-price').value,
        category: document.getElementById('product-category').value,
        image: document.getElementById('product-image').value
    };

    if (id) {
        dispatch({ products: updateProduct(state.products, { id, ...productData }) });
        showSnackbar(`Оновлено: ID ${id} - ${productData.name}`);
    } else {
        dispatch({ products: addProduct(state.products, productData) });
        showSnackbar('Новий товар успішно додано!');
    }
    closeModal();
});

window.handleDelete = (id) => {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
        card.classList.add('removing');
        setTimeout(() => {
            dispatch({ products: removeProduct(state.products, id) });
            showSnackbar('Товар успішно видалено зі списку');
        }, 400);
    }
};

window.handleEdit = (id) => {
    const product = state.products.find(p => p.id === id);
    if (product) openModal(true, product);
};

document.getElementById('filter-buttons').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        dispatch({ filter: e.target.dataset.filter });
    }
});

document.getElementById('sort-buttons').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        dispatch({ sort: e.target.dataset.sort });
    }
});

const showSnackbar = (message) => {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.classList.add('show');
    setTimeout(() => snackbar.classList.remove('show'), 3000);
};

render();