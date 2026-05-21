
const state = {
    users: [],
    favorites: JSON.parse(localStorage.getItem('favUsers')) || [],
    currentPage: 1,
    loadedPages: [1],
    isLoading: false,
    resultsPerPage: 30
};

const filterUsers = (users, filters) => {
    return users.filter(user => {
        const searchTarget = `${user.name.first} ${user.name.last} ${user.email} ${user.location.city} ${user.location.country}`.toLowerCase();
        const searchMatch = searchTarget.includes(filters.search.toLowerCase());
        const ageMatch = user.dob.age <= filters.maxAge;
        const genderMatch = filters.gender === 'all' || user.gender === filters.gender;
        const userYear = new Date(user.dob.date).getFullYear();
        const yearMatch = !filters.year || userYear === Number(filters.year);

        return searchMatch && ageMatch && genderMatch && yearMatch;
    });
};

const sortUsers = (users, sortType) => {
    const arr = [...users];
    switch (sortType) {
        case 'name-asc': return arr.sort((a, b) => a.name.first.localeCompare(b.name.first));
        case 'name-desc': return arr.sort((a, b) => b.name.first.localeCompare(a.name.first));
        case 'age-asc': return arr.sort((a, b) => a.dob.age - b.dob.age);
        case 'age-desc': return arr.sort((a, b) => b.dob.age - a.dob.age);
        case 'reg-desc': return arr.sort((a, b) => new Date(b.registered.date) - new Date(a.registered.date));
        default: return arr;
    }
};

const debounce = (func, ms) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), ms);
    };
};

const getFiltersFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('search') || '',
        maxAge: Number(params.get('age')) || 100,
        gender: params.get('gender') || 'all',
        sort: params.get('sort') || 'default',
        year: params.get('year') || ''
    };
};

const UI = {
    grid: document.getElementById('users-grid'),
    loader: document.getElementById('loader'),
    notify: document.getElementById('notification-area'),
    pagesIndicator: document.getElementById('loaded-pages-indicator'),

    showError(msg) {
        this.notify.textContent = msg;
        this.notify.className = 'notification error';
        this.notify.style.display = 'block';
        setTimeout(() => this.notify.style.display = 'none', 5000);
    },

    updateHistoryAPI(filters) {
        const url = new URL(window.location);
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key] !== 'all' && filters[key] !== 100 && filters[key] !== 'default') {
                url.searchParams.set(key, filters[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.pushState(filters, '', url);
    },

    syncInputsWithURL() {
        const filters = getFiltersFromURL();
        document.getElementById('search-input').value = filters.search;
        document.getElementById('age-filter').value = filters.maxAge;
        document.getElementById('age-val').innerText = filters.maxAge;
        document.getElementById('year-filter').value = filters.year;
        document.getElementById('sort-select').value = filters.sort;
        document.querySelector(`input[name="gender"][value="${filters.gender}"]`).checked = true;
    },

    renderCards(usersList) {
        this.grid.innerHTML = '';
        if (usersList.length === 0) {
            this.grid.innerHTML = '<h3 style="grid-column: 1/-1; text-align:center; color:#777;">Користувачів не знайдено 😢</h3>';
            return;
        }

        const fragment = document.createDocumentFragment();
        usersList.forEach(user => {
            const isFav = state.favorites.includes(user.login.uuid);
            const regDate = new Date(user.registered.date).toLocaleDateString('uk-UA');

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="card-header"></div>
                <div class="fav-icon ${isFav ? 'active' : ''}" data-id="${user.login.uuid}">❤️</div>
                <img src="${user.picture.large}" alt="Avatar" class="avatar">
                <div class="card-body">
                    <h3>${user.name.first} ${user.name.last}</h3>
                    <p class="info-row">🎂 ${user.dob.age} років | ${user.gender === 'male' ? 'Чол' : 'Жін'}</p>
                    <p class="info-row">📍 ${user.location.city}, ${user.location.country}</p>
                    <p class="info-row">📞 ${user.phone}</p>
                    <p class="info-row">✉️ ${user.email}</p>
                    <p class="info-row" style="font-size: 12px; margin-top:10px;">Зареєстровано: ${regDate}</p>
                </div>
            `;
            fragment.appendChild(card);
        });

        this.grid.appendChild(fragment);
        this.attachFavoriteListeners();
    },

    attachFavoriteListeners() {
        document.querySelectorAll('.fav-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (state.favorites.includes(id)) {
                    state.favorites = state.favorites.filter(favId => favId !== id);
                    e.target.classList.remove('active');
                } else {
                    state.favorites.push(id);
                    e.target.classList.add('active');
                }
                localStorage.setItem('favUsers', JSON.stringify(state.favorites));
            });
        });
    }
};

const processAndRenderData = () => {
    const filters = {
        search: document.getElementById('search-input').value,
        maxAge: Number(document.getElementById('age-filter').value),
        year: document.getElementById('year-filter').value,
        gender: document.querySelector('.radio-group-sidebar input[name="gender"]:checked').value,
        sort: document.getElementById('sort-select').value
    };

    UI.updateHistoryAPI(filters);
    const filtered = filterUsers(state.users, filters);
    const sorted = sortUsers(filtered, filters.sort);
    UI.renderCards(sorted);
};

const fetchUsersAPI = async () => {
    if (state.isLoading) return;

    state.isLoading = true;
    UI.loader.style.display = 'block';

    try {
        const res = await fetch(`https://randomuser.me/api/?page=${state.currentPage}&results=${state.resultsPerPage}&seed=friendsApp`);
        if (!res.ok) throw new Error('Помилка сервера. Спробуйте пізніше.');

        const data = await res.json();
        state.users = [...state.users, ...data.results];
        processAndRenderData();

        if (state.currentPage > 1 && !state.loadedPages.includes(state.currentPage)) {
            state.loadedPages.push(state.currentPage);
            UI.pagesIndicator.textContent = state.loadedPages.join(', ');
        }
        state.currentPage++;
    } catch (err) {
        UI.showError(err.message);
    } finally {
        state.isLoading = false;
        UI.loader.style.display = 'none';
    }
};

const initAuth = () => {
    const isLogged = localStorage.getItem('userLogged');
    if (isLogged === 'true') {
        document.getElementById('auth-section').classList.remove('active');
        document.getElementById('app-section').classList.add('active');
        if (state.users.length === 0) {
            UI.syncInputsWithURL();
            fetchUsersAPI();
        }
    } else {
        document.getElementById('app-section').classList.remove('active');
        document.getElementById('auth-section').classList.add('active');
    }
};

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.form-content').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${e.target.dataset.tab}-form`).classList.add('active');
    });
});

window.togglePassword = (inputId) => {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
};

const citiesData = {
    "Ukraine": ["Київ", "Львів", "Чернівці", "Харків", "Одеса"],
    "Poland": ["Варшава", "Краків", "Вроцлав", "Гданськ"]
};
const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');

countrySelect.addEventListener('change', function() {
    citySelect.innerHTML = '<option value="">Оберіть місто...</option>';
    if (this.value && citiesData[this.value]) {
        citySelect.disabled = false;
        citiesData[this.value].forEach(city => {
            const option = document.createElement('option');
            option.value = city; option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
    }
});

function setError(element, message) {
    const formGroup = element.closest('.form-group');
    formGroup.querySelector('.error-msg').innerText = message;
    formGroup.classList.add('error'); formGroup.classList.remove('success');
}
function setSuccess(element) {
    const formGroup = element.closest('.form-group');
    formGroup.classList.add('success'); formGroup.classList.remove('error');
}

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let isFormValid = true;

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    if(firstName.value.length < 3 || firstName.value.length > 15) { setError(firstName, 'Від 3 до 15 символів'); isFormValid = false; } else setSuccess(firstName);
    if(lastName.value.length < 3 || lastName.value.length > 15) { setError(lastName, 'Від 3 до 15 символів'); isFormValid = false; } else setSuccess(lastName);

    const email = document.getElementById('email');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setError(email, 'Некоректний email'); isFormValid = false; } else setSuccess(email);

    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    if(password.value.length < 6) { setError(password, 'Мінімум 6 символів'); isFormValid = false; } else setSuccess(password);
    if(confirmPassword.value === '' || confirmPassword.value !== password.value) { setError(confirmPassword, 'Паролі не збігаються'); isFormValid = false; } else setSuccess(confirmPassword);

    const phone = document.getElementById('phone');
    if(!/^\+380\d{9}$/.test(phone.value)) { setError(phone, 'Формат: +380XXXXXXXXX'); isFormValid = false; } else setSuccess(phone);

    const dob = document.getElementById('dob');
    if(!dob.value) { setError(dob, 'Оберіть дату'); isFormValid = false; }
    else {
        const birthDate = new Date(dob.value);
        let age = new Date().getFullYear() - birthDate.getFullYear();
        if (birthDate > new Date()) { setError(dob, 'Майбутня дата!'); isFormValid = false; }
        else if (age < 12) { setError(dob, 'Тільки з 12 років'); isFormValid = false; }
        else setSuccess(dob);
    }

    const sexGroup = document.querySelector('.radio-group').closest('.form-group');
    if(!document.getElementById('male').checked && !document.getElementById('female').checked) {
        document.getElementById('sexError').style.display = 'block'; sexGroup.classList.add('error'); isFormValid = false;
    } else {
        document.getElementById('sexError').style.display = 'none'; sexGroup.classList.remove('error'); sexGroup.classList.add('success');
    }

    if(!countrySelect.value) { setError(countrySelect, 'Оберіть країну'); isFormValid = false; } else setSuccess(countrySelect);
    if(!citySelect.value) { setError(citySelect, 'Оберіть місто'); isFormValid = false; } else setSuccess(citySelect);

    if (isFormValid) {
        localStorage.setItem('userLogged', 'true');
        initAuth();
        this.reset();
        document.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
        citySelect.disabled = true;
    }
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let isFormValid = true;

    const username = document.getElementById('loginUsername');
    const pass = document.getElementById('loginPassword');

    if(!username.value.trim()) { setError(username, 'Введіть логін'); isFormValid = false; } else setSuccess(username);
    if(pass.value.length < 6) { setError(pass, 'Мінімум 6 символів'); isFormValid = false; } else setSuccess(pass);

    if (isFormValid) {
        localStorage.setItem('userLogged', 'true');
        initAuth();
        this.reset();
        document.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userLogged');
    state.users = []; state.currentPage = 1; state.loadedPages = [1];
    UI.pagesIndicator.textContent = '1';
    window.history.pushState({}, '', window.location.pathname);
    initAuth();
});

const debouncedProcess = debounce(processAndRenderData, 400);

document.getElementById('search-input').addEventListener('input', debouncedProcess);
document.getElementById('year-filter').addEventListener('input', debouncedProcess);

document.getElementById('age-filter').addEventListener('input', (e) => {
    document.getElementById('age-val').innerText = e.target.value;
    processAndRenderData();
});

document.getElementById('sort-select').addEventListener('change', processAndRenderData);
document.querySelectorAll('.radio-group-sidebar input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', processAndRenderData);
});

document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('age-filter').value = 100;
    document.getElementById('age-val').innerText = 100;
    document.getElementById('sort-select').value = 'default';
    document.querySelector('.radio-group-sidebar input[name="gender"][value="all"]').checked = true;
    processAndRenderData();
});

window.addEventListener('popstate', () => {
    UI.syncInputsWithURL();
    processAndRenderData();
});

const initObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && state.users.length > 0 && !state.isLoading) {
            fetchUsersAPI();
        }
    }, { rootMargin: '200px' });

    observer.observe(document.getElementById('scroll-trigger'));
};

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initObserver();
});