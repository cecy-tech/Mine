// Data storage
let albums = {
    'default': {
        id: 'default',
        name: 'My Gallery',
        media: [],
        createdAt: new Date().toISOString()
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        initHomePage();
    } else if (currentPage === 'gallery.html') {
        initGalleryPage();
    } else if (currentPage === 'videos.html') {
        initVideosPage();
    }
    
    // Learn More button
    const learnBtn = document.getElementById('learnMoreBtn');
    if (learnBtn) {
        learnBtn.onclick = () => {
            window.location.href = 'gallery.html';
        };
    }
});

function loadData() {
    const saved = localStorage.getItem('companyData');
    if (saved) {
        albums = JSON.parse(saved);
    } else {
        // Add some demo content
        albums = {
            'default': {
                id: 'default',
                name: 'My Gallery',
                media: [],
                createdAt: new Date().toISOString()
            }
        };
        saveData();
    }
    updateStats();
}

function saveData() {
    localStorage.setItem('companyData', JSON.stringify(albums));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function updateStats() {
    let totalPhotos = 0;
    let totalVideos = 0;
    
    Object.values(albums).forEach(album => {
        if (album.media) {
            totalPhotos += album.media.filter(m => m.type === 'image').length;
            totalVideos += album.media.filter(m => m.type === 'video').length;
        }
    });
    
    const albumCount = Object.keys(albums).length;
    
    const albumEl = document.getElementById('albumCount');
    const photoEl = document.getElementById('photoCount');
    const videoEl = document.getElementById('videoCount');
    
    if (albumEl) albumEl.textContent = albumCount;
    if (photoEl) photoEl.textContent = totalPhotos;
    if (videoEl) videoEl.textContent = totalVideos;
}

// Home page
function initHomePage() {
    // Already handled
}

// Gallery page
function initGalleryPage() {
    renderGallery();
    
    const uploadBtn = document.getElementById('uploadBtn');
    const modal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('#uploadModal .close');
    const confirmBtn = document.getElementById('confirmUpload');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadBtn) {
        uploadBtn.onclick = () => {
            modal.style.display = 'flex';
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const files = fileInput.files;
            if (files.length === 0) {
                alert('Please select files');
                return;
            }
            
            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) {
                    alert(`${file.name} is not an image`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!albums['default'].media) albums['default'].media = [];
                    albums['default'].media.push({
                        id: generateId(),
                        name: file.name,
                        type: 'image',
                        url: e.target.result,
                        uploadedAt: new Date().toISOString(),
                        size: file.size
                    });
                    saveData();
                    renderGallery();
                    updateStats();
                };
                reader.readAsDataURL(file);
            });
            
            modal.style.display = 'none';
            fileInput.value = '';
            alert('Upload complete!');
        };
    }
    
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    const media = albums['default']?.media?.filter(m => m.type === 'image') || [];
    
    if (media.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); grid-column:1/-1;">No photos yet. Click "Upload New Photos" to add some!</p>';
        return;
    }
    
    grid.innerHTML = '';
    media.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${photo.url}" alt="${escapeHtml(photo.name)}">
            <div class="item-info">
                <div class="item-name">${escapeHtml(photo.name)}</div>
            </div>
        `;
        item.onclick = () => {
            if (confirm('Delete this photo?')) {
                const index = albums['default'].media.findIndex(m => m.id === photo.id);
                albums['default'].media.splice(index, 1);
                saveData();
                renderGallery();
                updateStats();
            }
        };
        grid.appendChild(item);
    });
}

// Videos page
function initVideosPage() {
    renderVideos();
    
    const uploadBtn = document.getElementById('uploadVideoBtn');
    const modal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('#uploadModal .close');
    const confirmBtn = document.getElementById('confirmUpload');
    const videoInput = document.getElementById('videoInput');
    
    if (uploadBtn) {
        uploadBtn.onclick = () => {
            modal.style.display = 'flex';
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const files = videoInput.files;
            if (files.length === 0) {
                alert('Please select files');
                return;
            }
            
            Array.from(files).forEach(file => {
                if (!file.type.startsWith('video/')) {
                    alert(`${file.name} is not a video`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!albums['default'].media) albums['default'].media = [];
                    albums['default'].media.push({
                        id: generateId(),
                        name: file.name,
                        type: 'video',
                        url: e.target.result,
                        uploadedAt: new Date().toISOString(),
                        size: file.size
                    });
                    saveData();
                    renderVideos();
                    updateStats();
                };
                reader.readAsDataURL(file);
            });
            
            modal.style.display = 'none';
            videoInput.value = '';
            alert('Upload complete!');
        };
    }
    
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

function renderVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;
    
    const media = albums['default']?.media?.filter(m => m.type === 'video') || [];
    
    if (media.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); grid-column:1/-1;">No videos yet. Click "Upload New Videos" to add some!</p>';
        return;
    }
    
    grid.innerHTML = '';
    media.forEach(video => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `
            <div class="video-thumbnail">
                <video src="${video.url}" preload="metadata"></video>
                <div class="play-overlay">▶</div>
            </div>
            <div class="item-info">
                <div class="item-name">${escapeHtml(video.name)}</div>
            </div>
        `;
        item.onclick = () => {
            if (confirm('Delete this video?')) {
                const index = albums['default'].media.findIndex(m => m.id === video.id);
                albums['default'].media.splice(index, 1);
                saveData();
                renderVideos();
                updateStats();
            }
        };
        grid.appendChild(item);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
