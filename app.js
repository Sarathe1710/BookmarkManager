/* ============================================================
   LinkVault — Professional Bookmark Manager
   Application Logic
   ============================================================ */

(function () {
    'use strict';

    // ========== CONSTANTS ==========
    const STORAGE_KEY = 'linkvault_bookmarks';
    const PREFS_KEY = 'linkvault_prefs';

    const CATEGORY_CONFIG = {
        'Education':      { icon: '📚', color: '#4F46E5', bg: '#EEF2FF', class: 'cat-education' },
        'Development':    { icon: '💻', color: '#059669', bg: '#ECFDF5', class: 'cat-development' },
        'Design':         { icon: '🎨', color: '#D946EF', bg: '#FDF4FF', class: 'cat-design' },
        'Documentation':  { icon: '📖', color: '#0EA5E9', bg: '#F0F9FF', class: 'cat-documentation' },
        'Tutorials':      { icon: '🎓', color: '#F97316', bg: '#FFF7ED', class: 'cat-tutorials' },
        'Tools':          { icon: '🔧', color: '#6366F1', bg: '#EEF2FF', class: 'cat-tools' },
        'News':           { icon: '📰', color: '#EF4444', bg: '#FEF2F2', class: 'cat-news' },
        'Social':         { icon: '💬', color: '#8B5CF6', bg: '#F5F3FF', class: 'cat-social' },
        'Entertainment':  { icon: '🎬', color: '#EC4899', bg: '#FDF2F8', class: 'cat-entertainment' },
        'Finance':        { icon: '💰', color: '#14B8A6', bg: '#F0FDFA', class: 'cat-finance' },
        'Health':         { icon: '🏥', color: '#22C55E', bg: '#F0FDF4', class: 'cat-health' },
        'Shopping':       { icon: '🛒', color: '#F59E0B', bg: '#FFFBEB', class: 'cat-shopping' },
        'Travel':         { icon: '✈️', color: '#06B6D4', bg: '#ECFEFF', class: 'cat-travel' },
        'Other':          { icon: '📌', color: '#64748B', bg: '#F8FAFC', class: 'cat-other' },
    };

    const CUSTOM_CATEGORY_COLORS = [
        { color: '#7C3AED', bg: '#F5F3FF' },
        { color: '#0891B2', bg: '#ECFEFF' },
        { color: '#CA8A04', bg: '#FEFCE8' },
        { color: '#BE185D', bg: '#FDF2F8' },
        { color: '#0D9488', bg: '#F0FDFA' },
        { color: '#9333EA', bg: '#FAF5FF' },
    ];

    // ========== STATE ==========
    let bookmarks = [];
    let currentView = 'all';
    let currentSort = 'newest';
    let currentViewMode = 'grid';
    let searchQuery = '';
    let deleteTargetId = null;

    // ========== DOM ELEMENTS ==========
    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);

    const els = {
        sidebar: $('sidebar'),
        sidebarToggle: $('sidebarToggle'),
        mobileMenuBtn: $('mobileMenuBtn'),
        mainContent: $('mainContent'),
        searchInput: $('searchInput'),
        bookmarksGrid: $('bookmarksGrid'),
        bookmarksContainer: $('bookmarksContainer'),
        emptyState: $('emptyState'),
        noResults: $('noResults'),
        pageTitle: $('pageTitle'),
        pageSubtitle: $('pageSubtitle'),
        totalCount: $('totalCount'),
        favCount: $('favCount'),
        statTotal: $('statTotal'),
        statCategories: $('statCategories'),
        statFavorites: $('statFavorites'),
        categoryNav: $('categoryNav'),
        sortBtn: $('sortBtn'),
        sortMenu: $('sortMenu'),
        addBookmarkBtn: $('addBookmarkBtn'),
        emptyAddBtn: $('emptyAddBtn'),
        bookmarkModal: $('bookmarkModal'),
        bookmarkForm: $('bookmarkForm'),
        modalTitle: $('modalTitle'),
        modalClose: $('modalClose'),
        modalCancel: $('modalCancel'),
        submitBtnText: $('submitBtnText'),
        bookmarkId: $('bookmarkId'),
        bookmarkUrl: $('bookmarkUrl'),
        bookmarkTitle: $('bookmarkTitle'),
        bookmarkDescription: $('bookmarkDescription'),
        bookmarkCategory: $('bookmarkCategory'),
        bookmarkTags: $('bookmarkTags'),
        bookmarkFavorite: $('bookmarkFavorite'),
        customCategoryGroup: $('customCategoryGroup'),
        customCategory: $('customCategory'),
        deleteModal: $('deleteModal'),
        deleteBookmarkName: $('deleteBookmarkName'),
        deleteModalClose: $('deleteModalClose'),
        deleteCancelBtn: $('deleteCancelBtn'),
        deleteConfirmBtn: $('deleteConfirmBtn'),
        importBtn: $('importBtn'),
        exportBtn: $('exportBtn'),
        importModal: $('importModal'),
        importModalClose: $('importModalClose'),
        importDropzone: $('importDropzone'),
        importFile: $('importFile'),
        toastContainer: $('toastContainer'),
        statsRow: $('statsRow'),
    };

    // ========== DATA LAYER ==========
    function loadBookmarks() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            bookmarks = data ? JSON.parse(data) : [];
        } catch (e) {
            bookmarks = [];
        }
        if (bookmarks.length === 0) {
            bookmarks = getDefaultBookmarks();
            saveBookmarks();
        }
    }

    function saveBookmarks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }

    function loadPrefs() {
        try {
            const data = localStorage.getItem(PREFS_KEY);
            if (data) {
                const prefs = JSON.parse(data);
                currentSort = prefs.sort || 'newest';
                currentViewMode = prefs.viewMode || 'grid';
            }
        } catch (e) { /* use defaults */ }
    }

    function savePrefs() {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
            sort: currentSort,
            viewMode: currentViewMode,
        }));
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    function getDefaultBookmarks() {
        return [
            {
                id: generateId(), url: 'https://developer.mozilla.org', title: 'MDN Web Docs',
                description: 'The comprehensive reference for web technologies including HTML, CSS, JavaScript, and Web APIs.',
                category: 'Documentation', tags: ['html', 'css', 'javascript', 'web'], favorite: true,
                createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            },
            {
                id: generateId(), url: 'https://github.com', title: 'GitHub',
                description: 'The world\'s leading platform for software development, version control, and collaboration.',
                category: 'Development', tags: ['git', 'code', 'open-source'], favorite: true,
                createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
            },
            {
                id: generateId(), url: 'https://stackoverflow.com', title: 'Stack Overflow',
                description: 'The largest community for developers to learn, share knowledge, and build careers.',
                category: 'Development', tags: ['q&a', 'programming', 'community'], favorite: false,
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
                id: generateId(), url: 'https://www.coursera.org', title: 'Coursera',
                description: 'Access world-class education from top universities and companies with online courses and degrees.',
                category: 'Education', tags: ['courses', 'learning', 'university'], favorite: true,
                createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
            },
            {
                id: generateId(), url: 'https://www.figma.com', title: 'Figma',
                description: 'Collaborative interface design tool for creating, prototyping, and handing off designs.',
                category: 'Design', tags: ['ui', 'ux', 'prototyping'], favorite: false,
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            },
            {
                id: generateId(), url: 'https://react.dev', title: 'React Documentation',
                description: 'Official React documentation — learn React step by step with interactive examples.',
                category: 'Tutorials', tags: ['react', 'javascript', 'frontend'], favorite: true,
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
                id: generateId(), url: 'https://www.notion.so', title: 'Notion',
                description: 'All-in-one workspace for notes, docs, project management, and knowledge bases.',
                category: 'Tools', tags: ['productivity', 'notes', 'workspace'], favorite: false,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: generateId(), url: 'https://news.ycombinator.com', title: 'Hacker News',
                description: 'Social news website focused on computer science, startups, and technology.',
                category: 'News', tags: ['tech', 'startups', 'discussion'], favorite: false,
                createdAt: new Date().toISOString(),
            },
        ];
    }

    // ========== HELPERS ==========
    function getDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    function getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    }

    function getCategoryConfig(cat) {
        if (CATEGORY_CONFIG[cat]) return CATEGORY_CONFIG[cat];
        // Custom category — assign consistent color
        let hash = 0;
        for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        const idx = Math.abs(hash) % CUSTOM_CATEGORY_COLORS.length;
        return { icon: '🏷️', ...CUSTOM_CATEGORY_COLORS[idx], class: '' };
    }

    function formatDate(iso) {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    // ========== CATEGORIES ==========
    function getAllCategories() {
        const cats = new Set();
        bookmarks.forEach(b => cats.add(b.category));
        return Array.from(cats).sort();
    }

    function getCategoryCount(cat) {
        return bookmarks.filter(b => b.category === cat).length;
    }

    function renderCategoryNav() {
        const cats = getAllCategories();
        let html = '';
        cats.forEach(cat => {
            const cfg = getCategoryConfig(cat);
            const count = getCategoryCount(cat);
            const isActive = currentView === `category:${cat}`;
            html += `
                <a href="#" class="nav-item${isActive ? ' active' : ''}" data-view="category:${cat}">
                    <span class="category-dot" style="background:${cfg.color}"></span>
                    <span>${escapeHtml(cat)}</span>
                    <span class="nav-badge">${count}</span>
                </a>
            `;
        });
        els.categoryNav.innerHTML = html;

        // Bind click events
        els.categoryNav.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                setView(item.dataset.view);
            });
        });
    }

    // ========== RENDERING ==========
    function getFilteredBookmarks() {
        let filtered = [...bookmarks];

        // Filter by view
        if (currentView === 'favorites') {
            filtered = filtered.filter(b => b.favorite);
        } else if (currentView === 'recent') {
            const week = Date.now() - 7 * 86400000;
            filtered = filtered.filter(b => new Date(b.createdAt).getTime() > week);
        } else if (currentView.startsWith('category:')) {
            const cat = currentView.replace('category:', '');
            filtered = filtered.filter(b => b.category === cat);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.url.toLowerCase().includes(q) ||
                (b.description || '').toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q) ||
                (b.tags || []).some(t => t.toLowerCase().includes(q))
            );
        }

        // Sort
        switch (currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'alpha':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'alpha-desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        return filtered;
    }

    function renderBookmarks() {
        const filtered = getFilteredBookmarks();

        if (bookmarks.length === 0) {
            els.bookmarksContainer.style.display = 'none';
            els.emptyState.style.display = 'block';
            els.noResults.style.display = 'none';
            return;
        }

        if (filtered.length === 0) {
            els.bookmarksContainer.style.display = 'none';
            els.emptyState.style.display = 'none';
            els.noResults.style.display = 'block';
            return;
        }

        els.bookmarksContainer.style.display = 'block';
        els.emptyState.style.display = 'none';
        els.noResults.style.display = 'none';

        let html = '';
        filtered.forEach((b, index) => {
            const cfg = getCategoryConfig(b.category);
            const favicon = getFaviconUrl(b.url);
            const domain = getDomain(b.url);
            const firstLetter = b.title.charAt(0).toUpperCase();
            const tags = (b.tags || []).slice(0, 3);
            const dateStr = formatDate(b.createdAt);

            html += `
                <div class="bookmark-card" style="animation-delay: ${index * 0.05}s">
                    <div class="card-accent" style="background: linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)"></div>
                    <div class="card-body">
                        <div class="card-header">
                            <div class="card-favicon" style="background: ${cfg.bg}; border-color: ${cfg.color}22">
                                ${favicon
                                    ? `<img src="${favicon}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'favicon-fallback\\' style=\\'color:${cfg.color}\\'>${firstLetter}</span>'">`
                                    : `<span class="favicon-fallback" style="color:${cfg.color}">${firstLetter}</span>`
                                }
                            </div>
                            <div class="card-title-group">
                                <div class="card-title">${escapeHtml(b.title)}</div>
                                <div class="card-url"><i class="fas fa-link"></i> ${escapeHtml(domain)}</div>
                            </div>
                        </div>
                        ${b.description ? `<div class="card-description">${escapeHtml(b.description)}</div>` : ''}
                        <div class="card-meta">
                            <span class="card-category" style="background:${cfg.bg}; color:${cfg.color}">
                                ${cfg.icon} ${escapeHtml(b.category)}
                            </span>
                            ${tags.map(t => `<span class="card-tag">${escapeHtml(t)}</span>`).join('')}
                            <span class="card-date">${dateStr}</span>
                        </div>
                        <div class="card-actions">
                            <button class="action-btn open-btn" onclick="window.open('${escapeHtml(b.url)}', '_blank')" title="Open in new tab">
                                <i class="fas fa-external-link-alt"></i> Open
                            </button>
                            <button class="action-btn edit-btn" data-id="${b.id}" title="Edit bookmark">
                                <i class="fas fa-pen"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" data-id="${b.id}" title="Delete bookmark">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <button class="action-btn fav-btn${b.favorite ? ' favorited' : ''}" data-id="${b.id}" title="${b.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                                <i class="fa${b.favorite ? 's' : 'r'} fa-star"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        els.bookmarksGrid.innerHTML = html;

        // Bind card action events
        els.bookmarksGrid.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        els.bookmarksGrid.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
        });
        els.bookmarksGrid.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleFavorite(btn.dataset.id));
        });
    }

    function updateStats() {
        const total = bookmarks.length;
        const favs = bookmarks.filter(b => b.favorite).length;
        const cats = getAllCategories().length;

        els.totalCount.textContent = total;
        els.favCount.textContent = favs;
        els.statTotal.textContent = `${total} bookmark${total !== 1 ? 's' : ''}`;
        els.statCategories.textContent = `${cats} categor${cats !== 1 ? 'ies' : 'y'}`;
        els.statFavorites.textContent = `${favs} favorite${favs !== 1 ? 's' : ''}`;
    }

    function setView(view) {
        currentView = view;
        searchQuery = '';
        els.searchInput.value = '';

        // Update active nav
        $$('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Update page header
        const viewLabels = {
            all: { title: 'All Bookmarks', subtitle: 'Manage and organize your web resources efficiently' },
            favorites: { title: 'Favorites', subtitle: 'Your starred bookmarks for quick access' },
            recent: { title: 'Recently Added', subtitle: 'Bookmarks added in the last 7 days' },
        };

        if (view.startsWith('category:')) {
            const cat = view.replace('category:', '');
            const cfg = getCategoryConfig(cat);
            els.pageTitle.textContent = `${cfg.icon} ${cat}`;
            els.pageSubtitle.textContent = `${getCategoryCount(cat)} bookmarks in this category`;
        } else {
            const label = viewLabels[view] || viewLabels.all;
            els.pageTitle.textContent = label.title;
            els.pageSubtitle.textContent = label.subtitle;
        }

        renderBookmarks();
        closeMobileSidebar();
    }

    function setViewMode(mode) {
        currentViewMode = mode;
        $$('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.viewMode === mode);
        });
        els.bookmarksGrid.classList.toggle('list-view', mode === 'list');
        savePrefs();
    }

    // ========== CRUD OPERATIONS ==========
    function openAddModal() {
        els.bookmarkId.value = '';
        els.bookmarkForm.reset();
        els.modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Bookmark';
        els.submitBtnText.textContent = 'Save Bookmark';
        els.customCategoryGroup.style.display = 'none';
        els.bookmarkModal.classList.add('open');
        els.bookmarkUrl.focus();
    }

    function openEditModal(id) {
        const bm = bookmarks.find(b => b.id === id);
        if (!bm) return;

        els.bookmarkId.value = bm.id;
        els.bookmarkUrl.value = bm.url;
        els.bookmarkTitle.value = bm.title;
        els.bookmarkDescription.value = bm.description || '';
        els.bookmarkTags.value = (bm.tags || []).join(', ');
        els.bookmarkFavorite.checked = bm.favorite;

        // Set category
        const catSelect = els.bookmarkCategory;
        const optionExists = Array.from(catSelect.options).some(o => o.value === bm.category);
        if (optionExists) {
            catSelect.value = bm.category;
            els.customCategoryGroup.style.display = 'none';
        } else {
            catSelect.value = '__custom__';
            els.customCategoryGroup.style.display = 'block';
            els.customCategory.value = bm.category;
        }

        els.modalTitle.innerHTML = '<i class="fas fa-pen"></i> Edit Bookmark';
        els.submitBtnText.textContent = 'Update Bookmark';
        els.bookmarkModal.classList.add('open');
    }

    function closeBookmarkModal() {
        els.bookmarkModal.classList.remove('open');
    }

    function saveBookmarkFromForm(e) {
        e.preventDefault();

        const id = els.bookmarkId.value;
        let url = els.bookmarkUrl.value.trim();
        const title = els.bookmarkTitle.value.trim();
        const description = els.bookmarkDescription.value.trim();
        let category = els.bookmarkCategory.value;
        const tags = els.bookmarkTags.value.split(',').map(t => t.trim()).filter(Boolean);
        const favorite = els.bookmarkFavorite.checked;

        // Validate URL
        if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
        }

        // Custom category
        if (category === '__custom__') {
            category = els.customCategory.value.trim();
            if (!category) {
                showToast('Please enter a custom category name.', 'error');
                return;
            }
        }

        if (id) {
            // Update
            const idx = bookmarks.findIndex(b => b.id === id);
            if (idx !== -1) {
                bookmarks[idx] = { ...bookmarks[idx], url, title, description, category, tags, favorite };
                showToast('Bookmark updated successfully!', 'success');
            }
        } else {
            // Create
            bookmarks.push({
                id: generateId(),
                url, title, description, category, tags, favorite,
                createdAt: new Date().toISOString(),
            });
            showToast('Bookmark added successfully!', 'success');
        }

        saveBookmarks();
        closeBookmarkModal();
        renderAll();
    }

    function openDeleteModal(id) {
        deleteTargetId = id;
        const bm = bookmarks.find(b => b.id === id);
        if (bm) {
            els.deleteBookmarkName.textContent = bm.title;
        }
        els.deleteModal.classList.add('open');
    }

    function closeDeleteModal() {
        els.deleteModal.classList.remove('open');
        deleteTargetId = null;
    }

    function confirmDelete() {
        if (deleteTargetId) {
            bookmarks = bookmarks.filter(b => b.id !== deleteTargetId);
            saveBookmarks();
            showToast('Bookmark deleted.', 'info');
            closeDeleteModal();
            renderAll();
        }
    }

    function toggleFavorite(id) {
        const bm = bookmarks.find(b => b.id === id);
        if (bm) {
            bm.favorite = !bm.favorite;
            saveBookmarks();
            renderAll();
            showToast(bm.favorite ? 'Added to favorites!' : 'Removed from favorites.', 'success');
        }
    }

    // ========== IMPORT / EXPORT ==========
    function exportBookmarks() {
        const data = JSON.stringify(bookmarks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkvault-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Bookmarks exported successfully!', 'success');
    }

    function openImportModal() {
        els.importModal.classList.add('open');
    }

    function closeImportModal() {
        els.importModal.classList.remove('open');
    }

    function handleImport(file) {
        if (!file || !file.name.endsWith('.json')) {
            showToast('Please select a valid JSON file.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported)) throw new Error('Invalid format');
                let count = 0;
                imported.forEach(item => {
                    if (item.url && item.title && item.category) {
                        bookmarks.push({
                            id: generateId(),
                            url: item.url,
                            title: item.title,
                            description: item.description || '',
                            category: item.category,
                            tags: item.tags || [],
                            favorite: item.favorite || false,
                            createdAt: item.createdAt || new Date().toISOString(),
                        });
                        count++;
                    }
                });
                saveBookmarks();
                renderAll();
                closeImportModal();
                showToast(`Successfully imported ${count} bookmark${count !== 1 ? 's' : ''}!`, 'success');
            } catch (err) {
                showToast('Failed to import: invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // ========== TOAST ==========
    function showToast(message, type = 'info') {
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info} toast-icon"></i>
            <span>${escapeHtml(message)}</span>
            <i class="fas fa-times toast-close"></i>
        `;
        els.toastContainer.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
        setTimeout(() => removeToast(toast), 4000);
    }

    function removeToast(toast) {
        if (!toast.parentElement) return;
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }

    // ========== SIDEBAR & MOBILE ==========
    let sidebarBackdrop;

    function initMobileSidebar() {
        sidebarBackdrop = document.createElement('div');
        sidebarBackdrop.className = 'sidebar-backdrop';
        document.body.appendChild(sidebarBackdrop);
        sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    }

    function toggleMobileSidebar() {
        els.sidebar.classList.toggle('open');
        sidebarBackdrop.classList.toggle('visible', els.sidebar.classList.contains('open'));
    }

    function closeMobileSidebar() {
        els.sidebar.classList.remove('open');
        sidebarBackdrop.classList.remove('visible');
    }

    // ========== RENDER ALL ==========
    function renderAll() {
        renderCategoryNav();
        updateStats();
        renderBookmarks();
    }

    // ========== EVENT BINDINGS ==========
    function bindEvents() {
        // Navigation
        $$('.sidebar-nav > .nav-section:first-child .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                setView(item.dataset.view);
            });
        });

        // Mobile sidebar
        els.mobileMenuBtn.addEventListener('click', toggleMobileSidebar);

        // Search
        let searchTimeout;
        els.searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = els.searchInput.value;
                renderBookmarks();
            }, 200);
        });

        // Keyboard shortcut Ctrl+K
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                els.searchInput.focus();
            }
            if (e.key === 'Escape') {
                closeBookmarkModal();
                closeDeleteModal();
                closeImportModal();
            }
        });

        // View mode toggle
        $$('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => setViewMode(btn.dataset.viewMode));
        });

        // Sort
        els.sortBtn.addEventListener('click', e => {
            e.stopPropagation();
            els.sortMenu.classList.toggle('open');
        });
        document.addEventListener('click', () => els.sortMenu.classList.remove('open'));
        $$('.sort-option').forEach(opt => {
            opt.addEventListener('click', e => {
                e.preventDefault();
                currentSort = opt.dataset.sort;
                $$('.sort-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                els.sortMenu.classList.remove('open');
                savePrefs();
                renderBookmarks();
            });
        });

        // Add bookmark
        els.addBookmarkBtn.addEventListener('click', openAddModal);
        els.emptyAddBtn.addEventListener('click', openAddModal);

        // Bookmark modal
        els.modalClose.addEventListener('click', closeBookmarkModal);
        els.modalCancel.addEventListener('click', closeBookmarkModal);
        els.bookmarkForm.addEventListener('submit', saveBookmarkFromForm);

        // Custom category toggle
        els.bookmarkCategory.addEventListener('change', () => {
            const isCustom = els.bookmarkCategory.value === '__custom__';
            els.customCategoryGroup.style.display = isCustom ? 'block' : 'none';
            if (isCustom) els.customCategory.focus();
        });

        // Delete modal
        els.deleteModalClose.addEventListener('click', closeDeleteModal);
        els.deleteCancelBtn.addEventListener('click', closeDeleteModal);
        els.deleteConfirmBtn.addEventListener('click', confirmDelete);

        // Import / Export
        els.exportBtn.addEventListener('click', exportBookmarks);
        els.importBtn.addEventListener('click', openImportModal);
        els.importModalClose.addEventListener('click', closeImportModal);

        els.importFile.addEventListener('change', e => {
            if (e.target.files.length) handleImport(e.target.files[0]);
        });

        // Drag & drop import
        els.importDropzone.addEventListener('dragover', e => {
            e.preventDefault();
            els.importDropzone.classList.add('drag-over');
        });
        els.importDropzone.addEventListener('dragleave', () => {
            els.importDropzone.classList.remove('drag-over');
        });
        els.importDropzone.addEventListener('drop', e => {
            e.preventDefault();
            els.importDropzone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleImport(e.dataTransfer.files[0]);
        });

        // Close modals on backdrop click
        [els.bookmarkModal, els.deleteModal, els.importModal].forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                    deleteTargetId = null;
                }
            });
        });
    }

    // ========== INIT ==========
    function init() {
        loadPrefs();
        loadBookmarks();
        initMobileSidebar();
        bindEvents();
        setViewMode(currentViewMode);

        // Set active sort option
        $$('.sort-option').forEach(o => {
            o.classList.toggle('active', o.dataset.sort === currentSort);
        });

        renderAll();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
