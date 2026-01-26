/**
 * TEMPLATE 2 - CORPORATE LANDSCAPING SITE
 * Interactive behaviors and enhancements
 */

// ========================================
// MOBILE MENU TOGGLE
// ========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mainNav = document.getElementById('mainNav');

if (mobileMenuToggle && mainNav) {
  mobileMenuToggle.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';

    this.setAttribute('aria-expanded', !isExpanded);
    this.classList.toggle('active');
    mainNav.classList.toggle('active');
  });

  // Close menu when clicking on a link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    const isMenuOpen = mainNav.classList.contains('active');
    const clickedInsideMenu = mainNav.contains(e.target);
    const clickedToggle = mobileMenuToggle.contains(e.target);

    if (isMenuOpen && !clickedInsideMenu && !clickedToggle) {
      mobileMenuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Don't prevent default for just "#" or empty hrefs
    if (href === '#' || href === '') {
      e.preventDefault();
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();

      // Smooth scroll to target
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ========================================
// PORTFOLIO CAROUSEL
// ========================================
const portfolioCarousel = document.querySelector('.portfolio-carousel');

if (portfolioCarousel) {
  const portfolioGridWrapper = portfolioCarousel.querySelector('.portfolio-grid-wrapper');
  const portfolioGrid = portfolioCarousel.querySelector('.portfolio-grid');
  const portfolioSection = document.querySelector('.portfolio-teaser');
  const carouselNavButtons = portfolioSection ? portfolioSection.querySelector('.carousel-nav-buttons') : null;
  const prevArrow = portfolioSection ? portfolioSection.querySelector('.carousel-arrow--prev') : null;
  const nextArrow = portfolioSection ? portfolioSection.querySelector('.carousel-arrow--next') : null;
  const portfolioCards = portfolioGrid.querySelectorAll('.portfolio-card');

  let currentIndex = 0;
  let cardsPerPage = 1; // Always advance one card at a time
  let isTransitioning = false;

  // Check if mobile
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function updateCardsPerPage() {
    cardsPerPage = 1; // Always 1 card at a time
  }

  updateCardsPerPage();

  const totalCards = portfolioCards.length;

  // Clone ALL cards for seamless loop (not just 3)
  const cloneCount = totalCards;
  // Clone first set and append to end
  for (let i = 0; i < totalCards; i++) {
    const cloneFirst = portfolioCards[i].cloneNode(true);
    portfolioGrid.appendChild(cloneFirst);
  }
  // Clone last set and prepend to beginning
  for (let i = totalCards - 1; i >= 0; i--) {
    const cloneLast = portfolioCards[i].cloneNode(true);
    portfolioGrid.insertBefore(cloneLast, portfolioGrid.firstChild);
  }

  // Update index to account for prepended clones
  currentIndex = totalCards;

  function getTotalPages() {
    return Math.ceil(totalCards / cardsPerPage);
  }

  // Only show arrows if there are more cards than visible
  if (carouselNavButtons) {
    if (totalCards > cardsPerPage) {
      carouselNavButtons.classList.add('has-multiple');
    }
  }

  function updateCarousel(instant = false) {
    // Calculate the width of one card plus gap
    const allCards = portfolioGrid.querySelectorAll('.portfolio-card');
    const firstCard = allCards[0];
    if (!firstCard) return;

    updateCardsPerPage();

    const cardWidth = firstCard.offsetWidth;
    const computedStyle = window.getComputedStyle(firstCard);
    const marginLeft = parseFloat(computedStyle.marginLeft);
    const marginRight = parseFloat(computedStyle.marginRight);
    const totalMargin = marginLeft + marginRight;

    const gap = isMobile() ? 16 : 24;
    const slideWidth = cardWidth + totalMargin + gap;
    const offset = -currentIndex * (slideWidth * cardsPerPage);

    // Disable transition for instant repositioning
    if (instant) {
      portfolioGrid.style.transition = 'none';
    } else {
      portfolioGrid.style.transition = '';
    }

    portfolioGrid.style.transform = `translateX(${offset}px)`;

    // Re-enable transitions after instant move
    if (instant) {
      setTimeout(() => {
        portfolioGrid.style.transition = '';
      }, 50);
    }

    // Arrows always enabled for infinite loop
    if (prevArrow && nextArrow) {
      prevArrow.disabled = false;
      nextArrow.disabled = false;
    }
  }

  // Handle transition end for seamless looping
  portfolioGrid.addEventListener('transitionend', () => {
    if (isTransitioning) {
      isTransitioning = false;

      // If we're at a clone, jump to the real card instantly
      if (currentIndex <= 0) {
        currentIndex = totalCards;
        updateCarousel(true);
      } else if (currentIndex >= totalCards + cloneCount) {
        currentIndex = cloneCount;
        updateCarousel(true);
      }
    }
  });

  if (prevArrow) {
    prevArrow.addEventListener('click', (e) => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex--;
      updateCarousel();
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', (e) => {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      updateCarousel();
    });
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    const oldCardsPerPage = cardsPerPage;
    updateCardsPerPage();
    if (oldCardsPerPage !== cardsPerPage) {
      currentIndex = 0; // Reset to first page on breakpoint change
      updateCarousel();
    }
  });

  // Keyboard navigation for arrows
  if (prevArrow && nextArrow) {
    [prevArrow, nextArrow].forEach(arrow => {
      arrow.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          arrow.click();
        }
      });
    });
  }

  // Touch/Swipe functionality
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let isDragging = false;

  portfolioGridWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  portfolioGridWrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    touchEndX = e.touches[0].clientX;
  }, { passive: true });

  portfolioGridWrapper.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    // Only swipe if horizontal movement is significant
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        if (nextArrow && !nextArrow.disabled) {
          nextArrow.click();
        }
      } else {
        // Swiped right - go to previous
        if (prevArrow && !prevArrow.disabled) {
          prevArrow.click();
        }
      }
    }
  });

  // Mouse drag functionality for desktop
  let mouseStartX = 0;
  let mouseEndX = 0;
  let isMouseDragging = false;

  portfolioGridWrapper.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isMouseDragging = true;
    portfolioGridWrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  portfolioGridWrapper.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    mouseEndX = e.clientX;
  });

  portfolioGridWrapper.addEventListener('mouseup', () => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    portfolioGridWrapper.style.cursor = 'grab';

    const dragThreshold = 50;
    const diff = mouseStartX - mouseEndX;

    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) {
        // Dragged left - go to next
        if (nextArrow && !nextArrow.disabled) {
          nextArrow.click();
        }
      } else {
        // Dragged right - go to previous
        if (prevArrow && !prevArrow.disabled) {
          prevArrow.click();
        }
      }
    }
  });

  portfolioGridWrapper.addEventListener('mouseleave', () => {
    if (isMouseDragging) {
      isMouseDragging = false;
      portfolioGridWrapper.style.cursor = 'grab';
    }
  });

  // Set initial cursor
  portfolioGridWrapper.style.cursor = 'grab';

  // Initialize
  console.log('Initializing carousel:', {
    totalCards,
    cardsPerPage,
    totalPages: getTotalPages(),
    hasWrapper: !!portfolioGridWrapper,
    hasGrid: !!portfolioGrid,
    hasPrevArrow: !!prevArrow,
    hasNextArrow: !!nextArrow
  });

  // Wait for images to load before calculating
  setTimeout(() => {
    updateCarousel();
  }, 100);
}

// ========================================
// COVERAGE/SERVICES CAROUSEL
// ========================================
const coverageCarousel = document.querySelector('.coverage-carousel');

if (coverageCarousel) {
  const coverageGridWrapper = coverageCarousel.querySelector('.coverage-grid-wrapper');
  const coverageGrid = coverageCarousel.querySelector('.coverage-grid');
  const coverageSection = document.querySelector('.coverage-band');
  const coveragePrevArrow = coverageSection ? coverageSection.querySelector('.carousel-arrow--prev') : null;
  const coverageNextArrow = coverageSection ? coverageSection.querySelector('.carousel-arrow--next') : null;
  const coverageNavButtons = coverageSection ? coverageSection.querySelector('.carousel-nav-buttons') : null;
  const coverageCards = coverageGrid.querySelectorAll('.coverage-card');

  let coverageCurrentIndex = 0;
  let coverageCardsPerPage = 1; // Always advance one card at a time
  let coverageIsTransitioning = false;

  // Check if mobile for coverage carousel
  function isCoverageMobile() {
    return window.innerWidth <= 768;
  }

  function updateCoverageCardsPerPage() {
    coverageCardsPerPage = 1; // Always 1 card at a time
  }

  updateCoverageCardsPerPage();

  const coverageTotalCards = coverageCards.length;

  // Clone ALL cards for seamless loop
  const coverageCloneCount = coverageTotalCards;
  // Clone first set and append to end
  for (let i = 0; i < coverageTotalCards; i++) {
    const cloneFirst = coverageCards[i].cloneNode(true);
    coverageGrid.appendChild(cloneFirst);
  }
  // Clone last set and prepend to beginning
  for (let i = coverageTotalCards - 1; i >= 0; i--) {
    const cloneLast = coverageCards[i].cloneNode(true);
    coverageGrid.insertBefore(cloneLast, coverageGrid.firstChild);
  }

  // Update index to account for prepended clones
  coverageCurrentIndex = coverageTotalCards;

  function getCoverageTotalPages() {
    return Math.ceil(coverageTotalCards / coverageCardsPerPage);
  }

  // Only show arrows if there are more cards than visible
  if (coverageNavButtons) {
    if (coverageTotalCards > coverageCardsPerPage) {
      coverageNavButtons.classList.add('has-multiple');
    }
  }

  function updateCoverageCarousel(instant = false) {
    const allCards = coverageGrid.querySelectorAll('.coverage-card');
    const firstCard = allCards[0];
    if (!firstCard) return;

    updateCoverageCardsPerPage();

    const cardWidth = firstCard.offsetWidth;
    const computedStyle = window.getComputedStyle(firstCard);
    const marginLeft = parseFloat(computedStyle.marginLeft);
    const marginRight = parseFloat(computedStyle.marginRight);
    const totalMargin = marginLeft + marginRight;

    const gap = isCoverageMobile() ? 16 : 24;
    const slideWidth = cardWidth + totalMargin + gap;
    const offset = -coverageCurrentIndex * (slideWidth * coverageCardsPerPage);

    // Disable transition for instant repositioning
    if (instant) {
      coverageGrid.style.transition = 'none';
    } else {
      coverageGrid.style.transition = '';
    }

    coverageGrid.style.transform = `translateX(${offset}px)`;

    // Re-enable transitions after instant move
    if (instant) {
      setTimeout(() => {
        coverageGrid.style.transition = '';
      }, 50);
    }

    // Arrows always enabled for infinite loop
    if (coveragePrevArrow && coverageNextArrow) {
      coveragePrevArrow.disabled = false;
      coverageNextArrow.disabled = false;
    }
  }

  // Handle transition end for seamless looping
  coverageGrid.addEventListener('transitionend', () => {
    if (coverageIsTransitioning) {
      coverageIsTransitioning = false;

      // If we're at a clone, jump to the real card instantly
      if (coverageCurrentIndex <= 0) {
        coverageCurrentIndex = coverageTotalCards;
        updateCoverageCarousel(true);
      } else if (coverageCurrentIndex >= coverageTotalCards + coverageCloneCount) {
        coverageCurrentIndex = coverageCloneCount;
        updateCoverageCarousel(true);
      }
    }
  });

  if (coveragePrevArrow) {
    coveragePrevArrow.addEventListener('click', (e) => {
      if (coverageIsTransitioning) return;
      coverageIsTransitioning = true;
      coverageCurrentIndex--;
      updateCoverageCarousel();
    });
  }

  if (coverageNextArrow) {
    coverageNextArrow.addEventListener('click', (e) => {
      if (coverageIsTransitioning) return;
      coverageIsTransitioning = true;
      coverageCurrentIndex++;
      updateCoverageCarousel();
    });
  }

  // Handle window resize for coverage carousel
  window.addEventListener('resize', () => {
    const oldCoverageCardsPerPage = coverageCardsPerPage;
    updateCoverageCardsPerPage();
    if (oldCoverageCardsPerPage !== coverageCardsPerPage) {
      coverageCurrentIndex = 0;
      updateCoverageCarousel();
    }
  });

  if (coveragePrevArrow && coverageNextArrow) {
    [coveragePrevArrow, coverageNextArrow].forEach(arrow => {
      arrow.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          arrow.click();
        }
      });
    });
  }

  // Touch/Swipe functionality for coverage carousel
  let coverageTouchStartX = 0;
  let coverageTouchEndX = 0;
  let coverageTouchStartY = 0;
  let coverageIsDragging = false;

  coverageGridWrapper.addEventListener('touchstart', (e) => {
    coverageTouchStartX = e.touches[0].clientX;
    coverageTouchStartY = e.touches[0].clientY;
    coverageIsDragging = true;
  }, { passive: true });

  coverageGridWrapper.addEventListener('touchmove', (e) => {
    if (!coverageIsDragging) return;
    coverageTouchEndX = e.touches[0].clientX;
  }, { passive: true });

  coverageGridWrapper.addEventListener('touchend', () => {
    if (!coverageIsDragging) return;
    coverageIsDragging = false;

    const swipeThreshold = 50;
    const diff = coverageTouchStartX - coverageTouchEndX;

    // Only swipe if horizontal movement is significant
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        if (coverageNextArrow && !coverageNextArrow.disabled) {
          coverageNextArrow.click();
        }
      } else {
        // Swiped right - go to previous
        if (coveragePrevArrow && !coveragePrevArrow.disabled) {
          coveragePrevArrow.click();
        }
      }
    }
  });

  // Mouse drag functionality for coverage carousel on desktop
  let coverageMouseStartX = 0;
  let coverageMouseEndX = 0;
  let coverageIsMouseDragging = false;

  coverageGridWrapper.addEventListener('mousedown', (e) => {
    coverageMouseStartX = e.clientX;
    coverageIsMouseDragging = true;
    coverageGridWrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  coverageGridWrapper.addEventListener('mousemove', (e) => {
    if (!coverageIsMouseDragging) return;
    coverageMouseEndX = e.clientX;
  });

  coverageGridWrapper.addEventListener('mouseup', () => {
    if (!coverageIsMouseDragging) return;
    coverageIsMouseDragging = false;
    coverageGridWrapper.style.cursor = 'grab';

    const dragThreshold = 50;
    const diff = coverageMouseStartX - coverageMouseEndX;

    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) {
        // Dragged left - go to next
        if (coverageNextArrow && !coverageNextArrow.disabled) {
          coverageNextArrow.click();
        }
      } else {
        // Dragged right - go to previous
        if (coveragePrevArrow && !coveragePrevArrow.disabled) {
          coveragePrevArrow.click();
        }
      }
    }
  });

  coverageGridWrapper.addEventListener('mouseleave', () => {
    if (coverageIsMouseDragging) {
      coverageIsMouseDragging = false;
      coverageGridWrapper.style.cursor = 'grab';
    }
  });

  // Set initial cursor
  coverageGridWrapper.style.cursor = 'grab';

  setTimeout(() => {
    updateCoverageCarousel();
  }, 100);
}

// ========================================
// LIGHTBOX FOR PORTFOLIO IMAGES
// ========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__image') : null;
const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox__caption') : null;
const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;

function openLightbox(imageSrc, title, category) {
  if (!lightbox || !lightboxImg || !lightboxCaption) return;

  lightboxImg.src = imageSrc;
  lightboxImg.alt = title;
  lightboxCaption.textContent = title;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// Close lightbox on close button click
if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

// Close lightbox on background click
if (lightbox) {
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// Close lightbox on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});

// ========================================
// PORTFOLIO CARD INTERACTIONS
// ========================================
const portfolioCards = document.querySelectorAll('.portfolio-card');

portfolioCards.forEach(card => {
  // Make cards keyboard accessible
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');

  // Click to open lightbox
  card.addEventListener('click', function(e) {
    const img = this.querySelector('.portfolio-card__image img');
    const title = this.querySelector('.portfolio-card__title').textContent;
    const category = this.querySelector('.portfolio-card__category')?.textContent || '';

    if (img) {
      openLightbox(img.src, title, category);
    }
  });

  // Keyboard navigation
  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
});

// ========================================
// LAZY LOADING IMAGES (PROGRESSIVE ENHANCEMENT)
// ========================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // If image has a data-src attribute, load it
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }

        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ========================================
// HEADER SCROLL BEHAVIOR
// ========================================
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  // Add shadow when scrolled
  if (currentScroll > 10) {
    if (header) header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  } else {
    if (header) header.style.boxShadow = 'none';
  }
});

// ========================================
// FORM VALIDATION
// ========================================
const forms = document.querySelectorAll('form');

forms.forEach(form => {
  form.addEventListener('submit', function(e) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.setAttribute('aria-invalid', 'true');
        field.style.borderColor = '#e63946';
      } else {
        field.setAttribute('aria-invalid', 'false');
        field.style.borderColor = '';
      }
    });

    if (!isValid) {
      e.preventDefault();
      console.log('Form validation failed');
    } else {
      console.log('Form is valid, submitting to Web3Forms');
      // Form will submit normally to Web3Forms
    }
  });
});

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

// Skip to main content link (for keyboard users)
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'visually-hidden';
skipLink.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  background: var(--green-900);
  color: white;
  padding: 8px 16px;
  z-index: 9999;
  text-decoration: none;
`;

skipLink.addEventListener('focus', function() {
  this.style.clip = 'auto';
  this.style.width = 'auto';
  this.style.height = 'auto';
  this.style.overflow = 'visible';
});

skipLink.addEventListener('blur', function() {
  this.classList.add('visually-hidden');
});

document.body.insertBefore(skipLink, document.body.firstChild);

// ========================================
// PRIVACY POLICY MODAL
// ========================================
const privacyModal = document.getElementById('privacyModal');
const privacyLink = document.getElementById('privacyLink');
const privacyClose = privacyModal ? privacyModal.querySelector('.privacy-modal__close') : null;

function openPrivacyModal() {
  if (!privacyModal) return;
  privacyModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePrivacyModal() {
  if (!privacyModal) return;
  privacyModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Open modal when clicking the privacy link
if (privacyLink) {
  privacyLink.addEventListener('click', function(e) {
    e.preventDefault();
    openPrivacyModal();
  });
}

// Close modal on close button click
if (privacyClose) {
  privacyClose.addEventListener('click', closePrivacyModal);
}

// Close modal on background click
if (privacyModal) {
  privacyModal.addEventListener('click', function(e) {
    if (e.target === privacyModal) {
      closePrivacyModal();
    }
  });
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && privacyModal && privacyModal.classList.contains('active')) {
    closePrivacyModal();
  }
});

// ========================================
// FAQ ACCORDION
// ========================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  if (question && answer) {
    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      // Close all other FAQs
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          const otherQuestion = otherItem.querySelector('.faq-question');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherQuestion && otherAnswer) {
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherItem.classList.remove('active');
          }
        }
      });

      // Toggle current FAQ
      if (isExpanded) {
        question.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
      } else {
        question.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
      }
    });

    // Keyboard navigation
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  }
});

// ========================================
// SCROLL ANIMATIONS (INTERSECTION OBSERVER)
// ========================================
if ('IntersectionObserver' in window) {
  // Create the observer
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Check if this element is part of a grid/group
        const parent = entry.target.parentElement;
        const isPartOfGrid = parent && (
          parent.classList.contains('benefits__grid') ||
          parent.classList.contains('testimonial-grid') ||
          parent.classList.contains('coverage-grid') ||
          parent.classList.contains('portfolio-grid') ||
          parent.classList.contains('faq-list')
        );

        if (isPartOfGrid) {
          // Get all siblings
          const siblings = Array.from(parent.children);
          const currentIndex = siblings.indexOf(entry.target);

          // Add staggered delay based on position
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, currentIndex * 100); // 100ms delay between each element
        } else {
          // No stagger for single elements
          entry.target.classList.add('visible');
        }

        // Optional: stop observing after animation (one-time animation)
        // scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before element comes into view
  });

  // Select all elements to animate
  // For carousels, animate the section/container, not individual cards
  const animatedElements = document.querySelectorAll(`
    .benefit-card,
    .service-intro,
    .portfolio-teaser,
    .coverage-band,
    .before-after-section,
    .testimonial-card,
    .faq-item,
    .pre-footer-quote
  `);

  // Add fade-in-up class and observe each element
  animatedElements.forEach(element => {
    element.classList.add('fade-in-up');
    scrollObserver.observe(element);
  });
}

// ========================================
// BEFORE/AFTER SLIDER
// ========================================
const sliderContainer = document.querySelector('.before-after-container');
if (sliderContainer) {
  const beforeImage = document.getElementById('beforeImage');
  const sliderHandle = document.getElementById('sliderHandle');
  let isDragging = false;

  function updateSlider(e) {
    if (!isDragging && e.type !== 'click') return;

    const rect = sliderContainer.getBoundingClientRect();
    const x = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

    beforeImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    sliderHandle.style.left = `${percent}%`;
  }

  sliderContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e);
  });

  sliderContainer.addEventListener('mousemove', updateSlider);

  sliderContainer.addEventListener('mouseup', () => {
    isDragging = false;
  });

  sliderContainer.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  sliderContainer.addEventListener('click', updateSlider);

  // Touch events for mobile
  sliderContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSlider(e);
  });

  sliderContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateSlider(e);
  });

  sliderContainer.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// ========================================
// DARK MODE TOGGLE
// ========================================
const darkModeToggle = document.getElementById('darkModeToggle');

// Apply saved dark mode preference (already applied in head, but keep body in sync)
const darkMode = localStorage.getItem('darkMode');
if (darkMode === 'enabled') {
  document.body.classList.add('dark-mode');
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
    document.body.classList.toggle('dark-mode');

    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
    } else {
      localStorage.setItem('darkMode', 'disabled');
    }
  });
}

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================
console.log('%c🌿 Template 1 - Corporate Landscaping Site', 'color: #19864a; font-size: 16px; font-weight: bold;');
