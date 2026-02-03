// ========================================
// SmellSense AI - Clean Code Architecture
// ========================================

// Configuration Object (Single Source of Truth)
const CONFIG = {
    canvas: { width: 400, height: 300 },
    timing: {
        loadingDelay: 1500,
        typingSpeed: 80,
        scrollDebounce: 100,
        emailModalDelay: 15000
    },
    storage: {
        favorites: 'favorites',
        quizHistory: 'quizHistory',
        emailSubscribed: 'emailSubscribed',
        userEmail: 'userEmail',
        cookiesAccepted: 'cookiesAccepted'
    },
    limits: {
        minInputLength: 3,
        maxInputLength: 200,
        maxHistoryItems: 10
    }
};

// Scent Profiles Database (Weighted Keywords)
const SCENT_PROFILES = {
    woody: { keywords: ['woody', 'sandalwood', 'cedar', 'oak', 'pine', 'earthy'], weight: 1.2 },
    floral: { keywords: ['floral', 'rose', 'jasmine', 'lavender', 'lily', 'peony'], weight: 1.0 },
    citrus: { keywords: ['citrus', 'lemon', 'orange', 'bergamot', 'grapefruit', 'lime'], weight: 1.0 },
    oriental: { keywords: ['oriental', 'vanilla', 'amber', 'musk', 'incense', 'exotic'], weight: 1.1 },
    aquatic: { keywords: ['aquatic', 'ocean', 'marine', 'water', 'sea', 'fresh'], weight: 1.0 },
    gourmand: { keywords: ['gourmand', 'chocolate', 'caramel', 'honey', 'sweet', 'dessert'], weight: 0.9 },
    spicy: { keywords: ['spicy', 'pepper', 'cinnamon', 'ginger', 'cardamom', 'clove'], weight: 1.0 }
};

// Perfume Collection (Product Database)
const PERFUMES = {
    woody: { name: 'Sandalwood Noir', top: 'Cedarwood', heart: 'Sandalwood', base: 'Oakmoss', price: '₹5,499' },
    floral: { name: 'Lavender Bliss', top: 'Rose', heart: 'Jasmine', base: 'Violet', price: '₹4,999' },
    citrus: { name: 'Citrus Dream', top: 'Bergamot', heart: 'Lemon', base: 'Neroli', price: '₹4,499' },
    oriental: { name: 'Amber Mystique', top: 'Saffron', heart: 'Amber', base: 'Vanilla', price: '₹6,999' },
    aquatic: { name: 'Aquatic Marine', top: 'Sea Salt', heart: 'Water Lily', base: 'Driftwood', price: '₹5,299' },
    gourmand: { name: 'Caramel Indulgence', top: 'Almond', heart: 'Caramel', base: 'Tonka Bean', price: '₹5,799' },
    spicy: { name: 'Spice Route', top: 'Pink Pepper', heart: 'Cardamom', base: 'Cinnamon', price: '₹5,999' }
};

// DOM Cache (Performance Optimization)
const DOM = {
    cache: new Map(),
    get(id) {
        if (!this.cache.has(id)) {
            this.cache.set(id, document.getElementById(id));
        }
        return this.cache.get(id);
    },
    query(selector) {
        const key = `query_${selector}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, document.querySelector(selector));
        }
        return this.cache.get(key);
    },
    clearCache() {
        this.cache.clear();
    }
};

// ========================================
// CORE ALGORITHM: Advanced Scent Detection
// ========================================

// TF-IDF-like Weighted Scoring Algorithm
function analyzeScent(input) {
    const tokens = input.toLowerCase().split(/\s+/);
    const scores = {};
    
    // Calculate weighted scores for each category
    for (const [category, profile] of Object.entries(SCENT_PROFILES)) {
        scores[category] = 0;
        
        // TF (Term Frequency): Count keyword matches
        profile.keywords.forEach(keyword => {
            const matches = tokens.filter(token => token.includes(keyword) || keyword.includes(token)).length;
            scores[category] += matches * profile.weight;
        });
        
        // Boost for exact matches
        if (input.includes(category)) {
            scores[category] += 2 * profile.weight;
        }
    }
    
    // Get category with highest score
    const sortedCategories = Object.entries(scores)
        .sort(([, a], [, b]) => b - a);
    
    // Return best match or default
    return sortedCategories[0][1] > 0 ? sortedCategories[0][0] : 'citrus';
}

// Main Perfume Generation (Clean Architecture)
function generatePerfume() {
    const inputElement = DOM.get('smellInput');
    const input = inputElement?.value.trim() || '';
    
    // Validation
    if (input.length < CONFIG.limits.minInputLength) {
        showNotification('Please enter at least 3 characters to describe your preferred scent.', 'warning');
        inputElement?.focus();
        return;
    }
    
    // Show loading with smooth transition
    toggleLoadingState(true);
    
    // Analyze scent with advanced algorithm
    const dominantScent = analyzeScent(input);
    const perfume = PERFUMES[dominantScent];
    
    // Display result with delay for AI effect
    setTimeout(() => {
        displayResult(perfume);
        saveToHistory(perfume);
    }, CONFIG.timing.loadingDelay);
}

// ========================================
// UI UTILITIES
// ========================================

// Unified notification system (replaces alerts)
function showNotification(message, type = 'info') {
    // Use luxury toast or alert fallback
    alert(message);
}

// Toggle loading state with smooth transitions
function toggleLoadingState(isLoading) {
    const loadingDiv = DOM.get('loadingAnimation');
    const resultDiv = DOM.get('result');
    
    if (!loadingDiv || !resultDiv) return;
    
    requestAnimationFrame(() => {
        if (isLoading) {
            loadingDiv.classList.remove('d-none');
            resultDiv.classList.add('d-none');
        } else {
            loadingDiv.classList.add('d-none');
            resultDiv.classList.remove('d-none');
        }
    });
}

// Enhanced Result Display with Smooth Animations
function displayResult(perfume) {
    const resultDiv = DOM.get('result');
    if (!resultDiv) return;
    
    // Template for result display
    const resultTemplate = `
        <h3 class="gold-text mb-3">Your Signature Scent</h3>
        <h2 class="fw-bold mb-4" id="perfumeNameTyping"></h2>
        <div class="row text-start">
            <div class="col-4"><strong>Top:</strong> ${perfume.top}</div>
            <div class="col-4"><strong>Heart:</strong> ${perfume.heart}</div>
            <div class="col-4"><strong>Base:</strong> ${perfume.base}</div>
        </div>
        <h4 class="mt-4 gold-text">${perfume.price}</h4>
        <div class="mt-4">
            <button class="btn btn-sm btn-outline-gold me-2 action-share" data-name="${perfume.name}">
                📱 Share
            </button>
            <button class="btn btn-sm btn-outline-gold me-2 action-favorite" data-name="${perfume.name}">
                ❤️ Save Favorite
            </button>
            <a href="#cta" class="btn btn-gold">🛒 Buy Now</a>
        </div>
    `;
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        toggleLoadingState(false);
        resultDiv.innerHTML = resultTemplate;
        
        // Typing effect with smooth animation
        typeWriter(perfume.name, 'perfumeNameTyping', CONFIG.timing.typingSpeed);
        
        // Event delegation for action buttons
        attachResultListeners(resultDiv);
        
        // Smooth scroll
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// Event Delegation for Result Actions
function attachResultListeners(container) {
    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-name]');
        if (!target) return;
        
        const perfumeName = target.dataset.name;
        
        if (target.classList.contains('action-share')) {
            sharePerfume(perfumeName);
        } else if (target.classList.contains('action-favorite')) {
            saveFavorite(perfumeName);
        }
    });
}

// Typing Animation (Optimized with requestAnimationFrame)
function typeWriter(text, elementId, speed) {
    const element = DOM.get(elementId);
    if (!element) return;
    
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    requestAnimationFrame(type);
}

// Social Sharing (Optimized with better fallback)
function sharePerfume(name) {
    const shareText = `I discovered my signature scent: ${name} 🌸✨ Find yours at SmellSense AI!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({ title: 'My Signature Scent', text: shareText, url: shareUrl })
            .catch(err => console.warn('Share failed:', err));
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
            .then(() => showNotification('Link copied to clipboard! Share it with friends 📋', 'success'))
            .catch(() => showNotification(`Could not copy. Link: ${shareUrl}`, 'error'));
    } else {
        showNotification(`Share this link: ${shareUrl}`, 'info');
    }
}

// ========================================
// STORAGE UTILITIES
// ========================================

// LocalStorage Wrapper with Error Handling
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(CONFIG.storage[key] || key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Storage get error for ${key}:`, error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(CONFIG.storage[key] || key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Storage set error for ${key}:`, error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(CONFIG.storage[key] || key);
            return true;
        } catch (error) {
            console.error(`Storage remove error for ${key}:`, error);
            return false;
        }
    },
    
    has(key) {
        return localStorage.getItem(CONFIG.storage[key] || key) !== null;
    }
};

// Save Favorite Scents (Optimized)
function saveFavorite(perfumeName) {
    const favorites = Storage.get('favorites', []);
    
    if (favorites.includes(perfumeName)) {
        showNotification('Already in favorites!', 'info');
        return;
    }
    
    favorites.push(perfumeName);
    Storage.set('favorites', favorites);
    showNotification('❤️ Added to favorites!', 'success');
    updateFavoritesCount();
}

// Display favorites count in navbar (Memoized)
let cachedFavoritesCount = null;
function updateFavoritesCount() {
    const favorites = Storage.get('favorites', []);
    const count = favorites.length;
    
    if (count === cachedFavoritesCount) return;
    cachedFavoritesCount = count;
    
    const brandElement = DOM.query('.navbar-brand');
    if (brandElement && count > 0) {
        brandElement.innerHTML = `SmellSense<sup>AI</sup> <span class="badge bg-warning text-dark ms-2">${count}</span>`;
    }
}

// Quiz History Tracker (Optimized)
function saveToHistory(perfume) {
    const history = Storage.get('quizHistory', []);
    
    history.unshift({
        perfume: perfume.name,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    });
    
    // Keep only configured max items
    Storage.set('quizHistory', history.slice(0, CONFIG.limits.maxHistoryItems));
}

// View History (Optimized with Templates)
function showHistory() {
    const history = Storage.get('quizHistory', []);
    const historySection = DOM.get('historySection');
    
    if (!historySection) return;
    
    if (history.length === 0) {
        showNotification('No quiz history yet!', 'info');
        return;
    }
    
    // Build history list efficiently
    const historyItems = history
        .map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${item.perfume}</span>
                <span class="badge bg-gold text-dark">${item.date}</span>
            </li>
        `)
        .join('');
    
    const historyTemplate = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <h4 class="mb-4">Your Quiz History</h4>
                    <ul class="list-group">${historyItems}</ul>
                    <div class="text-center mt-3">
                        <button onclick="clearHistory()" class="btn btn-outline-danger btn-sm">Clear History</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    requestAnimationFrame(() => {
        historySection.innerHTML = historyTemplate;
    });
}

function clearHistory() {
    Storage.remove('quizHistory');
    const historySection = DOM.get('historySection');
    
    if (historySection) {
        historySection.innerHTML = `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-8 text-center">
                        <button onclick="showHistory()" class="btn btn-outline-gold">📜 View Quiz History</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// ========================================
// CAMERA & MEDIA
// ========================================

// Virtual Try-On Camera (Optimized)
function startCamera() {
    const video = DOM.get('camera');
    
    if (!navigator.mediaDevices?.getUserMedia) {
        showNotification('Camera not supported on this device/browser. Please use Chrome, Firefox, or Safari.', 'error');
        return;
    }
    
    navigator.mediaDevices
        .getUserMedia({ video: CONFIG.canvas })
        .then(stream => {
            video.srcObject = stream;
            video.classList.remove('d-none');
            console.log('Camera started successfully');
        })
        .catch(err => {
            console.error('Camera error:', err);
            showNotification('Camera access denied. Please enable camera permissions in browser settings.', 'error');
        });
}

function capturePhoto() {
    const video = DOM.get('camera');
    const canvas = DOM.get('canvas');
    
    if (!video?.srcObject) {
        showNotification('Please start the camera first!', 'warning');
        return;
    }
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    showNotification('Photo captured! 📸', 'success');
}

// Email Subscription
function subscribeEmail() {
    const firstName = document.getElementById('firstNameInput')?.value.trim();
    const lastName = document.getElementById('lastNameInput')?.value.trim();
    const email = document.getElementById('emailInput')?.value.trim();
    const phone = document.getElementById('phoneInput')?.value.trim();
    const consent = document.getElementById('consentCheck')?.checked;
    
    // Validation
    if (!firstName || !lastName) {
        alert('Please enter your first and last name.');
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address (e.g., your@email.com)');
        return;
    }
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit phone number.');
        return;
    }
    
    if (!consent) {
        alert('Please accept the terms to continue.');
        return;
    }
    
    // Store data
    localStorage.setItem('emailSubscribed', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', `${firstName} ${lastName}`);
    localStorage.setItem('userPhone', phone);
    
    alert('✅ Welcome to the L\\'Oréal Paris Circle! Check your inbox for your 20% off code.');
    
    // Close modal
    const modalElement = document.getElementById('emailModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// Show email modal after 15 seconds
function showEmailModal() {
    setTimeout(() => {
        if (!localStorage.getItem('emailSubscribed')) {
            const modalElement = document.getElementById('emailModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                new bootstrap.Modal(modalElement).show();
            }
        }
    }, 15000);
}

// ========================================
// SEASONAL & MISC
// ========================================

// Seasonal Recommendations (Reusable)
function getSeasonalRecommendation() {
    const month = new Date().getMonth();
    const seasonal = new Map([
        [[11, 0, 1], 'Try our warm Sandalwood Noir for winter ❄️'],
        [[2, 3, 4], 'Fresh Lavender Bliss for spring 🌸'],
        [[5, 6, 7], 'Cool Aquatic Marine for summer 🌊'],
        [[8, 9, 10], 'Spice Route for autumn vibes 🍂']
    ]);
    
    for (const [months, message] of seasonal) {
        if (months.includes(month)) return message;
    }
    
    return 'Discover your perfect scent today ✨';
}

// ========================================
// PERFORMANCE UTILITIES
// ========================================

// Debounce utility for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimized scroll handler with throttle
const handleScroll = throttle(() => {
    const navbar = DOM.query('.navbar');
    if (navbar) {
        const opacity = window.scrollY > 50 ? 0.98 : 0.95;
        navbar.style.background = `rgba(26,26,46,${opacity})`;
    }
}, CONFIG.timing.scrollDebounce);

// Lazy load images with IntersectionObserver
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Cookie Consent Functions
function acceptCookies() { 
    document.getElementById('cookieConsent').classList.add('d-none'); 
    localStorage.setItem('cookiesAccepted', 'true'); 
}

function cookieSettings() { 
    alert('Cookie Settings: Essential cookies enabled. Analytics optional.'); 
}

// Show cookie banner if not accepted
function showCookieBanner() {
    if (!localStorage.getItem('cookiesAccepted')) {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('d-none');
        }
    }
}

// ========================================
// INITIALIZATION
// ========================================

// App initialization with performance optimization
function initApp() {
    updateFavoritesCount();
    lazyLoadImages();
    showCookieBanner();
    
    // Delayed non-critical tasks
    requestIdleCallback(() => {
        showEmailModal();
    }, { timeout: 2000 });
    
    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
