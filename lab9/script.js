function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(form => form.classList.remove('active'));

    if (tabId === 'signup') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('signup-form').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('login-form').classList.add('active');
    }

    document.getElementById('success-message').style.display = 'none';
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

const citiesData = {
    "Ukraine": ["Київ", "Львів", "Чернівці", "Харків", "Одеса"],
    "Poland": ["Варшава", "Краків", "Вроцлав", "Гданськ"]
};

const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');

countrySelect.addEventListener('change', function() {
    const selectedCountry = this.value;
    citySelect.innerHTML = '<option value="">Оберіть місто...</option>';

    if (selectedCountry && citiesData[selectedCountry]) {
        citySelect.disabled = false;
        citiesData[selectedCountry].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
    }
});

function setError(element, message) {
    const formGroup = element.closest('.form-group');
    const errorDisplay = formGroup.querySelector('.error-msg');

    errorDisplay.innerText = message;
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
}

function setSuccess(element) {
    const formGroup = element.closest('.form-group');
    formGroup.classList.add('success');
    formGroup.classList.remove('error');
}

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    let isFormValid = true;

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');

    if(firstName.value.length < 3 || firstName.value.length > 15) {
        setError(firstName, 'Ім\'я повинно містити від 3 до 15 символів');
        isFormValid = false;
    } else setSuccess(firstName);

    if(lastName.value.length < 3 || lastName.value.length > 15) {
        setError(lastName, 'Прізвище повинно містити від 3 до 15 символів');
        isFormValid = false;
    } else setSuccess(lastName);

    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.value)) {
        setError(email, 'Введіть коректний email');
        isFormValid = false;
    } else setSuccess(email);

    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    if(password.value.length < 6) {
        setError(password, 'Пароль має бути не менше 6 символів');
        isFormValid = false;
    } else setSuccess(password);

    if(confirmPassword.value === '' || confirmPassword.value !== password.value) {
        setError(confirmPassword, 'Паролі не збігаються');
        isFormValid = false;
    } else setSuccess(confirmPassword);

    const phone = document.getElementById('phone');
    const phoneRegex = /^\+380\d{9}$/;
    if(!phoneRegex.test(phone.value)) {
        setError(phone, 'Введіть телефон у форматі +380XXXXXXXXX');
        isFormValid = false;
    } else setSuccess(phone);

    const dob = document.getElementById('dob');
    if(!dob.value) {
        setError(dob, 'Оберіть дату народження');
        isFormValid = false;
    } else {
        const birthDate = new Date(dob.value);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (birthDate > today) {
            setError(dob, 'Дата не може бути у майбутньому');
            isFormValid = false;
        } else if (age < 12) {
            setError(dob, 'Вибачте, реєстрація з 12 років');
            isFormValid = false;
        } else setSuccess(dob);
    }

    const sexGroup = document.querySelector('.radio-group').closest('.form-group');
    const sexError = document.getElementById('sexError');
    if(!document.getElementById('male').checked && !document.getElementById('female').checked) {
        sexError.style.display = 'block';
        sexGroup.classList.add('error');
        isFormValid = false;
    } else {
        sexError.style.display = 'none';
        sexGroup.classList.remove('error');
        sexGroup.classList.add('success');
    }

    if(!countrySelect.value) {
        setError(countrySelect, 'Оберіть країну');
        isFormValid = false;
    } else setSuccess(countrySelect);

    if(!citySelect.value) {
        setError(citySelect, 'Оберіть місто');
        isFormValid = false;
    } else setSuccess(citySelect);

    if (isFormValid) {
        const formData = new FormData(this);

        const successMsg = document.getElementById('success-message');
        successMsg.innerText = 'Вас успішно зареєстровано!';
        successMsg.style.display = 'block';

        this.reset();
        citySelect.disabled = true;

        document.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
    }
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    let isFormValid = true;

    const username = document.getElementById('loginUsername');
    if(!username.value.trim()) {
        setError(username, 'Введіть юзернейм');
        isFormValid = false;
    } else setSuccess(username);

    const password = document.getElementById('loginPassword');
    if(password.value.length < 6) {
        setError(password, 'Пароль має бути не менше 6 символів');
        isFormValid = false;
    } else setSuccess(password);

    if (isFormValid) {
        const formData = new FormData(this);
        formData.append('rememberMe', document.getElementById('rememberMe').checked);

        const successMsg = document.getElementById('success-message');
        successMsg.innerText = 'Успішний вхід!';
        successMsg.style.display = 'block';

        this.reset();
        document.querySelectorAll('.success').forEach(el => el.classList.remove('success'));
    }
});