// Data storage
let albums = {};

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
});

// Load from localStorage
function loadData() {
    const saved = localStorage.getItem('sparkleShareData');
    if (saved) {
        albums = JSON.parse(saved);
    } else {
        albums = {};
        saveData();
    }
    updateStats();
}

// Save to localStorage
function saveData() {
    localStorage.setItem('sparkleShareData', JSON.stringify(albums));
}

// Generate ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Update stats on home page
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
    });
    
    const albumCount = Object.keys(albums).length;
    
    const albumCountEl = document.getElementById('albumCount');
    const photoCountEl = document.getElementById('photoCount');
    const videoCountEl = document.getElementById('videoCount');
    const commentCountEl = document.getElementById('commentCount');
    
    if (albumCountEl) albumCountEl.textContent = albumCount;
    if (photoCountEl) photoCountEl.textContent = totalPhotos;
    if (videoCountEl) videoCountEl.textContent = totalVideos;
    if (commentCountEl) commentCountEl.textContent = totalComments;
}

// ============ HOME PAGE ============
function initHomePage() {
    renderAlbums();
    
    const createBtn = document.getElementById('createAlbumBtn');
    if (createBtn) {
        createBtn.onclick = () => {
            const nameInput = document.getElementById('albumName');
            const name = nameInput.value.trim();
            if (name) {
                const id = generateId();
                albums[id] = {
                    id: id,
                    name: name,
                    createdAt: new Date().toISOString(),
                    media: [],
                    comments: []
                };
                saveData();
                renderAlbums();
                updateStats();
                nameInput.value = '';
                alert(`✨ Album "${name}" created!`);
            } else {
                alert('Please enter an album name');
            }
        };
    }
}

function renderAlbums() {
    const grid = document.getElementById('albumsGrid');
    if (!grid) return;
    
    const albumArray = Object.values(albums);
    if (albumArray.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#a0aec0; grid-column:1/-1;">No albums yet. Create your first album above!</p>';
        return;
    }
    
    grid.innerHTML = '';
    albumArray.forEach(album => {
        const photoCount = album.media ? album.media.filter(m => m.type === 'image').length : 0;
        const videoCount = album.media ? album.media.filter(m => m.type === 'video').length : 0;
        
        const card = document.createElement('div');
        card.className = 'album-card';
        card.onclick = () => window.location.href = `gallery.html?album=${album.id}`;
        card.innerHTML = `
            <h3>📁 ${escapeHtml(album.name)}</h3>
            <div class="album-stats">
                <span>📷 ${photoCount} photos</span>
                <span>🎬 ${videoCount} videos</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============ GALLERY PAGE ============
function initGalleryPage() {
    populateAlbumFilters();
    renderGallery();
    
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const modal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('#uploadModal .close');
    const confirmBtn = document.getElementById('confirmUploadBtn');
    
    if (uploadBtn) {
        uploadBtn.onclick = () => {
            populateUploadSelect();
            modal.style.display = 'flex';
        };
    }
    
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const albumId = document.getElementById('uploadAlbumSelect').value;
            const files = document.getElementById('uploadFiles').files;
            
            if (!albumId) {
                alert('Please select an album');
                return;
            }
            if (files.length === 0) {
                alert('Please select files');
                return;
            }
            
            Array.from(files).forEach(file => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                
                if (!isImage && !isVideo) {
                    alert(`${file.name} is not supported`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!albums[albumId].media) albums[albumId].media = [];
                    albums[albumId].media.push({
                        id: generateId(),
                        name: file.name,
                        type: isImage ? 'image' : 'video',
                        url: e.target.result,
                        uploadedAt: new Date().toISOString(),
                        size: file.size,
                        comments: []
                    });
                    saveData();
                    renderGallery();
                    updateStats();
                };
                reader.readAsDataURL(file);
            });
            
            modal.style.display = 'none';
            document.getElementById('uploadFiles').value = '';
            alert('Upload complete!');
        };
    }
    
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

function renderGallery() {
    const filter = document.getElementById('albumFilter');
    const selectedAlbum = filter ? filter.value : 'all';
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    
    let allPhotos = [];
    Object.values(albums).forEach(album => {
        if (selectedAlbum === 'all' || album.id === selectedAlbum) {
            if (album.media) {
                const photos = album.media.filter(m => m.type === 'image');
                allPhotos = [...allPhotos, ...photos.map(p => ({ ...p, albumName: album.name, albumId: album.id }))];
            }
        }
    });
    
    if (allPhotos.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#a0aec0; grid-column:1/-1;">No photos yet. Upload some!</p>';
        return;
    }
    
    grid.innerHTML = '';
    allPhotos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${photo.url}" alt="${escapeHtml(photo.name)}">
            <div class="item-info">
                <div class="item-name">${escapeHtml(photo.name)}</div>
            </div>
        `;
        item.onclick = () => openLightbox(photo);
        grid.appendChild(item);
    });
}

function populateAlbumFilters() {
    const filterSelect = document.getElementById('albumFilter');
    const uploadSelect = document.getElementById('uploadAlbumSelect');
    
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">All Albums</option>';
        Object.values(albums).forEach(album => {
            filterSelect.innerHTML += `<option value="${album.id}">${escapeHtml(album.name)}</option>`;
        });
        filterSelect.onchange = () => renderGallery();
    }
    
    if (uploadSelect) populateUploadSelect();
}

function populateUploadSelect() {
    const uploadSelect = document.getElementById('uploadAlbumSelect');
    if (uploadSelect) {
        uploadSelect.innerHTML = '<option value="">Select Album</option>';
        Object.values(albums).forEach(album => {
            uploadSelect.innerHTML += `<option value="${album.id}">${escapeHtml(album.name)}</option>`;
        });
    }
}

function openLightbox(photo) {
    alert(`Viewing: ${photo.name}\nFrom album: ${photo.albumName}\n(Full viewer would open here)`);
}

// ============ VIDEOS PAGE ============
function initVideosPage() {
    populateVideoFilters();
    renderVideos();
    
    const uploadBtn = document.getElementById('uploadVideoBtn');
    const modal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('#uploadModal .close');
    const confirmBtn = document.getElementById('confirmUploadBtn');
    
    if (uploadBtn) {
        uploadBtn.onclick = () => {
            populateUploadSelect();
            modal.style.display = 'flex';
        };
    }
    
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const albumId = document.getElementById('uploadAlbumSelect').value;
            const files = document.getElementById('uploadFiles').files;
            
            if (!albumId) {
                alert('Please select an album');
                return;
            }
            if (files.length === 0) {
                alert('Please select files');
                return;
            }
            
            Array.from(files).forEach(file => {
                const isVideo = file.type.startsWith('video/');
                if (!isVideo) {
                    alert(`${file.name} is not a video`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!albums[albumId].media) albums[albumId].media = [];
                    albums[albumId].media.push({
                        id: generateId(),
                        name: file.name,
                        type: 'video',
                        url: e.target.result,
                        uploadedAt: new Date().toISOString(),
                        size: file.size,
                        comments: []
                    });
                    saveData();
                    renderVideos();
                    updateStats();
                };
                reader.readAsDataURL(file);
            });
            
            modal.style.display = 'none';
            document.getElementById('uploadFiles').value = '';
            alert('Upload complete!');
        };
    }
}

function renderVideos() {
    const filter = document.getElementById('videoAlbumFilter');
    const selectedAlbum = filter ? filter.value : 'all';
    const grid = document.getElementById('videosGrid');
    if (!grid) return;
    
    let allVideos = [];
    Object.values(albums).forEach(album => {
        if (selectedAlbum === 'all' || album.id === selectedAlbum) {
            if (album.media) {
                const videos = album.media.filter(m => m.type === 'video');
                allVideos = [...allVideos, ...videos.map(v => ({ ...v, albumName: album.name }))];
            }
        }
    });
    
    if (allVideos.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#a0aec0; grid-column:1/-1;">No videos yet. Upload some!</p>';
        return;
    }
    
    grid.innerHTML = '';
    allVideos.forEach(video => {
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
        item.onclick = () => alert(`Playing: ${video.name}`);
        grid.appendChild(item);
    });
}

function populateVideoFilters() {
    const filterSelect = document.getElementById('videoAlbumFilter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">All Albums</option>';
        Object.values(albums).forEach(album => {
            filterSelect.innerHTML += `<option value="${album.id}">${escapeHtml(album.name)}</option>`;
        });
        filterSelect.onchange = () => renderVideos();
    }
}

// Helper function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
