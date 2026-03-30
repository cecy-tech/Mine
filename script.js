// Global data store
let albums = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Determine which page we're on
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        initHomePage();
    } else if (currentPage === 'gallery.html') {
        initGalleryPage();
    } else if (currentPage === 'videos.html') {
        initVideosPage();
    }
});

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('sparkleShareData');
    if (savedData) {
        albums = JSON.parse(savedData);
    } else {
        // Create demo data
        albums = {
            'demo1': {
                id: 'demo1',
                name: '✨ Welcome Album ✨',
                createdAt: new Date().toISOString(),
                media: [],
                comments: []
            }
        };
        saveData();
    }
}

// Save data
function saveData() {
    localStorage.setItem('sparkleShareData', JSON.stringify(albums));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ HOME PAGE FUNCTIONS ============
function initHomePage() {
    updateStats();
    renderFeaturedAlbums();
    renderRecentActivity();
    populateAlbumSelect();
    
    // Event listeners
    const createBtn = document.getElementById('createAlbumBtnHome');
    if (createBtn) createBtn.onclick = showCreateAlbumModal;
    
    const quickUploadBtn = document.getElementById('quickUploadBtn');
    if (quickUploadBtn) quickUploadBtn.onclick = quickUpload;
    
    const quickUploadInput = document.getElementById('quickUpload');
    if (quickUploadInput) {
        quickUploadInput.onchange = (e) => handleQuickUploadPreview(e.target.files);
    }
    
    const saveAlbumBtn = document.getElementById('saveAlbumBtn');
    if (saveAlbumBtn) saveAlbumBtn.onclick = createAlbum;
    
    const closeModal = document.querySelector('#albumModal .close');
    if (closeModal) closeModal.onclick = () => closeModalFn('albumModal');
}

function updateStats() {
    let totalPhotos = 0;
    let totalVideos = 0;
    let totalComments = 0;
    
    Object.values(albums).forEach(album => {
        if (album.media) {
            totalPhotos += album.media.filter(m => m.type === 'image').length;
            totalVideos += album.media.filter(m => m.type === 'video').length;
        }
        if (album.comments) totalComments += album.comments.length;
        if (album.media) {
            album.media.forEach(media => {
                if (media.comments) totalComments += media.comments.length;
            });
        }
    });
    
    const albumCount = Object.keys(albums).length;
    
    document.getElementById('albumCount').textContent = albumCount;
    document.getElementById('photoCount').textContent = totalPhotos;
    document.getElementById('videoCount').textContent = totalVideos;
    document.getElementById('commentCount').textContent = totalComments;
}

function renderFeaturedAlbums() {
    const container = document.getElementById('featuredAlbums');
    if (!container) return;
    
    container.innerHTML = '';
    const albumArray = Object.values(albums).slice(0, 4);
    
    albumArray.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.onclick = () => window.location.href = `gallery.html?album=${album.id}`;
        
        const photoCount = album.media ? album.media.filter(m => m.type === 'image').length : 0;
        const videoCount = album.media ? album.media.filter(m => m.type === 'video').length : 0;
        
        card.innerHTML = `
            <h3>📁 ${escapeHtml(album.name)}</h3>
            <div class="album-stats">
                <span>📷 ${photoCount}</span>
                <span>🎬 ${videoCount}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    const activities = [];
    
    Object.values(albums).forEach(album => {
        if (album.comments) {
            album.comments.forEach(comment => {
                activities.push({
                    type: 'comment',
                    text: comment.text,
                    album: album.name,
                    time: comment.createdAt
                });
            });
        }
        if (album.media) {
            album.media.forEach(media => {
                activities.push({
                    type: 'upload',
                    name: media.name,
                    album: album.name,
                    time: media.uploadedAt
                });
            });
        }
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recent = activities.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-center">✨ No activity yet. Start sharing! ✨</p>';
        return;
    }
    
    container.innerHTML = '';
    recent.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-icon">${activity.type === 'comment' ? '💬' : '📤'}</div>
            <div class="activity-text">
                ${activity.type === 'comment' ? 
                    `New comment in "${escapeHtml(activity.album)}": "${escapeHtml(activity.text.substring(0, 50))}"` : 
                    `New upload: "${escapeHtml(activity.name)}" in "${escapeHtml(activity.album)}"`}
            </div>
            <div class="activity-time">${formatTimeAgo(new Date(activity.time))}</div>
        `;
        container.appendChild(div);
    });
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(h
