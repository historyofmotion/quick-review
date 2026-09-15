// Quick Review - Client Application Logic

class App {
  constructor() {
    this.sets = [];
    this.activeSetId = null;
    this.selectedRecordId = null;
    this.searchQuery = '';
    this.selectedTag = null;
    this.sortOption = 'entryOrder';
    
    // Full Review state
    this.isFullReviewOpen = false;
    this.fullReviewIndex = 0;

    // Quick Add modal state
    this.modalTags = [];
    this.modalImage = {
      dataUrl: null,
      buffer: null,
      extension: 'png',
      removeExisting: false
    };

    // Cache of loaded image data URLs: { "folderName/fileName": "data:image..." }
    this.imageCache = new Map();

    // Auto-save debounce timer
    this.saveDebounceTimer = null;

    this.initElements();
    this.bindEvents();
    this.init();
  }

  initElements() {
    // Top Bar
    this.selectActiveSet = document.getElementById('select-active-set');
    this.btnSetMenu = document.getElementById('btn-set-menu');
    this.menuSetActions = document.getElementById('menu-set-actions');
    this.menuActionNewSet = document.getElementById('menu-action-new-set');
    this.menuActionRenameSet = document.getElementById('menu-action-rename-set');
    this.menuActionExportSet = document.getElementById('menu-action-export-set');
    this.menuActionRevealFinder = document.getElementById('menu-action-reveal-finder');
    this.menuActionDeleteSet = document.getElementById('menu-action-delete-set');

    this.inputSearch = document.getElementById('input-search');
    this.btnClearSearch = document.getElementById('btn-clear-search');
    this.btnStartFullReview = document.getElementById('btn-start-full-review');
    this.btnGlobalQuickAdd = document.getElementById('btn-global-quick-add');

    // Records List Pane
    this.recordsPaneContainer = document.getElementById('records-pane-container');
    this.selectSort = document.getElementById('select-sort');
    this.recordsCountBadge = document.getElementById('records-count-badge');
    this.tagFilterBar = document.getElementById('tag-filter-bar');
    this.recordsList = document.getElementById('records-list');
    this.recordsEmpty = document.getElementById('records-empty');
    this.btnEmptyAdd = document.getElementById('btn-empty-add');

    // Direct Detail / Inline Editor Pane
    this.detailEmpty = document.getElementById('detail-empty');
    this.detailContent = document.getElementById('detail-content');
    this.detailInputTitle = document.getElementById('detail-input-title');
    this.detailShortId = document.getElementById('detail-short-id');
    this.detailTextareaDesc = document.getElementById('detail-textarea-desc');
    this.btnDetailPasteImage = document.getElementById('btn-detail-paste-image');
    this.btnDetailBrowseImage = document.getElementById('btn-detail-browse-image');
    this.btnDetailRemoveImage = document.getElementById('btn-detail-remove-image');
    this.detailImageDropzone = document.getElementById('detail-image-dropzone');
    this.detailImageEmpty = document.getElementById('detail-image-empty');
    this.detailImageWrapper = document.getElementById('detail-image-wrapper');
    this.detailImagePreview = document.getElementById('detail-image-preview');
    this.detailTagsChips = document.getElementById('detail-tags-chips');
    this.detailInputTag = document.getElementById('detail-input-tag');
    this.detailCreatedAt = document.getElementById('detail-created-at');
    this.detailModifiedAt = document.getElementById('detail-modified-at');
    this.btnDeleteRecord = document.getElementById('btn-delete-record');

    // Quick Add Modal
    this.modalRecord = document.getElementById('modal-record');
    this.modalRecordTitle = document.getElementById('modal-record-title');
    this.formRecord = document.getElementById('form-record');
    this.recordInputTitle = document.getElementById('record-input-title');
    this.recordInputDesc = document.getElementById('record-input-desc');
    this.recordInputTag = document.getElementById('record-input-tag');
    this.recordTagsChips = document.getElementById('record-tags-chips');
    this.btnCloseRecordModal = document.getElementById('btn-close-record-modal');
    this.btnCancelRecord = document.getElementById('btn-cancel-record');
    this.btnSaveAndAddNext = document.getElementById('btn-save-and-add-next');
    this.btnSaveRecord = document.getElementById('btn-save-record');

    // Dropzone in Modal
    this.dropzone = document.getElementById('dropzone');
    this.dropzoneEmpty = document.getElementById('dropzone-empty');
    this.dropzonePreview = document.getElementById('dropzone-preview');
    this.dropzoneImg = document.getElementById('dropzone-img');
    this.btnPasteImage = document.getElementById('btn-paste-image');
    this.btnBrowseImage = document.getElementById('btn-browse-image');
    this.btnRemoveImage = document.getElementById('btn-remove-image');
    this.btnChangeImage = document.getElementById('btn-change-image');

    // Set Modals
    this.modalNewSet = document.getElementById('modal-new-set');
    this.formNewSet = document.getElementById('form-new-set');
    this.inputNewSetName = document.getElementById('input-new-set-name');
    this.btnCancelNewSet = document.getElementById('btn-cancel-new-set');
    this.btnCloseNewSetModal = document.getElementById('btn-close-new-set-modal');

    this.modalRenameSet = document.getElementById('modal-rename-set');
    this.formRenameSet = document.getElementById('form-rename-set');
    this.inputRenameSetName = document.getElementById('input-rename-set-name');
    this.btnCancelRenameSet = document.getElementById('btn-cancel-rename-set');
    this.btnCloseRenameSetModal = document.getElementById('btn-close-rename-set-modal');

    // Full Review Screen
    this.fullReviewScreen = document.getElementById('full-review-screen');
    this.btnExitReview = document.getElementById('btn-exit-review');
    this.btnTopPrev = document.getElementById('btn-top-prev');
    this.btnTopNext = document.getElementById('btn-top-next');
    this.reviewSetName = document.getElementById('review-set-name');
    this.reviewCounter = document.getElementById('review-counter');
    this.btnReviewZoom = document.getElementById('btn-review-zoom');
    this.btnReviewDelete = document.getElementById('btn-review-delete');
    this.reviewProgressBar = document.getElementById('review-progress-bar');
    
    // Live Editable Fields in Full Review
    this.reviewInputTitle = document.getElementById('review-input-title');
    this.reviewShortId = document.getElementById('review-short-id');
    this.reviewTextareaDesc = document.getElementById('review-textarea-desc');
    this.btnReviewPasteImage = document.getElementById('btn-review-paste-image');
    this.btnReviewBrowseImage = document.getElementById('btn-review-browse-image');
    this.btnReviewRemoveImage = document.getElementById('btn-review-remove-image');
    this.reviewImageDropzone = document.getElementById('review-image-dropzone');
    this.reviewImageEmpty = document.getElementById('review-image-empty');
    this.reviewImageWrapper = document.getElementById('review-image-wrapper');
    this.reviewImage = document.getElementById('review-image');
    this.reviewTagsChips = document.getElementById('review-tags-chips');
    this.reviewInputTag = document.getElementById('review-input-tag');
    this.reviewCreatedAt = document.getElementById('review-created-at');
    this.reviewModifiedAt = document.getElementById('review-modified-at');

    // Zoom Lightbox
    this.modalImageZoom = document.getElementById('modal-image-zoom');
    this.zoomedImage = document.getElementById('zoomed-image');
    this.btnCloseZoom = document.getElementById('btn-close-zoom');
  }

  async init() {
    this.sets = await window.api.loadAllSets();
    const settings = await window.api.loadSettings();

    if (settings && settings.sortOption) {
      this.sortOption = settings.sortOption;
      this.selectSort.value = this.sortOption;
    }

    if (settings && settings.lastSelectedSetId && this.sets.some(s => s.id === settings.lastSelectedSetId)) {
      this.activeSetId = settings.lastSelectedSetId;
    } else if (this.sets.length > 0) {
      this.activeSetId = this.sets[0].id;
    }

    const active = this.getActiveSet();
    if (active && active.records.length > 0) {
      this.selectedRecordId = active.records[0].id;
    }

    this.renderAll();
  }

  getActiveSet() {
    return this.sets.find(s => s.id === this.activeSetId) || null;
  }

  getSelectedRecord() {
    const active = this.getActiveSet();
    return active ? active.records.find(r => r.id === this.selectedRecordId) || null : null;
  }

  generateShortId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getFilteredRecords() {
    const active = this.getActiveSet();
    if (!active) return [];

    let records = [...active.records];

    // Tag filter
    if (this.selectedTag) {
      records = records.filter(r => r.tags && r.tags.includes(this.selectedTag));
    }

    // Search query filter (matches title, description, tags, or short ID)
    const query = this.searchQuery.trim().toLowerCase().replace(/^#/, '');
    if (query) {
      records = records.filter(r => {
        const titleMatch = (r.title || '').toLowerCase().includes(query);
        const descMatch = (r.description || '').toLowerCase().includes(query);
        const tagMatch = (r.tags || []).some(t => t.toLowerCase().includes(query));
        const idMatch = (r.shortId || '').toLowerCase().includes(query);
        return titleMatch || descMatch || tagMatch || idMatch;
      });
    }

    // Sort
    switch (this.sortOption) {
      case 'entryOrder':
        return records.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      case 'dateCreatedDesc':
        return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'dateCreatedAsc':
        return records.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'dateModifiedDesc':
        return records.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
      case 'titleAsc':
        return records.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'titleDesc':
        return records.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      default:
        return records;
    }
  }

  getAllTagsInActiveSet() {
    const active = this.getActiveSet();
    if (!active) return [];
    const tagSet = new Set();
    active.records.forEach(r => {
      (r.tags || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }

  // MARK: - Rendering

  renderAll() {
    this.renderSetSwitcher();
    this.renderTagFilterBar();
    this.renderRecordsList();
    this.renderDetailPane();
    if (this.isFullReviewOpen) {
      this.renderFullReview();
    }
  }

  renderSetSwitcher() {
    this.selectActiveSet.innerHTML = '';
    this.sets.forEach(set => {
      const opt = document.createElement('option');
      opt.value = set.id;
      opt.textContent = `📁 ${set.name} (${set.records.length})`;
      if (set.id === this.activeSetId) {
        opt.selected = true;
      }
      this.selectActiveSet.appendChild(opt);
    });
  }

  renderTagFilterBar() {
    const tags = this.getAllTagsInActiveSet();
    if (tags.length === 0) {
      this.tagFilterBar.classList.add('hidden');
      this.tagFilterBar.innerHTML = '';
      return;
    }

    this.tagFilterBar.classList.remove('hidden');
    this.tagFilterBar.innerHTML = '';

    const allPill = document.createElement('div');
    allPill.className = `tag-pill ${this.selectedTag === null ? 'active' : ''}`;
    allPill.textContent = 'All';
    allPill.addEventListener('click', () => {
      this.selectedTag = null;
      this.renderTagFilterBar();
      this.renderRecordsList();
      this.renderDetailPane();
    });
    this.tagFilterBar.appendChild(allPill);

    tags.forEach(tag => {
      const pill = document.createElement('div');
      pill.className = `tag-pill ${this.selectedTag === tag ? 'active' : ''}`;
      pill.textContent = tag;
      pill.addEventListener('click', () => {
        this.selectedTag = this.selectedTag === tag ? null : tag;
        this.renderTagFilterBar();
        this.renderRecordsList();
        this.renderDetailPane();
      });
      this.tagFilterBar.appendChild(pill);
    });
  }

  // Data Dense List: Title Only with Image Icon
  renderRecordsList() {
    const records = this.getFilteredRecords();
    this.recordsList.innerHTML = '';
    this.recordsCountBadge.textContent = `${records.length} ${records.length === 1 ? 'item' : 'items'}`;

    if (records.length === 0) {
      this.recordsEmpty.classList.remove('hidden');
      this.recordsList.classList.add('hidden');
    } else {
      this.recordsEmpty.classList.add('hidden');
      this.recordsList.classList.remove('hidden');

      // If current selection is not in filtered list, select first
      if (!records.some(r => r.id === this.selectedRecordId)) {
        this.selectedRecordId = records[0].id;
      }

      records.forEach((record, index) => {
        const li = document.createElement('li');
        li.className = `record-item ${record.id === this.selectedRecordId ? 'active' : ''}`;
        li.dataset.recordId = record.id;
        li.dataset.index = index;

        const idHtml = record.shortId ? `<span class="record-short-id">#${record.shortId}</span>` : '';
        const hasImageHtml = record.imageFileName ? `<span class="record-has-img" title="Has image attachment">🖼️</span>` : '';

        li.innerHTML = `
          ${idHtml}
          <span class="record-item-title">${this.escapeHtml(record.title || 'Untitled Record')}</span>
          ${hasImageHtml}
        `;

        li.addEventListener('click', () => {
          this.selectRecord(record.id);
        });

        li.addEventListener('dblclick', () => {
          this.startFullReview(record.id);
        });

        this.recordsList.appendChild(li);
      });

      // Scroll active item into view
      const activeEl = this.recordsList.querySelector('.record-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  selectRecord(recordId) {
    if (this.selectedRecordId !== recordId) {
      this.selectedRecordId = recordId;
      this.renderRecordsList();
      this.renderDetailPane();
    }
  }

  // Direct Live Inline Detail & Editor Pane
  async renderDetailPane() {
    const record = this.getSelectedRecord();
    const active = this.getActiveSet();

    if (!record || !active) {
      this.detailEmpty.classList.remove('hidden');
      this.detailContent.classList.add('hidden');
      return;
    }

    this.detailEmpty.classList.add('hidden');
    this.detailContent.classList.remove('hidden');

    // 1. Title Input & Subtle Short ID
    this.detailInputTitle.value = record.title || '';
    if (record.shortId) {
      this.detailShortId.textContent = `#${record.shortId}`;
      this.detailShortId.classList.remove('hidden');
      this.detailShortId.onclick = () => this.copyShortId(record.shortId, this.detailShortId);
    } else {
      this.detailShortId.classList.add('hidden');
    }

    // 2. Description Textarea (Swapped: above image)
    this.detailTextareaDesc.value = record.description || '';

    // 3. Image Section (Compact box if empty)
    if (record.imageFileName) {
      this.detailImageEmpty.classList.add('hidden');
      this.detailImageWrapper.classList.remove('hidden');
      this.btnDetailRemoveImage.classList.remove('hidden');

      const cacheKey = `${active.folderName}/${record.imageFileName}`;
      let dataUrl = this.imageCache.get(cacheKey);

      if (!dataUrl) {
        dataUrl = await window.api.getImageDataUrl(active.folderName, record.imageFileName);
        if (dataUrl) this.imageCache.set(cacheKey, dataUrl);
      }

      if (dataUrl) {
        this.detailImagePreview.src = dataUrl;
        this.detailImageWrapper.onclick = () => this.openImageZoom(dataUrl);
      } else {
        this.detailImageEmpty.classList.remove('hidden');
        this.detailImageWrapper.classList.add('hidden');
        this.btnDetailRemoveImage.classList.add('hidden');
      }
    } else {
      this.detailImageEmpty.classList.remove('hidden');
      this.detailImageWrapper.classList.add('hidden');
      this.btnDetailRemoveImage.classList.add('hidden');
      this.detailImagePreview.src = '';
    }

    // 4. Tags Chips
    this.renderDetailTags(record);

    // 5. Timestamps
    this.detailCreatedAt.textContent = new Date(record.createdAt).toLocaleString();
    this.detailModifiedAt.textContent = new Date(record.modifiedAt).toLocaleString();
  }

  renderDetailTags(record) {
    this.detailTagsChips.innerHTML = '';
    (record.tags || []).forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `
        <span>${this.escapeHtml(tag)}</span>
        <span class="tag-chip-remove" title="Remove tag">✕</span>
      `;
      chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
        record.tags = (record.tags || []).filter(t => t !== tag);
        this.renderDetailTags(record);
        this.triggerAutoSave();
        this.renderTagFilterBar();
      });
      this.detailTagsChips.appendChild(chip);
    });
  }

  // Auto-Save Trigger for live inline edits
  triggerAutoSave() {
    clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(async () => {
      const active = this.getActiveSet();
      const record = this.getSelectedRecord();
      if (!active || !record) return;

      record.modifiedAt = new Date().toISOString();
      active.modifiedAt = new Date().toISOString();
      await window.api.saveSet(active);

      const modifiedFormatted = new Date(record.modifiedAt).toLocaleString();
      this.detailModifiedAt.textContent = modifiedFormatted;
      if (this.isFullReviewOpen) {
        this.reviewModifiedAt.textContent = `Modified: ${modifiedFormatted}`;
      }

      // Update title in records list without full re-render
      const activeItem = this.recordsList.querySelector(`.record-item[data-record-id="${record.id}"] .record-item-title`);
      if (activeItem) {
        activeItem.textContent = record.title || 'Untitled Record';
      }
    }, 250);
  }

  copyShortId(shortId, element) {
    if (!shortId) return;
    navigator.clipboard.writeText(`#${shortId}`).then(() => {
      const originalText = element.textContent;
      element.textContent = 'Copied!';
      setTimeout(() => {
        element.textContent = originalText;
      }, 1200);
    });
  }

  // MARK: - Full Review Screen (With Top Arrows, Live Inline Editing, and Image Adding)

  startFullReview(startingRecordId = null) {
    const records = this.getFilteredRecords();
    if (records.length === 0) return;

    if (startingRecordId) {
      const idx = records.findIndex(r => r.id === startingRecordId);
      this.fullReviewIndex = idx !== -1 ? idx : 0;
    } else {
      const curId = this.selectedRecordId;
      const idx = records.findIndex(r => r.id === curId);
      this.fullReviewIndex = idx !== -1 ? idx : 0;
    }

    this.isFullReviewOpen = true;
    this.fullReviewScreen.classList.remove('hidden');
    this.renderFullReview();
  }

  exitFullReview() {
    this.isFullReviewOpen = false;
    this.fullReviewScreen.classList.add('hidden');
    this.renderRecordsList();
    this.renderDetailPane();
  }

  async renderFullReview() {
    const records = this.getFilteredRecords();
    const active = this.getActiveSet();
    if (!active || records.length === 0 || this.fullReviewIndex >= records.length) {
      this.exitFullReview();
      return;
    }

    const record = records[this.fullReviewIndex];
    this.selectedRecordId = record.id;

    // Header info & top arrows
    this.reviewSetName.textContent = active.name;
    this.reviewCounter.textContent = `Record ${this.fullReviewIndex + 1} of ${records.length}`;
    this.btnTopPrev.disabled = this.fullReviewIndex <= 0;
    this.btnTopNext.textContent = (this.fullReviewIndex === records.length - 1) ? 'Done ✓' : 'Next →';

    // Progress Bar
    const progressPct = ((this.fullReviewIndex + 1) / records.length) * 100;
    this.reviewProgressBar.style.width = `${progressPct}%`;

    // 1. Live Editable Title & Subtle Short ID in Full Review
    this.reviewInputTitle.value = record.title || '';
    if (record.shortId) {
      this.reviewShortId.textContent = `#${record.shortId}`;
      this.reviewShortId.classList.remove('hidden');
      this.reviewShortId.onclick = () => this.copyShortId(record.shortId, this.reviewShortId);
    } else {
      this.reviewShortId.classList.add('hidden');
    }

    // 2. Live Editable Description (Swapped above Image)
    this.reviewTextareaDesc.value = record.description || '';

    // 3. Image in Full View (Where photos are added/pasted/removed)
    if (record.imageFileName) {
      this.reviewImageEmpty.classList.add('hidden');
      this.reviewImageWrapper.classList.remove('hidden');
      this.btnReviewRemoveImage.classList.remove('hidden');
      this.btnReviewZoom.classList.remove('hidden');

      const cacheKey = `${active.folderName}/${record.imageFileName}`;
      let dataUrl = this.imageCache.get(cacheKey);

      if (!dataUrl) {
        dataUrl = await window.api.getImageDataUrl(active.folderName, record.imageFileName);
        if (dataUrl) this.imageCache.set(cacheKey, dataUrl);
      }

      if (dataUrl) {
        this.reviewImage.src = dataUrl;
        this.reviewImageWrapper.onclick = () => this.openImageZoom(dataUrl);
        this.btnReviewZoom.onclick = () => this.openImageZoom(dataUrl);
      } else {
        this.reviewImageEmpty.classList.remove('hidden');
        this.reviewImageWrapper.classList.add('hidden');
        this.btnReviewRemoveImage.classList.add('hidden');
        this.btnReviewZoom.classList.add('hidden');
      }
    } else {
      this.reviewImageEmpty.classList.remove('hidden');
      this.reviewImageWrapper.classList.add('hidden');
      this.btnReviewRemoveImage.classList.add('hidden');
      this.btnReviewZoom.classList.add('hidden');
      this.reviewImage.src = '';
    }

    // 4. Tags in Full Review (Lower)
    this.renderFullReviewTags(record);

    // 5. Timestamps at Bottom of Full Review
    this.reviewCreatedAt.textContent = `Created: ${new Date(record.createdAt).toLocaleString()}`;
    this.reviewModifiedAt.textContent = `Modified: ${new Date(record.modifiedAt).toLocaleString()}`;
  }

  renderFullReviewTags(record) {
    this.reviewTagsChips.innerHTML = '';
    (record.tags || []).forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `
        <span>${this.escapeHtml(tag)}</span>
        <span class="tag-chip-remove" title="Remove tag">✕</span>
      `;
      chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
        record.tags = (record.tags || []).filter(t => t !== tag);
        this.renderFullReviewTags(record);
        this.triggerAutoSave();
        this.renderTagFilterBar();
      });
      this.reviewTagsChips.appendChild(chip);
    });
  }

  nextReviewCard() {
    const records = this.getFilteredRecords();
    if (this.fullReviewIndex < records.length - 1) {
      this.fullReviewIndex += 1;
      this.renderFullReview();
    } else {
      this.exitFullReview();
    }
  }

  prevReviewCard() {
    if (this.fullReviewIndex > 0) {
      this.fullReviewIndex -= 1;
      this.renderFullReview();
    }
  }

  // MARK: - Quick Add Modal

  openQuickAddModal() {
    this.recordInputTitle.value = '';
    this.recordInputDesc.value = '';
    this.modalTags = [];
    this.renderModalTags();

    this.modalImage = {
      dataUrl: null,
      buffer: null,
      extension: 'png',
      removeExisting: false
    };
    this.renderDropzone();

    this.modalRecord.classList.remove('hidden');
    setTimeout(() => this.recordInputTitle.focus(), 50);

    // Auto-check if clipboard has an image
    this.checkClipboardForImageOnOpen();
  }

  async checkClipboardForImageOnOpen() {
    const clip = await window.api.readClipboardImage();
    if (clip && clip.dataUrl && !this.modalImage.dataUrl) {
      this.modalImage = {
        dataUrl: clip.dataUrl,
        buffer: clip.buffer,
        extension: clip.extension || 'png',
        removeExisting: false
      };
      this.renderDropzone();
    }
  }

  closeRecordModal() {
    this.modalRecord.classList.add('hidden');
  }

  renderModalTags() {
    this.recordTagsChips.innerHTML = '';
    this.modalTags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `
        <span>${this.escapeHtml(tag)}</span>
        <span class="tag-chip-remove" title="Remove tag">✕</span>
      `;
      chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
        this.modalTags = this.modalTags.filter(t => t !== tag);
        this.renderModalTags();
      });
      this.recordTagsChips.appendChild(chip);
    });
  }

  renderDropzone() {
    if (this.modalImage.dataUrl && !this.modalImage.removeExisting) {
      this.dropzoneEmpty.classList.add('hidden');
      this.dropzonePreview.classList.remove('hidden');
      this.dropzoneImg.src = this.modalImage.dataUrl;
    } else {
      this.dropzoneEmpty.classList.remove('hidden');
      this.dropzonePreview.classList.add('hidden');
      this.dropzoneImg.src = '';
    }
  }

  async saveRecordFromModal(addAnother = false) {
    const title = this.recordInputTitle.value.trim();
    if (!title) {
      this.recordInputTitle.focus();
      return;
    }

    const active = this.getActiveSet();
    if (!active) return;

    const now = new Date().toISOString();

    let imageFileName = null;
    if (this.modalImage.buffer) {
      imageFileName = await window.api.saveImage(
        active.folderName,
        this.modalImage.buffer,
        this.modalImage.extension
      );
    }

    const maxSort = active.records.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), -1);
    const shortId = await window.api.generateShortId(now);
    const newRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shortId: shortId,
      title: title,
      description: this.recordInputDesc.value,
      tags: [...this.modalTags],
      imageFileName: imageFileName,
      createdAt: now,
      modifiedAt: now,
      sortOrder: maxSort + 1
    };

    active.records.push(newRecord);
    this.selectedRecordId = newRecord.id;

    active.modifiedAt = now;
    await window.api.saveSet(active);

    if (addAnother) {
      this.recordInputTitle.value = '';
      this.recordInputDesc.value = '';
      this.modalTags = [];
      this.renderModalTags();
      this.modalImage = { dataUrl: null, buffer: null, extension: 'png', removeExisting: false };
      this.renderDropzone();
      this.recordInputTitle.focus();
      this.renderAll();
    } else {
      this.closeRecordModal();
      this.renderAll();
    }
  }

  async deleteSelectedRecord() {
    const active = this.getActiveSet();
    const record = this.getSelectedRecord();
    if (!active || !record) return;

    if (confirm(`Are you sure you want to delete "${record.title || 'this record'}"?`)) {
      if (record.imageFileName) {
        await window.api.deleteImage(active.folderName, record.imageFileName);
      }

      active.records = active.records.filter(r => r.id !== record.id);
      active.modifiedAt = new Date().toISOString();
      await window.api.saveSet(active);

      this.selectedRecordId = active.records.length > 0 ? active.records[0].id : null;
      if (this.isFullReviewOpen) {
        if (active.records.length === 0) {
          this.exitFullReview();
        } else {
          this.fullReviewIndex = Math.min(this.fullReviewIndex, active.records.length - 1);
          this.renderFullReview();
        }
      }
      this.renderAll();
    }
  }

  // Live Image handling in Detail View & Full Review
  async handlePasteImage(isReviewMode = false) {
    const active = this.getActiveSet();
    const record = this.getSelectedRecord();
    if (!active || !record) return;

    const clip = await window.api.readClipboardImage();
    if (clip && clip.dataUrl) {
      if (record.imageFileName) {
        await window.api.deleteImage(active.folderName, record.imageFileName);
      }
      const savedFileName = await window.api.saveImage(
        active.folderName,
        clip.buffer,
        clip.extension || 'png'
      );
      record.imageFileName = savedFileName;
      this.imageCache.set(`${active.folderName}/${savedFileName}`, clip.dataUrl);
      this.triggerAutoSave();
      this.renderDetailPane();
      this.renderRecordsList();
      if (isReviewMode || this.isFullReviewOpen) {
        this.renderFullReview();
      }
    } else {
      alert('No image found on clipboard. Copy a screenshot or image first!');
    }
  }

  async handleBrowseImage(isReviewMode = false) {
    const active = this.getActiveSet();
    const record = this.getSelectedRecord();
    if (!active || !record) return;

    const result = await window.api.openImageFileDialog();
    if (result && result.dataUrl) {
      if (record.imageFileName) {
        await window.api.deleteImage(active.folderName, record.imageFileName);
      }
      const savedFileName = await window.api.saveImage(
        active.folderName,
        result.buffer,
        result.extension || 'png'
      );
      record.imageFileName = savedFileName;
      this.imageCache.set(`${active.folderName}/${savedFileName}`, result.dataUrl);
      this.triggerAutoSave();
      this.renderDetailPane();
      this.renderRecordsList();
      if (isReviewMode || this.isFullReviewOpen) {
        this.renderFullReview();
      }
    }
  }

  async handleRemoveImage(isReviewMode = false) {
    const active = this.getActiveSet();
    const record = this.getSelectedRecord();
    if (!active || !record || !record.imageFileName) return;

    await window.api.deleteImage(active.folderName, record.imageFileName);
    record.imageFileName = null;
    this.triggerAutoSave();
    this.renderDetailPane();
    this.renderRecordsList();
    if (isReviewMode || this.isFullReviewOpen) {
      this.renderFullReview();
    }
  }

  // MARK: - Set Management

  openNewSetModal() {
    this.inputNewSetName.value = '';
    this.modalNewSet.classList.remove('hidden');
    this.menuSetActions.classList.add('hidden');
    setTimeout(() => this.inputNewSetName.focus(), 50);
  }

  closeNewSetModal() {
    this.modalNewSet.classList.add('hidden');
  }

  async createNewSet() {
    const name = this.inputNewSetName.value.trim();
    if (!name) return;

    const now = new Date().toISOString();
    const folderName = name.replace(/[\\/:*?"<>|]/g, '_').trim() || `Set_${Date.now()}`;
    const newSet = {
      id: `set-${Date.now()}`,
      name: name,
      folderName: folderName,
      createdAt: now,
      modifiedAt: now,
      records: []
    };

    await window.api.saveSet(newSet);
    this.sets.push(newSet);
    this.activeSetId = newSet.id;
    this.selectedRecordId = null;
    this.closeNewSetModal();
    this.saveSettings();
    this.renderAll();
  }

  openRenameSetModal() {
    const active = this.getActiveSet();
    if (!active) return;
    this.inputRenameSetName.value = active.name;
    this.modalRenameSet.classList.remove('hidden');
    this.menuSetActions.classList.add('hidden');
    setTimeout(() => this.inputRenameSetName.focus(), 50);
  }

  closeRenameSetModal() {
    this.modalRenameSet.classList.add('hidden');
  }

  async renameSet() {
    const newName = this.inputRenameSetName.value.trim();
    const active = this.getActiveSet();
    if (!newName || !active) return;

    const updated = await window.api.renameSet(active, newName);
    const idx = this.sets.findIndex(s => s.id === active.id);
    if (idx !== -1) {
      this.sets[idx] = updated;
    }

    this.closeRenameSetModal();
    this.renderAll();
  }

  async deleteActiveSet() {
    const active = this.getActiveSet();
    if (!active) return;
    this.menuSetActions.classList.add('hidden');

    if (this.sets.length <= 1) {
      alert('You must have at least one review set.');
      return;
    }

    if (confirm(`Delete "${active.name}" and all its ${active.records.length} records permanently?`)) {
      await window.api.deleteSet(active);
      this.sets = this.sets.filter(s => s.id !== active.id);
      this.activeSetId = this.sets[0].id;
      this.selectedRecordId = this.sets[0].records.length > 0 ? this.sets[0].records[0].id : null;
      this.saveSettings();
      this.renderAll();
    }
  }

  async exportActiveSet() {
    const active = this.getActiveSet();
    if (!active) return;
    this.menuSetActions.classList.add('hidden');
    const result = await window.api.exportSetDialog(active);
    if (result && result.success) {
      alert(`Exported "${active.name}" successfully to:\n${result.path}`);
    }
  }

  openImageZoom(dataUrl) {
    this.zoomedImage.src = dataUrl;
    this.modalImageZoom.classList.remove('hidden');
  }

  closeImageZoom() {
    this.modalImageZoom.classList.add('hidden');
  }

  saveSettings() {
    window.api.saveSettings({
      lastSelectedSetId: this.activeSetId,
      sortOption: this.sortOption
    });
  }

  // MARK: - Event Binding

  bindEvents() {
    // Set switcher dropdown change
    this.selectActiveSet.addEventListener('change', (e) => {
      this.activeSetId = e.target.value;
      this.selectedTag = null;
      this.searchQuery = '';
      this.inputSearch.value = '';
      const active = this.getActiveSet();
      this.selectedRecordId = active && active.records.length > 0 ? active.records[0].id : null;
      this.saveSettings();
      this.renderAll();
    });

    // Set menu button toggle
    this.btnSetMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      this.menuSetActions.classList.toggle('hidden');
    });

    window.addEventListener('click', () => {
      this.menuSetActions.classList.add('hidden');
    });

    this.menuActionNewSet.addEventListener('click', () => this.openNewSetModal());
    this.menuActionRenameSet.addEventListener('click', () => this.openRenameSetModal());
    this.menuActionExportSet.addEventListener('click', () => this.exportActiveSet());
    this.menuActionRevealFinder.addEventListener('click', () => {
      const active = this.getActiveSet();
      if (active) window.api.revealSetInFinder(active.folderName);
    });
    this.menuActionDeleteSet.addEventListener('click', () => this.deleteActiveSet());

    // Native macOS Menu Triggers
    window.api.onMenuTrigger((action) => {
      switch (action) {
        case 'new-record':
          this.openQuickAddModal();
          break;
        case 'new-set':
          this.openNewSetModal();
          break;
        case 'export-set':
          this.exportActiveSet();
          break;
        case 'reveal-finder':
          const active = this.getActiveSet();
          if (active) window.api.revealSetInFinder(active.folderName);
          else window.api.revealRootInFinder();
          break;
        case 'full-review':
          this.startFullReview();
          break;
        case 'edit-record':
          if (this.isFullReviewOpen) {
            this.reviewInputTitle.focus();
          } else {
            this.detailInputTitle.focus();
          }
          break;
        case 'delete-record':
          this.deleteSelectedRecord();
          break;
        case 'find-record':
          this.inputSearch.focus();
          break;
      }
    });

    // Top action buttons
    this.btnGlobalQuickAdd.addEventListener('click', () => this.openQuickAddModal());
    this.btnStartFullReview.addEventListener('click', () => this.startFullReview());
    this.btnEmptyAdd.addEventListener('click', () => this.openQuickAddModal());

    // Live Inline Detail Inputs
    this.detailInputTitle.addEventListener('input', (e) => {
      const record = this.getSelectedRecord();
      if (record) {
        record.title = e.target.value;
        this.triggerAutoSave();
      }
    });

    this.detailTextareaDesc.addEventListener('input', (e) => {
      const record = this.getSelectedRecord();
      if (record) {
        record.description = e.target.value;
        this.triggerAutoSave();
      }
    });

    this.detailInputTag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = this.detailInputTag.value.trim().replace(',', '');
        const record = this.getSelectedRecord();
        if (tag && record) {
          record.tags = record.tags || [];
          if (!record.tags.includes(tag)) {
            record.tags.push(tag);
            this.renderDetailTags(record);
            this.triggerAutoSave();
            this.renderTagFilterBar();
          }
          this.detailInputTag.value = '';
        }
      }
    });

    this.btnDetailPasteImage.addEventListener('click', () => this.handlePasteImage(false));
    this.btnDetailBrowseImage.addEventListener('click', () => this.handleBrowseImage(false));
    this.btnDetailRemoveImage.addEventListener('click', () => this.handleRemoveImage(false));
    this.btnDeleteRecord.addEventListener('click', () => this.deleteSelectedRecord());

    // Live Inline Full Review Inputs & Controls
    this.btnTopPrev.addEventListener('click', () => this.prevReviewCard());
    this.btnTopNext.addEventListener('click', () => this.nextReviewCard());
    this.btnExitReview.addEventListener('click', () => this.exitFullReview());
    this.btnReviewDelete.addEventListener('click', () => this.deleteSelectedRecord());

    this.reviewInputTitle.addEventListener('input', (e) => {
      const record = this.getSelectedRecord();
      if (record) {
        record.title = e.target.value;
        this.triggerAutoSave();
      }
    });

    this.reviewTextareaDesc.addEventListener('input', (e) => {
      const record = this.getSelectedRecord();
      if (record) {
        record.description = e.target.value;
        this.triggerAutoSave();
      }
    });

    this.reviewInputTag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = this.reviewInputTag.value.trim().replace(',', '');
        const record = this.getSelectedRecord();
        if (tag && record) {
          record.tags = record.tags || [];
          if (!record.tags.includes(tag)) {
            record.tags.push(tag);
            this.renderFullReviewTags(record);
            this.triggerAutoSave();
            this.renderTagFilterBar();
          }
          this.reviewInputTag.value = '';
        }
      }
    });

    this.btnReviewPasteImage.addEventListener('click', () => this.handlePasteImage(true));
    this.btnReviewBrowseImage.addEventListener('click', () => this.handleBrowseImage(true));
    this.btnReviewRemoveImage.addEventListener('click', () => this.handleRemoveImage(true));

    // Drag & Drop for Detail & Full Review image dropzones
    [this.detailImageDropzone, this.reviewImageDropzone].forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-active');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-active');
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-active');
        const active = this.getActiveSet();
        const record = this.getSelectedRecord();
        if (!active || !record) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const fileReader = new FileReader();
            fileReader.onload = async () => {
              const bufferArray = Array.from(new Uint8Array(fileReader.result));
              const ext = file.name.split('.').pop() || 'png';
              if (record.imageFileName) {
                await window.api.deleteImage(active.folderName, record.imageFileName);
              }
              const savedFileName = await window.api.saveImage(active.folderName, bufferArray, ext);
              record.imageFileName = savedFileName;
              this.imageCache.delete(`${active.folderName}/${savedFileName}`);
              this.triggerAutoSave();
              this.renderDetailPane();
              this.renderRecordsList();
              if (this.isFullReviewOpen) {
                this.renderFullReview();
              }
            };
            fileReader.readAsArrayBuffer(file);
          }
        }
      });
    });

    // Search and Sort
    this.inputSearch.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      if (this.searchQuery) {
        this.btnClearSearch.classList.remove('hidden');
      } else {
        this.btnClearSearch.classList.add('hidden');
      }
      this.renderRecordsList();
      this.renderDetailPane();
    });

    this.btnClearSearch.addEventListener('click', () => {
      this.inputSearch.value = '';
      this.searchQuery = '';
      this.btnClearSearch.classList.add('hidden');
      this.renderRecordsList();
      this.renderDetailPane();
    });

    this.selectSort.addEventListener('change', (e) => {
      this.sortOption = e.target.value;
      this.saveSettings();
      this.renderRecordsList();
    });

    // Quick Add Modal Events
    this.btnCloseRecordModal.addEventListener('click', () => this.closeRecordModal());
    this.btnCancelRecord.addEventListener('click', () => this.closeRecordModal());

    this.recordInputTag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = this.recordInputTag.value.trim().replace(',', '');
        if (tag && !this.modalTags.includes(tag)) {
          this.modalTags.push(tag);
          this.renderModalTags();
        }
        this.recordInputTag.value = '';
      }
    });

    this.formRecord.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRecordFromModal(false);
    });

    this.btnSaveAndAddNext.addEventListener('click', () => {
      this.saveRecordFromModal(true);
    });

    this.btnPasteImage.addEventListener('click', () => this.handleModalPasteImageAction());
    this.btnBrowseImage.addEventListener('click', () => this.handleModalBrowseImageAction());
    this.btnChangeImage.addEventListener('click', () => this.handleModalBrowseImageAction());
    this.btnRemoveImage.addEventListener('click', () => {
      this.modalImage.dataUrl = null;
      this.modalImage.buffer = null;
      this.modalImage.removeExisting = true;
      this.renderDropzone();
    });

    // Set Modals
    this.btnCloseNewSetModal.addEventListener('click', () => this.closeNewSetModal());
    this.btnCancelNewSet.addEventListener('click', () => this.closeNewSetModal());
    this.formNewSet.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createNewSet();
    });

    this.btnCloseRenameSetModal.addEventListener('click', () => this.closeRenameSetModal());
    this.btnCancelRenameSet.addEventListener('click', () => this.closeRenameSetModal());
    this.formRenameSet.addEventListener('submit', (e) => {
      e.preventDefault();
      this.renameSet();
    });

    // Lightbox
    this.btnCloseZoom.addEventListener('click', () => this.closeImageZoom());
    this.modalImageZoom.addEventListener('click', (e) => {
      if (e.target === this.modalImageZoom) this.closeImageZoom();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      this.handleGlobalKeydown(e);
    });

    // Global Paste Listener
    window.addEventListener('paste', async (e) => {
      if (!this.modalRecord.classList.contains('hidden')) {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          this.handleModalPasteImageAction();
        }
      } else if (this.isFullReviewOpen) {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          this.handlePasteImage(true);
        }
      } else if (this.modalNewSet.classList.contains('hidden')) {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          this.handlePasteImage(false);
        }
      }
    });
  }

  async handleModalPasteImageAction() {
    const clip = await window.api.readClipboardImage();
    if (clip && clip.dataUrl) {
      this.modalImage = {
        dataUrl: clip.dataUrl,
        buffer: clip.buffer,
        extension: clip.extension || 'png',
        removeExisting: false
      };
      this.renderDropzone();
    } else {
      alert('No image found on clipboard. Copy a screenshot or image first!');
    }
  }

  async handleModalBrowseImageAction() {
    const result = await window.api.openImageFileDialog();
    if (result && result.dataUrl) {
      this.modalImage = {
        dataUrl: result.dataUrl,
        buffer: result.buffer,
        extension: result.extension,
        removeExisting: false
      };
      this.renderDropzone();
    }
  }

  // Keyboard navigation & shortcuts
  handleGlobalKeydown(e) {
    const isCmd = e.metaKey || e.ctrlKey;
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    // 1. Lightbox Zoom: Esc or Space or Z to close
    if (!this.modalImageZoom.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === ' ' || e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.closeImageZoom();
        return;
      }
    }

    // 2. Full Review Mode Navigation
    if (this.isFullReviewOpen) {
      if (!isTyping) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key.toLowerCase() === 'j') {
          e.preventDefault();
          this.nextReviewCard();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.prevReviewCard();
          return;
        }
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          const records = this.getFilteredRecords();
          if (this.fullReviewIndex < records.length && records[this.fullReviewIndex].imageFileName) {
            const active = this.getActiveSet();
            const cacheKey = `${active.folderName}/${records[this.fullReviewIndex].imageFileName}`;
            const url = this.imageCache.get(cacheKey);
            if (url) this.openImageZoom(url);
          }
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        this.exitFullReview();
        return;
      }
    }

    // 3. Quick Add Modal Shortcuts
    if (!this.modalRecord.classList.contains('hidden')) {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        this.saveRecordFromModal(true);
        return;
      }
      if (isCmd && e.key === 'Enter') {
        e.preventDefault();
        this.saveRecordFromModal(false);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeRecordModal();
        return;
      }
    }

    // 4. Set Modals Escape
    if (e.key === 'Escape') {
      if (!this.modalNewSet.classList.contains('hidden')) {
        this.closeNewSetModal();
        return;
      }
      if (!this.modalRenameSet.classList.contains('hidden')) {
        this.closeRenameSetModal();
        return;
      }
    }

    // 5. Main View Shortcuts (when not inside inputs)
    if (!isTyping) {
      const records = this.getFilteredRecords();
      const curIndex = records.findIndex(r => r.id === this.selectedRecordId);

      // Navigate List with Up / Down Arrow
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (records.length > 0) {
          const nextIdx = curIndex < records.length - 1 ? curIndex + 1 : 0;
          this.selectRecord(records[nextIdx].id);
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (records.length > 0) {
          const prevIdx = curIndex > 0 ? curIndex - 1 : records.length - 1;
          this.selectRecord(records[prevIdx].id);
        }
        return;
      }

      // Zoom Picture in listing view (Space or Z)
      if (e.key === ' ' || e.key.toLowerCase() === 'z') {
        const record = this.getSelectedRecord();
        const active = this.getActiveSet();
        if (record && record.imageFileName && active) {
          e.preventDefault();
          const cacheKey = `${active.folderName}/${record.imageFileName}`;
          const dataUrl = this.imageCache.get(cacheKey) || this.detailImagePreview.src;
          if (dataUrl) this.openImageZoom(dataUrl);
        }
        return;
      }

      // Enter or Cmd+E to jump directly into editing title
      if (e.key === 'Enter' || (isCmd && e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        this.detailInputTitle.focus();
        this.detailInputTitle.select();
        return;
      }

      // Delete key in list
      if (isCmd && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        this.deleteSelectedRecord();
        return;
      }
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
