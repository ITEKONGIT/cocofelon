// Navigation Function
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update active nav link
    updateActiveNavLink(sectionId);
}

// Update Active Navigation Link
function updateActiveNavLink(sectionId) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = 'var(--muted)';
        
        // Special handling for blog link (external)
        if (link.getAttribute('href') === 'blogs.html' && sectionId === 'blog') {
            link.style.color = 'var(--accent-2)';
        }
    });
    
    // Find and highlight the active nav link for internal sections
    const activeLink = Array.from(document.querySelectorAll('.nav-links a')).find(link => {
        const linkText = link.textContent.toLowerCase();
        const sectionText = sectionId.toLowerCase();
        
        return (linkText.includes(sectionText) || 
               (sectionText === 'home' && linkText === 'home') ||
               (sectionText === 'skills' && linkText === 'skills') ||
               (sectionText === 'projects' && linkText === 'projects') ||
               (sectionText === 'certifications' && linkText === 'certifications'));
    });
    
    if (activeLink && activeLink.getAttribute('href') === '#') {
        activeLink.style.color = 'var(--accent-2)';
    }
}

// Animation on Scroll
function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
}

// Initialize Shimmer Effects
function initShimmerEffects() {
    const gradientElements = document.querySelectorAll('.accent');
    gradientElements.forEach(el => {
        el.style.backgroundSize = '200% 200%';
        el.style.animation = 'shimmer 8s ease-in-out infinite';
    });
}

// Handle Blog Preview Card Clicks (for external blog navigation)
function initBlogPreviewNavigation() {
    // This is handled via onclick attributes in HTML
    // Additional JavaScript enhancements can be added here if needed
    console.log('Blog preview navigation ready');
}

// Smooth Scroll for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile Menu Handling (for future expansion)
function initMobileMenu() {
    // Can be expanded for mobile hamburger menu
    console.log('Mobile menu ready for expansion');
}

// Performance Optimization - Lazy Loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize Everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    initAnimations();
    
    // Initialize visual effects
    initShimmerEffects();
    
    // Initialize blog navigation
    initBlogPreviewNavigation();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize mobile menu (for future)
    initMobileMenu();
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Set home as active section by default
    showSection('home');
    
    // Console log for debugging
    console.log('🚀 cocofelon.lol - Cybersecurity & AI Portfolio loaded successfully!');
});

// Utility Functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Window resize handler with debounce
window.addEventListener('resize', debounce(() => {
    // Re-initialize animations on resize
    initAnimations();
}, 250));

// Error handling for images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.warn('Image failed to load:', e.target.src);
        // Optional: Add fallback image logic here
    }
}, true);

// Export functions for potential module use (if needed later)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSection,
        initAnimations,
        initShimmerEffects
    };
}