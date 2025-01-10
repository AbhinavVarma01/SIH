// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px'
});

// Observe all elements with 'hidden' class
document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

// Video Modal Functionality
const modal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');
const closeModal = document.querySelector('.close-modal');

// Function to open modal with video
function openVideoModal(videoUrl) {
    if (!videoUrl) return;
    
    // Ensure proper YouTube embed URL format
    const embedUrl = videoUrl.replace('watch?v=', 'embed/');
    videoFrame.src = embedUrl;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));
    document.body.style.overflow = 'hidden';
}

// Function to close modal
function closeVideoModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        videoFrame.src = '';
    }, 300);
    document.body.style.overflow = 'auto';
}

// Add click event listeners to all video cards
document.querySelectorAll('[data-video]').forEach(card => {
    const videoUrl = card.dataset.video;
    if (videoUrl) {
        const overlay = card.querySelector('.card-overlay');
        const image = card.querySelector('.card-image');
        
        if (overlay) overlay.addEventListener('click', () => openVideoModal(videoUrl));
        if (image) image.addEventListener('click', () => openVideoModal(videoUrl));
    }
});

// Close modal when clicking close button or outside
if (closeModal) closeModal.addEventListener('click', closeVideoModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeVideoModal();
    });
}

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
});

// Navbar scroll effect
let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.style.transform = 'translateY(0)';
        return;
    }
    
    if (currentScroll > lastScroll) {
        nav.style.transform = 'translateY(-100%)';
    } else {
        nav.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Simulate live market data updates
function updateMarketData() {
    const symbols = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT'];
    const tickerItems = document.querySelectorAll('.ticker-item');
    
    tickerItems.forEach((item, index) => {
        if (index >= symbols.length) return;
        
        const priceChange = (Math.random() * 4 - 2).toFixed(2);
        const newPrice = (Math.random() * 1000 + 100).toFixed(2);
        
        const priceElement = item.querySelector('.price');
        const changeElement = item.querySelector('.change');
        
        if (priceElement && changeElement) {
            priceElement.textContent = `$${newPrice}`;
            changeElement.textContent = `${priceChange}%`;
            changeElement.className = `change ${priceChange >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Update market data every 5 seconds
setInterval(updateMarketData, 5000);

// Initialize market data on load
updateMarketData();