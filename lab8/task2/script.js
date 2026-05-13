class Carousel {
    constructor(elementId, config = {}) {
        this.container = document.getElementById(elementId);
        if (!this.container) throw new Error(`Елемент з id ${elementId} не знайдено`);


        this.config = {
            items: [],
            speed: 400,
            autoplay: true,
            autoplayInterval: 3000,
            showArrows: true,
            showPagination: true,
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

        this.config.items.forEach(item => {
            if (item.type === 'image') {
                html += `<div class="slide"><img src="${item.src}" alt="slide"></div>`;
            } else {
                html += `<div class="slide">${item.content}</div>`;
            }
        });
        html += '</div>';

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
        if (this.config.showArrows && this.totalItems > 1) {
            this.container.querySelector('.prev').addEventListener('click', () => this.prev());
            this.container.querySelector('.next').addEventListener('click', () => this.next());
        }

        if (this.config.showPagination && this.totalItems > 1) {
            this.container.querySelector('.slider-dots').addEventListener('click', (e) => {
                if (e.target.classList.contains('slider-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.goTo(index);
                }
            });
        }

        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                this.next();
                e.preventDefault();
            }
        });

        if (this.config.autoplay) {
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());

            this.container.addEventListener('focusin', () => this.stopAutoplay());
            this.container.addEventListener('focusout', () => this.startAutoplay());
        }
    }

    goTo(index) {

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
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;

        if (this.config.showPagination) {
            this.dots.forEach(dot => dot.classList.remove('active'));
            if (this.dots[this.currentIndex]) {
                this.dots[this.currentIndex].classList.add('active');
            }
        }
    }

    startAutoplay() {
        this.stopAutoplay();
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

const myCarousel = new Carousel('my-carousel', {
    items: sliderData,
    speed: 500,
    autoplay: true,
    autoplayInterval: 2500,
    showArrows: true,
    showPagination: true
});