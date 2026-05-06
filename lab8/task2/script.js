class Carousel {
    constructor(elementId, config = {}) {
        this.container = document.getElementById(elementId);
        if (!this.container) throw new Error(`Елемент з id ${elementId} не знайдено`);

        // Дефолтні параметри зливаються з тими, що передані користувачем
        this.config = {
            items: [], // Масив об'єктів для відображення
            speed: 400, // Швидкість анімації між слайдами (мс)
            autoplay: true, // Автопрокрутка
            autoplayInterval: 3000, // Час між слайдами при автопрокрутці (мс)
            showArrows: true, // Відображення стрілок
            showPagination: true, // Відображення крапочок
            ...config
        };

        this.currentIndex = 0;
        this.totalItems = this.config.items.length;
        this.autoplayTimer = null;

        if (this.totalItems === 0) {
            this.container.innerHTML = '<p style="padding:20px; text-align:center;">Немає контенту</p>';
            return;
        }

        this.init();
    }

    init() {
        this.renderDOM();
        this.track = this.container.querySelector('.slider-track');
        this.dots = this.container.querySelectorAll('.slider-dot');

        // Встановлення швидкості анімації з конфігурації
        this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;

        this.bindEvents();

        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }

    renderDOM() {
        this.container.classList.add('slider');
        this.container.setAttribute('tabindex', '0'); // Щоб елемент міг ловити фокус для клавіатури

        let html = '<div class="slider-track">';

        // Генерація слайдів на основі масиву конфігурації
        this.config.items.forEach(item => {
            if (item.type === 'image') {
                html += `<div class="slide"><img src="${item.src}" alt="slide"></div>`;
            } else {
                html += `<div class="slide">${item.content}</div>`;
            }
        });
        html += '</div>';

        // Генерація стрілок (SVG іконки)
        if (this.config.showArrows && this.totalItems > 1) {
            html += `
        <button class="slider-arrow prev" aria-label="Previous">
          <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
        </button>
        <button class="slider-arrow next" aria-label="Next">
          <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </button>
      `;
        }

        // Генерація точок пагінації
        if (this.config.showPagination && this.totalItems > 1) {
            html += '<div class="slider-dots">';
            for (let i = 0; i < this.totalItems; i++) {
                html += `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>`;
            }
            html += '</div>';
        }

        this.container.innerHTML = html;
    }

    bindEvents() {
        // Події для стрілок
        if (this.config.showArrows && this.totalItems > 1) {
            this.container.querySelector('.prev').addEventListener('click', () => this.prev());
            this.container.querySelector('.next').addEventListener('click', () => this.next());
        }

        // Події для пагінації (Делегування подій)
        if (this.config.showPagination && this.totalItems > 1) {
            this.container.querySelector('.slider-dots').addEventListener('click', (e) => {
                if (e.target.classList.contains('slider-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.goTo(index);
                }
            });
        }

        // Keyboard events: зміна слайду стрілками ← та →
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                e.preventDefault(); // Запобігає прокрутці всієї сторінки
            } else if (e.key === 'ArrowRight') {
                this.next();
                e.preventDefault();
            }
        });

        // Autoplay пауза при наведенні курсора
        if (this.config.autoplay) {
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());

            // Також зупиняємо, якщо користувач клацнув на слайдер (фокус)
            this.container.addEventListener('focusin', () => this.stopAutoplay());
            this.container.addEventListener('focusout', () => this.startAutoplay());
        }
    }

    goTo(index) {
        // Continuous loop mode logic
        if (index < 0) {
            this.currentIndex = this.totalItems - 1;
        } else if (index >= this.totalItems) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = index;
        }

        this.updateSlider();
    }

    next() {
        this.goTo(this.currentIndex + 1);
    }

    prev() {
        this.goTo(this.currentIndex - 1);
    }

    updateSlider() {
        // Плавне переміщення за допомогою transform: translateX
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;

        // Оновлення активної точки пагінації
        if (this.config.showPagination) {
            this.dots.forEach(dot => dot.classList.remove('active'));
            if (this.dots[this.currentIndex]) {
                this.dots[this.currentIndex].classList.add('active');
            }
        }
    }

    startAutoplay() {
        this.stopAutoplay(); // Очищаємо старий інтервал перед створенням нового
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.config.autoplayInterval);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
}

// === ІНІЦІАЛІЗАЦІЯ ===
// Створюємо масив контенту: можна міксувати текст і зображення
const sliderData = [
    { type: 'text', content: 'Slide 1' },
    { type: 'text', content: 'Slide 2' },
    { type: 'text', content: 'Slide 3' },
    { type: 'text', content: 'Slide 4' },
    { type: 'text', content: 'Slide 5' },
    { type: 'text', content: 'Slide 6' },
    { type: 'text', content: 'Slide 7' },
    { type: 'text', content: 'Slide 8' },
    { type: 'text', content: 'Slide 9' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1506744626753-1fa28f6f53cb?w=800&auto=format&fit=crop', alt: 'Природа' }
];

// Ініціалізація з параметрами конфігурації
const myCarousel = new Carousel('my-carousel', {
    items: sliderData,        // Масив контенту
    speed: 500,               // Швидкість анімації (ms)
    autoplay: true,           // Автопрокручування увімкнено
    autoplayInterval: 2500,   // Інтервал між змінами слайдів
    showArrows: true,         // Показувати стрілки
    showPagination: true      // Показувати точки (pagination)
});