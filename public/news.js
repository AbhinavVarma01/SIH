const API_KEY = '45a19c772ed24195b8058fcaa194a112';
const API_BASE_URL = 'https://newsapi.org/v2';
const newsGrid = document.getElementById('newsGrid');
const loader = document.getElementById('loader');
const error = document.getElementById('error');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const categories = document.getElementById('categories');

let currentCategory = 'general';

// Event Listeners
searchForm.addEventListener('submit', handleSearch);
categories.addEventListener('click', handleCategoryChange);

// Initialize
fetchNews();

async function fetchNews(query) {
  showLoader();
  
  try {
    const endpoint = query
      ? `${API_BASE_URL}/everything?q=${query}&apiKey=${API_KEY}`
      : `${API_BASE_URL}/top-headlines?country=us&category=${currentCategory}&apiKey=${API_KEY}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    displayNews(data.articles);
  } catch (err) {
    showError(err.message);
  }
}

function displayNews(articles) {
  hideLoader();
  hideError();
  
  newsGrid.innerHTML = articles
    .map(article => createNewsCard(article))
    .join('');
}

function createNewsCard(article) {
  const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c';
  
  return `
    <article class="news-card">
      <div class="news-image">
        <img src="${article.urlToImage || fallbackImage}" alt="${article.title}" onerror="this.src='${fallbackImage}'">
        <span class="source-badge">${article.source.name}</span>
      </div>
      <div class="news-content">
        <h2 class="news-title">${article.title}</h2>
        <p class="news-description">${article.description || ''}</p>
        <div class="news-footer">
          <span>${formatDate(article.publishedAt)}</span>
          <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-link">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  
  if (query) {
    fetchNews(query);
    resetCategoryButtons();
  }
}

function handleCategoryChange(e) {
  const categoryBtn = e.target.closest('.category-btn');
  if (!categoryBtn) return;

  const category = categoryBtn.dataset.category;
  currentCategory = category;
  
  resetCategoryButtons();
  categoryBtn.classList.add('active');
  searchInput.value = '';
  
  fetchNews();
}

function resetCategoryButtons() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function showLoader() {
  loader.style.display = 'block';
  error.style.display = 'none';
  newsGrid.innerHTML = '';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showError(message) {
  hideLoader();
  error.style.display = 'block';
  error.textContent = message || 'Something went wrong. Please try again later.';
  newsGrid.innerHTML = '';
}

function hideError() {
  error.style.display = 'none';
}