export default function decorate(block) {
  /* change to ul, li */
  const ul = block.querySelector('ul');
  ul.className = 'carousel-slides';

  ul.querySelectorAll('li').forEach((li) => {
    li.className = 'carousel-slide';
  });

  // Create carousel controls wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'carousel-wrapper';
  carouselWrapper.append(ul);

  // Create navigation buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav carousel-nav-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '<span>&lt;</span>';

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav carousel-nav-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '<span>&gt;</span>';

  carouselWrapper.append(prevButton, nextButton);

  // Create dots indicator
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';

  const slides = ul.querySelectorAll('.carousel-slide');
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    if (index === 0) dot.classList.add('active');
    dotsContainer.append(dot);
  });

  block.replaceChildren(carouselWrapper, dotsContainer);

  // Carousel state
  let currentSlide = 0;
  let autoplayInterval = null;
  const autoplayDelay = 5000; // 5 seconds

  // Update carousel position
  function updateCarousel(animate = true) {
    const slideWidth = slides[0].offsetWidth;
    ul.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
    ul.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

    // Update dots
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });

    // Update slides active state
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
  }

  // Autoplay functions
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateCarousel();
    }, autoplayDelay);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Navigate to specific slide
  function goToSlide(index) {
    currentSlide = index;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    if (currentSlide >= slides.length) currentSlide = 0;
    updateCarousel();
    resetAutoplay();
  }

  // Previous slide
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // Next slide
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  // Event listeners
  prevButton.addEventListener('click', prevSlide);
  nextButton.addEventListener('click', nextSlide);

  // Dot navigation
  const dots = dotsContainer.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  ul.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  ul.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  // Pause autoplay on hover
  block.addEventListener('mouseenter', stopAutoplay);
  block.addEventListener('mouseleave', startAutoplay);

  // Pause autoplay when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(false);
    }, 250);
  });

  // Initialize
  slides[0]?.classList.add('active');
  updateCarousel(false);
  startAutoplay();
}
