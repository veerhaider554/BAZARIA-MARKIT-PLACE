/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   upload.js — CLEANED BUILD V3 (STEP 0–4 + STEP 5 HOOK)
   ------------------------------------------------------------
   Architecture:
   01. Configuration
   02. DOM Helpers
   03. DOM References
   04. Application State
   05. Utilities (Haptic / Toast / Formatting)
   06. Step Navigation + Progress
   07. Step 0 Product Type
   08. Step 1 Basic Information
   09. Step 2 Pricing + SKU
   10. Step 3 Image Engine
   11. Step 4 Details Engine
   12. Step 5 Navigation Hook
   13. Reset + Initialization
   14. Public API
   ------------------------------------------------------------
   Step 5 business/data validation is intentionally NOT implemented
   here yet. Its HTML structure is ready and the back button works.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================
     01. CONFIGURATION
     ========================================================== */

  const CONFIG = {
    totalSteps: 7,

    maxImages: 10,
    maxImageSize: 5 * 1024 * 1024,

    maxDescriptionLength: 120,
    maxLongDescriptionLength: 2000,
    maxSpecifications: 15,
    maxTags: 10,
    maxTagLength: 30,

        /* Step 6 — More Options Limits */
maxVariants: 3,
maxVariantValues: 20,
maxVariantValueLength: 50,
maxWarrantyLength: 100,
maxReturnPolicyLength: 100,
    
    animationTime: 220,
    toastDuration: 2200,

    allowedImageTypes: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  };

  /* ==========================================================
     02. DOM HELPERS
     ========================================================== */

  const $ = (selector, parent = document) => parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  /* ==========================================================
     03. DOM REFERENCES
     ========================================================== */

  const steps = $$('.upload-step');

  /* Step 0 */
  const goBackBtn0 = $('#goBackBtn0');
  const singleProductBtn = $('#btnSingleProduct');
  const bulkUploadBtn = $('#btnBulkUpload');

  /* Shared back buttons */
  const goBackBtn1 = $('#goBackBtn1');
  const goBackBtn2 = $('#goBackBtn2');
  const goBackBtn3 = $('#goBackBtn3');
  const goBackBtn4 = $('#goBackBtn4');
  const goBackBtn5 = $('#goBackBtn5');
  

  /* Step 1 */
  const step1Form = $('#step1Form');
  const productNameInput = $('#productName');
  const productBrandInput = $('#productBrand');
  const productCategoryInput = $('#productCategory');
  const productSubCategoryInput = $('#productSubCategory');
  const shortDescInput = $('#shortDescription');
  const descCharCount = $('#descCharCount');

  /* Condition */
  const conditionButtons = $$('#conditionGroup .segment-btn');
  const hiddenConditionInput = $('#productCondition');

  /* Step 2 */
  const step2Form = $('#step2Form');
  const costPriceInput = $('#costPrice');
  const sellingPriceInput = $('#sellingPrice');
  const discountPriceInput = $('#discountPrice');
  const stockQtyInput = $('#stockQty');
  const skuInput = $('#skuInput');
  const btnGenerateSKU = $('#btnGenerateSKU');
  const profitPreview = $('#profitPreview');
  const calcProfitText = $('#calcProfit');

  /* Step 3 */
  const step3Form = $('#step3Form');
  const imageDropzone = $('#imageDropzone');
  const imageInput = $('#imageInput');
  const imagePreviewGrid = $('#imagePreviewGrid');

  /* Step 4 */
  const step4Form = $('#step4Form');
  const richEditor = $('#richEditor');
  const longDescCount = $('#longDescCount');
  const specsContainer = $('#specsContainer');
  const btnAddSpec = $('#btnAddSpec');
  const tagsList = $('#tagsList');
  const tagInput = $('#tagInput');

  /* Step 5 hook only */
  const step5Form = $('#step5Form');
  
    /* ==========================================================
   Step 6 — More Options
   ----------------------------------------------------------
   DOM references for the NEW Step 6 HTML setup.
   ========================================================== */

const goBackBtn6 = $('#goBackBtn6');
const step6Form = $('#step6Form');

/* ----------------------------------------------------------
   06.01 VARIANTS
   ---------------------------------------------------------- */

const variantsContainer = $('#variantsContainer');
const btnAddVariant = $('#btnAddVariant');

/* ----------------------------------------------------------
   06.02 WARRANTY
   ---------------------------------------------------------- */

const productWarrantyInput = $('#productWarranty');

/* ----------------------------------------------------------
   06.03 RETURN POLICY
   ---------------------------------------------------------- */

const returnPolicyInput = $('#returnPolicy');

/* ----------------------------------------------------------
   06.04 MINIMUM ORDER QUANTITY
   ---------------------------------------------------------- */

const minOrderQtyInput = $('#minOrderQty');

/* ----------------------------------------------------------
   06.05 CASH ON DELIVERY
   ---------------------------------------------------------- */

const codToggleInput = $('#codToggle');
  /* ==========================================================
     04. APPLICATION STATE
     ========================================================== */

  const uploadState = {
    currentStep: 0,
    images: [],
    currentPreviewIndex: 0,
    tags: [],
        variants: [],
    product: {
      condition: 'new',
      specifications: []
    }
  };

  /* Preview URLs are cached per File object to avoid repeatedly
     reading the same image file on every gallery render. */
  const imagePreviewUrls = new Map();

  /* ==========================================================
     05. UTILITIES
     ========================================================== */

  function triggerHaptic(pattern = 10) {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  }

  function showToast(message, type = 'info') {
    let toast = $('.upload-toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'upload-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add('show');

    clearTimeout(window.__bazariaToastTimer);
    window.__bazariaToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, CONFIG.toastDuration);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getCleanText(value = '') {
    return value.replace(/\s+/g, ' ').trim();
  }

  /* ==========================================================
     06. STEP NAVIGATION + PROGRESS
     ========================================================== */

  function getStep(stepNumber) {
    return $(`.upload-step[data-step="${stepNumber}"]`);
  }

  function updateProgress(stepNumber) {
    /* Step 0 has no visible progress UI. Keep form progress at 1
       while Step 0 is active so hidden steps remain in a sane state. */
    const effectiveStep = clamp(Number(stepNumber) || 1, 1, CONFIG.totalSteps);

    $$('.step-progress-wrapper').forEach(wrapper => {
      const counter = $('.step-text-counter', wrapper);
      if (counter) {
        counter.textContent = `STEP ${effectiveStep} OF ${CONFIG.totalSteps}`;
      }

      $$('.step-node', wrapper).forEach(node => {
        const nodeNumber = Number(node.dataset.progressStep);

        node.classList.remove('active', 'completed');

        if (nodeNumber < effectiveStep) {
          node.classList.add('completed');
        } else if (nodeNumber === effectiveStep) {
          node.classList.add('active');
        }
      });

      const fill = $('.progress-line-fill', wrapper);
      if (fill) {
        const percentage = ((effectiveStep - 1) / (CONFIG.totalSteps - 1)) * 100;
        fill.style.width = `${percentage}%`;
      }
    });
  }

  function goToStep(targetStep, direction = 'forward') {
    const target = Number(targetStep);

    if (!Number.isInteger(target) || target < 0 || target > CONFIG.totalSteps) {
      showToast('Invalid upload step.', 'error');
      return;
    }

    const currentStep = getStep(uploadState.currentStep);
    const nextStep = getStep(target);

    if (!nextStep) {
      showToast('This step is not available yet.', 'info');
      return;
    }

    if (currentStep === nextStep) return;

    const exitClass = direction === 'forward' ? 'step-exit-left' : 'step-exit-right';
    const enterClass = direction === 'forward' ? 'step-enter-right' : 'step-enter-left';

    if (currentStep) {
      currentStep.classList.remove(
        'step-enter-left',
        'step-enter-right',
        'step-exit-left',
        'step-exit-right'
      );

      currentStep.classList.add(exitClass);

      setTimeout(() => {
        currentStep.classList.remove('is-active', exitClass);
      }, CONFIG.animationTime);
    }

    nextStep.classList.remove(
      'step-enter-left',
      'step-enter-right',
      'step-exit-left',
      'step-exit-right'
    );
    nextStep.classList.add('is-active', enterClass);

    setTimeout(() => {
      nextStep.classList.remove(enterClass);
    }, 260);

    uploadState.currentStep = target;
    updateProgress(target);

    const main = $('.upload-main', nextStep);
    if (main) main.scrollTop = 0;
  }

  function bindBackButton(button, targetStep) {
    if (!button) return;

    button.addEventListener('click', () => {
      triggerHaptic(10);
      goToStep(targetStep, 'backward');
    });
  }

  /* Step navigation bindings */
  if (goBackBtn0) {
    goBackBtn0.addEventListener('click', () => {
      triggerHaptic(10);
      window.history.back();
    });
  }

  bindBackButton(goBackBtn1, 0);
  bindBackButton(goBackBtn2, 1);
  bindBackButton(goBackBtn3, 2);
  bindBackButton(goBackBtn4, 3);
  bindBackButton(goBackBtn5, 4);
  bindBackButton(goBackBtn6, 5);

  /* ==========================================================
     07. STEP 0 — PRODUCT TYPE
     ========================================================== */

  if (singleProductBtn) {
    singleProductBtn.addEventListener('click', () => {
      triggerHaptic(15);
      goToStep(1, 'forward');
    });
  }

  if (bulkUploadBtn) {
    bulkUploadBtn.addEventListener('click', () => {
      triggerHaptic([20, 50, 20]);
      showToast('Bulk Upload is coming soon.', 'info');
    });
  }

  /* ==========================================================
     08. STEP 1 — BASIC INFORMATION
     ========================================================== */

  conditionButtons.forEach(button => {
    button.addEventListener('click', () => {
      conditionButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const value = button.dataset.value || 'new';
      uploadState.product.condition = value;

      if (hiddenConditionInput) {
        hiddenConditionInput.value = value;
      }

      triggerHaptic(10);
    });
  });

  function updateDescriptionCounter() {
    if (!shortDescInput || !descCharCount) return;

    descCharCount.textContent = String(shortDescInput.value.length);
  }

  if (shortDescInput) {
    shortDescInput.addEventListener('input', updateDescriptionCounter);
    updateDescriptionCounter();
  }

  if (step1Form) {
    step1Form.addEventListener('submit', event => {
      event.preventDefault();

      if (!step1Form.checkValidity()) {
        step1Form.reportValidity();
        return;
      }

      uploadState.product = {
        ...uploadState.product,
        name: getCleanText(productNameInput?.value || ''),
        brand: productBrandInput?.value || '',
        category: productCategoryInput?.value || '',
        subCategory: productSubCategoryInput?.value || '',
        condition: hiddenConditionInput?.value || 'new',
        shortDescription: getCleanText(shortDescInput?.value || '')
      };

      triggerHaptic(15);
      goToStep(2, 'forward');
    });
  }

  /* ==========================================================
     09. STEP 2 — PRICING + SKU
     ========================================================== */

  function calculateProfit() {
    if (!profitPreview || !calcProfitText) return;

    const cost = Number(costPriceInput?.value) || 0;
    const selling = Number(sellingPriceInput?.value) || 0;
    const discount = Number(discountPriceInput?.value) || 0;

    if (cost <= 0 || selling <= 0) {
      profitPreview.style.display = 'none';
      return;
    }

    const effectiveSellingPrice = discount > 0 && discount < selling
      ? discount
      : selling;

    const profit = effectiveSellingPrice - cost;

    calcProfitText.textContent = `PKR ${profit.toLocaleString()}`;
    calcProfitText.style.color = profit >= 0 ? '#4ade80' : '#f87171';
    profitPreview.style.display = 'flex';
  }

  [costPriceInput, sellingPriceInput, discountPriceInput].forEach(input => {
    if (input) input.addEventListener('input', calculateProfit);
  });

  function generateSKU() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(10 + Math.random() * 90);
    return `BZ-${timestamp}-${random}`;
  }

  if (btnGenerateSKU) {
    btnGenerateSKU.addEventListener('click', () => {
      if (!skuInput) return;

      skuInput.value = generateSKU();
      triggerHaptic(10);
    });
  }

  if (step2Form) {
    step2Form.addEventListener('submit', event => {
      event.preventDefault();

      if (!step2Form.checkValidity()) {
        step2Form.reportValidity();
        return;
      }

      const cost = Number(costPriceInput?.value) || 0;
      const selling = Number(sellingPriceInput?.value) || 0;
      const discount = Number(discountPriceInput?.value) || 0;
      const stock = Number(stockQtyInput?.value) || 0;

      if (cost <= 0 || selling <= 0) {
        showToast('Please enter valid prices.', 'error');
        return;
      }

      if (discount > 0 && discount >= selling) {
        showToast('Discount price must be lower than selling price.', 'error');
        return;
      }

      if (stock <= 0) {
        showToast('Please enter available stock.', 'error');
        return;
      }

      uploadState.product = {
        ...uploadState.product,
        costPrice: cost,
        sellingPrice: selling,
        discountPrice: discount > 0 ? discount : null,
        stockQuantity: stock,
        sku: getCleanText(skuInput?.value || '') || null,
        profit: (discount > 0 ? discount : selling) - cost
      };

      triggerHaptic(15);
      goToStep(3, 'forward');
    });
  }

  /* ==========================================================
     10. STEP 3 — IMAGE ENGINE
     ========================================================== */

  function getImagePreviewUrl(file) {
    if (!file) return '';

    if (!imagePreviewUrls.has(file)) {
      imagePreviewUrls.set(file, URL.createObjectURL(file));
    }

    return imagePreviewUrls.get(file);
  }

  function revokeImagePreviewUrl(file) {
    const url = imagePreviewUrls.get(file);
    if (!url) return;

    URL.revokeObjectURL(url);
    imagePreviewUrls.delete(file);
  }

  function validateImage(file) {
    if (!CONFIG.allowedImageTypes.includes(file.type)) {
      showToast(`${file.name} is not a supported image format.`, 'error');
      return false;
    }

    if (file.size > CONFIG.maxImageSize) {
      showToast(`${file.name} exceeds the 5MB limit.`, 'error');
      return false;
    }

    return true;
  }

  function addImageFiles(files) {
    const incomingFiles = Array.from(files || []);
    if (!incomingFiles.length) return;

    const remaining = CONFIG.maxImages - uploadState.images.length;

    if (remaining <= 0) {
      showToast('Maximum 10 images allowed.', 'warning');
      return;
    }

    if (incomingFiles.length > remaining) {
      showToast(`Only ${remaining} more image${remaining === 1 ? '' : 's'} can be added.`, 'warning');
    }

    const acceptedFiles = incomingFiles
      .slice(0, remaining)
      .filter(validateImage);

    acceptedFiles.forEach(file => {
      const duplicate = uploadState.images.some(existing => (
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
      ));

      if (!duplicate) {
        uploadState.images.push(file);
      }
    });

    renderImageGallery();
  }

  if (imageDropzone && imageInput) {
    imageDropzone.addEventListener('click', event => {
      if (event.target === imageInput) return;
      imageInput.click();
    });

    imageDropzone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        imageInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      imageDropzone.addEventListener(eventName, event => {
        event.preventDefault();
        imageDropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      imageDropzone.addEventListener(eventName, event => {
        event.preventDefault();
        imageDropzone.classList.remove('is-dragover');
      });
    });

    imageDropzone.addEventListener('drop', event => {
      event.preventDefault();
      imageDropzone.classList.remove('is-dragover');
      addImageFiles(event.dataTransfer?.files || []);
    });
  }

  if (imageInput) {
    imageInput.addEventListener('change', event => {
      addImageFiles(event.target.files || []);
      imageInput.value = '';
    });
  }

  function renderImageGallery() {
    if (!imagePreviewGrid || !imageDropzone) return;

    imagePreviewGrid.innerHTML = '';

    let mainPreviewContainer = $('#mainCoverPreviewBox');

    if (!mainPreviewContainer) {
      mainPreviewContainer = document.createElement('div');
      mainPreviewContainer.id = 'mainCoverPreviewBox';
      mainPreviewContainer.className = 'main-cover-preview';

      imageDropzone.parentNode.insertBefore(mainPreviewContainer, imageDropzone);
    }

    if (!uploadState.images.length) {
      imageDropzone.style.display = 'flex';
      mainPreviewContainer.style.display = 'none';
      mainPreviewContainer.innerHTML = '';
      updateImageStatus();
      return;
    }

    imageDropzone.style.display = 'none';
    mainPreviewContainer.style.display = 'block';

    if (uploadState.currentPreviewIndex >= uploadState.images.length) {
      uploadState.currentPreviewIndex = 0;
    }

    const currentFile = uploadState.images[uploadState.currentPreviewIndex];
    const isCover = uploadState.currentPreviewIndex === 0;
    const previewUrl = getImagePreviewUrl(currentFile);

    mainPreviewContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.className = 'main-preview-card';

    const badge = document.createElement('span');
    badge.className = `cover-badge${isCover ? '' : ' is-preview'}`;
    badge.textContent = isCover ? 'MAIN COVER' : 'PREVIEW';

    const image = document.createElement('img');
    image.src = previewUrl;
    image.alt = `${isCover ? 'Main cover' : 'Image preview'} — ${currentFile.name}`;

    const info = document.createElement('div');
    info.className = 'main-preview-info';

    const name = document.createElement('span');
    name.textContent = currentFile.name;

    const size = document.createElement('small');
    size.textContent = formatBytes(currentFile.size);

    info.append(name, size);
    mainCard.append(badge, image, info);
    mainPreviewContainer.appendChild(mainCard);

    uploadState.images.forEach((file, index) => {
      const card = document.createElement('div');
      card.className = 'preview-card';
      card.dataset.index = String(index);

      if (index === uploadState.currentPreviewIndex) {
        card.classList.add('is-selected');
      }

      card.addEventListener('click', () => {
        uploadState.currentPreviewIndex = index;
        renderImageGallery();
        triggerHaptic(10);
      });

      const thumbnail = document.createElement('img');
      thumbnail.src = getImagePreviewUrl(file);
      thumbnail.alt = `Thumbnail ${index + 1}`;

      card.appendChild(thumbnail);

      if (index === 0) {
        const coverBadge = document.createElement('span');
        coverBadge.className = 'cover-badge';
        coverBadge.textContent = 'COVER';
        card.appendChild(coverBadge);
      }

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-btn';
      removeButton.setAttribute('aria-label', `Remove image ${index + 1}`);
      removeButton.textContent = '×';

      removeButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        removeImage(index);
      });

      card.appendChild(removeButton);
      imagePreviewGrid.appendChild(card);
    });

    if (uploadState.images.length < CONFIG.maxImages) {
      const addMoreBtn = document.createElement('button');
      addMoreBtn.type = 'button';
      addMoreBtn.className = 'add-more-card';
      addMoreBtn.setAttribute('aria-label', 'Add more product images');
      addMoreBtn.textContent = '+';

      addMoreBtn.addEventListener('click', () => imageInput?.click());
      imagePreviewGrid.appendChild(addMoreBtn);
    }

    updateImageStatus();
  }

  function removeImage(index) {
    if (index < 0 || index >= uploadState.images.length) return;

    const removedFile = uploadState.images[index];
    uploadState.images.splice(index, 1);
    revokeImagePreviewUrl(removedFile);

    if (!uploadState.images.length) {
      uploadState.currentPreviewIndex = 0;
    } else if (uploadState.currentPreviewIndex === index) {
      uploadState.currentPreviewIndex = Math.min(index, uploadState.images.length - 1);
    } else if (uploadState.currentPreviewIndex > index) {
      uploadState.currentPreviewIndex -= 1;
    }

    renderImageGallery();
    triggerHaptic(10);
  }

  function updateImageStatus() {
    if (!imageDropzone) return;

    const count = uploadState.images.length;
    const hint = $('.dropzone-hint', imageDropzone);

    if (hint) {
      hint.textContent = `${count}/${CONFIG.maxImages} images selected · JPG, PNG or WEBP · Up to 5MB each`;
    }
  }

  if (step3Form) {
    step3Form.addEventListener('submit', event => {
      event.preventDefault();

      if (uploadState.images.length === 0) {
        showToast('Please upload at least one product image.', 'error');
        return;
      }

      uploadState.product.images = [...uploadState.images];

      triggerHaptic(15);
      goToStep(4, 'forward');
    });
  }

  /* ==========================================================
     11. STEP 4 — PRODUCT DETAILS ENGINE
     ========================================================== */

  const toolBtns = $$('.tool-btn');

  toolBtns.forEach(button => {
    button.addEventListener('mousedown', event => {
      event.preventDefault();

      const command = button.dataset.command;
      if (!command) return;

      document.execCommand(command, false, null);
      triggerHaptic(8);
    });
  });

  function updateEditorCharCount() {
    if (!richEditor || !longDescCount) return;

    const text = richEditor.textContent || '';
    const length = text.length;

    longDescCount.textContent = String(length);
    longDescCount.style.color = length > CONFIG.maxLongDescriptionLength
      ? '#ef4444'
      : '#64748b';
  }

  if (richEditor) {
    richEditor.addEventListener('input', updateEditorCharCount);

    richEditor.addEventListener('paste', event => {
      event.preventDefault();

      const plainText = (event.clipboardData || window.clipboardData)
        .getData('text/plain');

      document.execCommand('insertText', false, plainText);
      updateEditorCharCount();
    });

    updateEditorCharCount();
  }

  function createSpecRow(key = '', value = '') {
    const row = document.createElement('div');
    row.className = 'spec-row';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'spec-key-input';
    keyInput.placeholder = 'Title (e.g. RAM)';
    keyInput.value = key;
    keyInput.autocomplete = 'off';
    keyInput.required = true;
    keyInput.setAttribute('aria-label', 'Specification title');

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'spec-val-input';
    valueInput.placeholder = 'Value (e.g. 8GB)';
    valueInput.value = value;
    valueInput.autocomplete = 'off';
    valueInput.required = true;
    valueInput.setAttribute('aria-label', 'Specification value');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn-remove-spec';
    removeButton.setAttribute('aria-label', 'Remove specification');

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2.5');

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '18');
    line1.setAttribute('y1', '6');
    line1.setAttribute('x2', '6');
    line1.setAttribute('y2', '18');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '6');
    line2.setAttribute('y1', '6');
    line2.setAttribute('x2', '18');
    line2.setAttribute('y2', '18');

    icon.append(line1, line2);
    removeButton.appendChild(icon);

    removeButton.addEventListener('click', () => {
      row.remove();
      triggerHaptic(10);
    });

    row.append(keyInput, valueInput, removeButton);
    return row;
  }

  if (btnAddSpec && specsContainer) {
    btnAddSpec.addEventListener('click', () => {
      const count = $$('.spec-row', specsContainer).length;

      if (count >= CONFIG.maxSpecifications) {
        showToast(`Maximum ${CONFIG.maxSpecifications} specifications allowed.`, 'warning');
        return;
      }

      specsContainer.appendChild(createSpecRow());
      triggerHaptic(10);
    });
  }

  function getSpecificationsData() {
    if (!specsContainer) return [];

    return $$('.spec-row', specsContainer)
      .map(row => ({
        key: getCleanText($('.spec-key-input', row)?.value || ''),
        value: getCleanText($('.spec-val-input', row)?.value || '')
      }));
  }

  function validateSpecifications() {
    const rows = getSpecificationsData();
    const hasIncompleteRow = rows.some(spec => !spec.key || !spec.value);

    if (hasIncompleteRow) {
      showToast('Please complete or remove all specification rows.', 'error');
      return null;
    }

    return rows;
  }

  function renderTags() {
    if (!tagsList) return;

    tagsList.innerHTML = '';

    uploadState.tags.forEach((tag, index) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';

      const text = document.createElement('span');
      text.textContent = `#${tag}`;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'tag-remove';
      removeButton.setAttribute('aria-label', `Remove tag ${tag}`);
      removeButton.textContent = '×';

      removeButton.addEventListener('click', () => {
        uploadState.tags.splice(index, 1);
        renderTags();
        triggerHaptic(8);
      });

      chip.append(text, removeButton);
      tagsList.appendChild(chip);
    });
  }

  function addTag(tag) {
    const cleanTag = getCleanText(tag)
      .replace(/^#+/, '')
      .toLowerCase()
      .slice(0, CONFIG.maxTagLength);

    if (!cleanTag) return false;

    if (uploadState.tags.includes(cleanTag)) {
      showToast(`Tag "${cleanTag}" is already added.`, 'warning');
      return false;
    }

    if (uploadState.tags.length >= CONFIG.maxTags) {
      showToast(`Maximum ${CONFIG.maxTags} tags allowed.`, 'warning');
      return false;
    }

    uploadState.tags.push(cleanTag);
    return true;
  }

  function processTagInput() {
    if (!tagInput) return;

    const rawValue = tagInput.value.trim();
    if (!rawValue) return;

    const parts = rawValue
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    let addedAny = false;

    for (const part of parts) {
      if (uploadState.tags.length >= CONFIG.maxTags) break;
      addedAny = addTag(part) || addedAny;
    }

    if (addedAny) {
      renderTags();
      triggerHaptic(10);
    }

    tagInput.value = '';
  }

  if (tagInput) {
    tagInput.addEventListener('keydown', event => {
      if (event.key === ',' || event.key === 'Enter') {
        event.preventDefault();
        processTagInput();
      }
    });

    tagInput.addEventListener('blur', processTagInput);
  }

  if (step4Form) {
    step4Form.addEventListener('submit', event => {
      event.preventDefault();

      processTagInput();

      const htmlContent = richEditor?.innerHTML.trim() || '';
      const textContent = getCleanText(richEditor?.textContent || '');

      if (!textContent) {
        showToast('Please write a product description.', 'error');
        return;
      }

      if (textContent.length > CONFIG.maxLongDescriptionLength) {
        showToast(`Description must be under ${CONFIG.maxLongDescriptionLength} characters.`, 'error');
        return;
      }

      const specifications = validateSpecifications();
      if (specifications === null) return;

      uploadState.product = {
        ...uploadState.product,
        description: htmlContent,
        specifications,
        tags: [...uploadState.tags]
      };

      triggerHaptic(15);
      console.log('BAZARIA CURRENT PRODUCT STATE:', uploadState.product);
      goToStep(5, 'forward');
    });
  }

      /* ==========================================================
     12. STEP 5 — SHIPPING INFORMATION ENGINE
     ----------------------------------------------------------
     Features:
     - Weight validation
     - Dimensions validation
     - Shipping type validation
     - Processing time validation
     - Shipping data state integration
     - Step 5 submission handling
     - Step 5 → Step 6 navigation
     ========================================================== */


  /* ==========================================================
     12.01 SHIPPING DOM REFERENCES
     ========================================================== */

  const productWeightInput = $('#productWeight');
  const dimLengthInput = $('#dimLength');
  const dimWidthInput = $('#dimWidth');
  const dimHeightInput = $('#dimHeight');
  const shippingTypeInput = $('#shippingType');
  const processingTimeInput = $('#processingTime');


  /* ==========================================================
     12.02 WEIGHT VALIDATION
     ========================================================== */

  function validateProductWeight() {
    if (!productWeightInput) {
      return {
        valid: false,
        message: 'Product weight field is unavailable.'
      };
    }

    const weight = Number(productWeightInput.value);

    if (!Number.isFinite(weight) || weight <= 0) {
      return {
        valid: false,
        message: 'Please enter a valid product weight.'
      };
    }

    return {
      valid: true,
      value: weight
    };
  }


  /* ==========================================================
     12.03 DIMENSIONS VALIDATION
     ----------------------------------------------------------
     Dimensions are optional.

     Rule:
     - All empty = allowed
     - If one is entered, all three must be entered
     - All values must be greater than 0
     ========================================================== */

  function validateProductDimensions() {
    if (
      !dimLengthInput ||
      !dimWidthInput ||
      !dimHeightInput
    ) {
      return {
        valid: false,
        message: 'Product dimensions fields are unavailable.'
      };
    }

    const rawLength = dimLengthInput.value.trim();
    const rawWidth = dimWidthInput.value.trim();
    const rawHeight = dimHeightInput.value.trim();

    const allEmpty =
      !rawLength &&
      !rawWidth &&
      !rawHeight;

    if (allEmpty) {
      return {
        valid: true,
        value: {
          length: null,
          width: null,
          height: null
        }
      };
    }

    const length = Number(rawLength);
    const width = Number(rawWidth);
    const height = Number(rawHeight);

    if (
      !rawLength ||
      !rawWidth ||
      !rawHeight
    ) {
      return {
        valid: false,
        message: 'Please enter Length, Width and Height together.'
      };
    }

    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      length <= 0 ||
      width <= 0 ||
      height <= 0
    ) {
      return {
        valid: false,
        message: 'Dimensions must be greater than 0.'
      };
    }

    return {
      valid: true,
      value: {
        length,
        width,
        height
      }
    };
  }


  /* ==========================================================
     12.04 SHIPPING TYPE VALIDATION
     ========================================================== */

  function validateShippingType() {
    if (!shippingTypeInput) {
      return {
        valid: false,
        message: 'Shipping type field is unavailable.'
      };
    }

    const shippingType = shippingTypeInput.value;

    if (!shippingType) {
      return {
        valid: false,
        message: 'Please select a shipping type.'
      };
    }

    return {
      valid: true,
      value: shippingType
    };
  }


  /* ==========================================================
     12.05 PROCESSING TIME VALIDATION
     ========================================================== */

  function validateProcessingTime() {
    if (!processingTimeInput) {
      return {
        valid: false,
        message: 'Processing time field is unavailable.'
      };
    }

    const processingTime = processingTimeInput.value;

    if (!processingTime) {
      return {
        valid: false,
        message: 'Please select processing time.'
      };
    }

    return {
      valid: true,
      value: processingTime
    };
  }


  /* ==========================================================
     12.06 BUILD SHIPPING DATA
     ========================================================== */

  function buildShippingData() {
    const weightResult = validateProductWeight();

    if (!weightResult.valid) {
      showToast(weightResult.message, 'error');
      productWeightInput?.focus();
      return null;
    }


    const dimensionsResult = validateProductDimensions();

    if (!dimensionsResult.valid) {
      showToast(dimensionsResult.message, 'error');

      if (
        dimLengthInput &&
        !dimLengthInput.value.trim()
      ) {
        dimLengthInput.focus();
      } else if (
        dimWidthInput &&
        !dimWidthInput.value.trim()
      ) {
        dimWidthInput.focus();
      } else {
        dimHeightInput?.focus();
      }

      return null;
    }


    const shippingTypeResult =
      validateShippingType();

    if (!shippingTypeResult.valid) {
      showToast(shippingTypeResult.message, 'error');
      shippingTypeInput?.focus();
      return null;
    }


    const processingTimeResult =
      validateProcessingTime();

    if (!processingTimeResult.valid) {
      showToast(processingTimeResult.message, 'error');
      processingTimeInput?.focus();
      return null;
    }


    return {
      weight: weightResult.value,

      dimensions: dimensionsResult.value,

      shippingType: shippingTypeResult.value,

      processingTime: processingTimeResult.value
    };
  }


  /* ==========================================================
     12.07 SAVE SHIPPING DATA TO PRODUCT STATE
     ========================================================== */

  function saveShippingData(shippingData) {
    if (!shippingData) return;

    uploadState.product = {
      ...uploadState.product,

      shipping: {
        ...shippingData
      }
    };
  }


  /* ==========================================================
     12.08 STEP 5 FORM SUBMISSION
     ----------------------------------------------------------
     IMPORTANT:
     This prevents the browser from reloading the page.
     ========================================================== */

  if (step5Form) {
    step5Form.addEventListener('submit', event => {
      event.preventDefault();


      /* ------------------------------------------------------
         1. Browser validation
         ------------------------------------------------------ */

      if (!step5Form.checkValidity()) {
        step5Form.reportValidity();
        return;
      }


      /* ------------------------------------------------------
         2. Build + validate shipping data
         ------------------------------------------------------ */

      const shippingData = buildShippingData();

      if (!shippingData) {
        return;
      }


      /* ------------------------------------------------------
         3. Save shipping data
         ------------------------------------------------------ */

      saveShippingData(shippingData);


      /* ------------------------------------------------------
         4. Development debug
         ------------------------------------------------------ */

      console.log(
        'BAZARIA STEP 5 SHIPPING DATA:',
        uploadState.product.shipping
      );

      console.log(
        'BAZARIA CURRENT PRODUCT STATE:',
        uploadState.product
      );


      /* ------------------------------------------------------
         5. Success feedback
         ------------------------------------------------------ */

      triggerHaptic(15);


      /* ------------------------------------------------------
         6. Move to Step 6
         ------------------------------------------------------ */

      goToStep(6, 'forward');
    });
  }
    
  
  /* ==========================================================
   12.5. STEP 6 — MORE OPTIONS ENGINE
   ----------------------------------------------------------
   NEW HTML CONTRACT:
   - Product Variants
   - Warranty text
   - Return Policy text
   - Minimum Order Quantity
   - Cash on Delivery
   - Step 6 validation
   - Product state integration
   ----------------------------------------------------------
   Variant structure:
   Option Name → multiple values

   Example:
   Color → Black, White, Blue
   Size  → S, M, L
   ========================================================== */


/* ==========================================================
   12.5.01 VARIANT ID
   ========================================================== */

function createVariantId() {
  return `variant_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


/* ==========================================================
   12.5.02 CREATE VARIANT OPTION
   ========================================================== */

function createVariantOption(
  variant = {
    id: createVariantId(),
    name: '',
    values: []
  }
) {
  if (!variantsContainer) return null;

  const card = document.createElement('div');

  card.className = 'variant-card';
  card.dataset.variantId = variant.id;

  /* --------------------------------------------------------
     Variant Info Area
     -------------------------------------------------------- */

  const info = document.createElement('div');

  info.className = 'variant-info';

  const title = document.createElement('div');

  title.className = 'variant-title';

  title.textContent = variant.name || 'New Variant';

  const details = document.createElement('div');

  details.className = 'variant-details';

  details.textContent = variant.values.length
    ? variant.values.join(', ')
    : 'No values added';

  info.append(title, details);

  /* --------------------------------------------------------
     Edit / Remove Button
     -------------------------------------------------------- */

  const removeButton = document.createElement('button');

  removeButton.type = 'button';
  removeButton.className = 'btn-remove-variant';
  removeButton.setAttribute(
    'aria-label',
    'Remove variant'
  );
  removeButton.textContent = '×';

  removeButton.addEventListener('click', () => {
    const index = uploadState.variants.findIndex(
      item => item.id === variant.id
    );

    if (index !== -1) {
      uploadState.variants.splice(index, 1);
    }

    syncVariantState();

    card.remove();

    triggerHaptic(10);
  });

  card.append(info, removeButton);

  return card;
}


/* ==========================================================
   12.5.03 SYNC VARIANTS
   ========================================================== */

function syncVariantState() {
  uploadState.product.variants =
    uploadState.variants.map(variant => ({
      id: variant.id,
      name: getCleanText(variant.name || ''),
      values: [...(variant.values || [])]
    }));
}


/* ==========================================================
   12.5.04 ADD VARIANT
   ----------------------------------------------------------
   NOTE:
   The current HTML only provides an "Add Variant" button and
   a container. Therefore the JS will create the input UI
   dynamically when the seller adds a variant.
   ========================================================== */

if (btnAddVariant && variantsContainer) {
  btnAddVariant.addEventListener('click', () => {

    if (
      uploadState.variants.length >=
      CONFIG.maxVariants
    ) {
      showToast(
        `Maximum ${CONFIG.maxVariants} variant options allowed.`,
        'warning'
      );
      return;
    }

    const variant = {
      id: createVariantId(),
      name: '',
      values: []
    };

    uploadState.variants.push(variant);

    /* ------------------------------------------------------
       Dynamic Variant Editor
       ------------------------------------------------------ */

    const editor = document.createElement('div');

    editor.className = 'variant-option-card';

    editor.dataset.variantId = variant.id;

    const nameInput = document.createElement('input');

    nameInput.type = 'text';
    nameInput.className = 'form-input variant-name-input';
    nameInput.placeholder = 'Variant name (e.g. Color)';
    nameInput.maxLength = 50;
    nameInput.autocomplete = 'off';

    const valuesInput = document.createElement('input');

    valuesInput.type = 'text';
    valuesInput.className = 'form-input variant-value-input';
    valuesInput.placeholder = 'Values separated by comma';
    valuesInput.maxLength =
      CONFIG.maxVariantValueLength;
    valuesInput.autocomplete = 'off';

    const saveButton = document.createElement('button');

    saveButton.type = 'button';
    saveButton.className = 'btn-add-text';
    saveButton.textContent = 'Save Variant';

    const cancelButton = document.createElement('button');

    cancelButton.type = 'button';
    cancelButton.className = 'btn-remove-variant';
    cancelButton.textContent = '×';
    cancelButton.setAttribute(
      'aria-label',
      'Cancel variant'
    );

    const actions = document.createElement('div');

    actions.className = 'variant-actions';

    actions.append(saveButton, cancelButton);

    editor.append(
      nameInput,
      valuesInput,
      actions
    );

    variantsContainer.appendChild(editor);

    /* ------------------------------------------------------
       Save Variant
       ------------------------------------------------------ */

    saveButton.addEventListener('click', () => {
      const name = getCleanText(nameInput.value);

      const values = valuesInput.value
        .split(',')
        .map(value => getCleanText(value))
        .filter(Boolean);
        
        if (name.length > 50) {
  showToast(
    'Variant name cannot exceed 50 characters.',
    'error'
  );

  nameInput.focus();
  return;
}

      if (!name) {
        showToast(
          'Please enter a variant name.',
          'error'
        );
        nameInput.focus();
        return;
      }

      if (!values.length) {
        showToast(
          'Please add at least one variant value.',
          'error'
        );
        valuesInput.focus();
        return;
      }
      
      const invalidValue = values.find(
  value =>
    value.length >
    CONFIG.maxVariantValueLength
);

if (invalidValue) {
  showToast(
    `Each variant value cannot exceed ${CONFIG.maxVariantValueLength} characters.`,
    'error'
  );

  valuesInput.focus();
  return;
}

      if (
        values.length >
        CONFIG.maxVariantValues
      ) {
        showToast(
          `Maximum ${CONFIG.maxVariantValues} values allowed for one variant.`,
          'warning'
        );
        return;
      }

      const normalizedValues =
        values.map(value => value.toLowerCase());

      if (
        new Set(normalizedValues).size !==
        normalizedValues.length
      ) {
        showToast(
          'Variant values must be unique.',
          'error'
        );
        return;
      }

      const duplicateName =
        uploadState.variants.some(item =>
          item.id !== variant.id &&
          getCleanText(item.name).toLowerCase() ===
            name.toLowerCase()
        );

      if (duplicateName) {
        showToast(
          'Variant option names must be unique.',
          'error'
        );
        nameInput.focus();
        return;
      }
      /* ------------------------------------------------------
   Save Variant Name
   ------------------------------------------------------ */

variant.name = name;

variant.values = values.map(value =>
  getCleanText(value)
);

      variant.values = values.map(value =>
  getCleanText(value)
);

      syncVariantState();

      const finalCard =
        createVariantOption(variant);

      editor.replaceWith(finalCard);

      triggerHaptic(10);
    });

    /* ------------------------------------------------------
       Cancel Variant
       ------------------------------------------------------ */

    cancelButton.addEventListener('click', () => {
      const index =
        uploadState.variants.findIndex(
          item => item.id === variant.id
        );

      if (index !== -1) {
        uploadState.variants.splice(index, 1);
      }

      editor.remove();

      triggerHaptic(8);
    });

    nameInput.focus();

    triggerHaptic(10);
  });
}


/* ==========================================================
   12.5.05 VALIDATE VARIANTS
   ========================================================== */

function validateVariants() {
  if (!uploadState.variants.length) {
    return {
      valid: true,
      value: []
    };
  }

  const cleanedVariants = uploadState.variants.map(variant => ({
    id: variant.id,
    name: getCleanText(variant.name || ''),
    values: (variant.values || [])
      .map(value => getCleanText(value))
      .filter(Boolean)
  }));

  /* --------------------------------------------------------
     1. Check incomplete variants
     -------------------------------------------------------- */

  const invalidVariant = cleanedVariants.find(
    variant =>
      !variant.name ||
      variant.values.length === 0
  );

  if (invalidVariant) {
    showToast(
      'Please complete every variant before continuing.',
      'error'
    );

    return {
      valid: false
    };
  }

  /* --------------------------------------------------------
     2. Check variant name length
     -------------------------------------------------------- */

  const invalidName = cleanedVariants.find(
    variant => variant.name.length > 50
  );

  if (invalidName) {
    showToast(
      'Variant name cannot exceed 50 characters.',
      'error'
    );

    return {
      valid: false
    };
  }

  /* --------------------------------------------------------
     3. Check maximum values
     -------------------------------------------------------- */

  const tooManyValues = cleanedVariants.find(
    variant =>
      variant.values.length >
      CONFIG.maxVariantValues
  );

  if (tooManyValues) {
    showToast(
      `Maximum ${CONFIG.maxVariantValues} values allowed for one variant.`,
      'error'
    );

    return {
      valid: false
    };
  }

  /* --------------------------------------------------------
     4. Check individual value length
     -------------------------------------------------------- */

  const invalidValue = cleanedVariants.find(
    variant =>
      variant.values.some(
        value =>
          value.length >
          CONFIG.maxVariantValueLength
      )
  );

  if (invalidValue) {
    showToast(
      `Variant values cannot exceed ${CONFIG.maxVariantValueLength} characters.`,
      'error'
    );

    return {
      valid: false
    };
  }

  /* --------------------------------------------------------
     5. Check duplicate variant names
     -------------------------------------------------------- */

  const names = cleanedVariants.map(
    variant =>
      variant.name.toLowerCase()
  );

  if (new Set(names).size !== names.length) {
    showToast(
      'Variant option names must be unique.',
      'error'
    );

    return {
      valid: false
    };
  }

  /* --------------------------------------------------------
     6. Check duplicate values inside each variant
     -------------------------------------------------------- */

  for (const variant of cleanedVariants) {
    const normalizedValues =
      variant.values.map(
        value => value.toLowerCase()
      );

    if (
      new Set(normalizedValues).size !==
      normalizedValues.length
    ) {
      showToast(
        `Values in "${variant.name}" must be unique.`,
        'error'
      );

      return {
        valid: false
      };
    }
  }

  /* --------------------------------------------------------
     7. Final clean result
     -------------------------------------------------------- */

  return {
    valid: true,
    value: cleanedVariants
  };
}


/* ==========================================================
   12.5.06 VALIDATE WARRANTY
   ========================================================== */

function validateWarranty() {
  const warranty =
    getCleanText(
      productWarrantyInput?.value || ''
    );

  if (
    warranty.length >
    CONFIG.maxWarrantyLength
  ) {
    showToast(
      `Warranty cannot exceed ${CONFIG.maxWarrantyLength} characters.`,
      'error'
    );

    productWarrantyInput?.focus();

    return {
      valid: false
    };
  }

  return {
    valid: true,
    value: warranty || null
  };
}


/* ==========================================================
   12.5.07 VALIDATE RETURN POLICY
   ========================================================== */

function validateReturnPolicy() {
  const returnPolicy =
    getCleanText(
      returnPolicyInput?.value || ''
    );

  if (
    returnPolicy.length >
    CONFIG.maxReturnPolicyLength
  ) {
    showToast(
      `Return policy cannot exceed ${CONFIG.maxReturnPolicyLength} characters.`,
      'error'
    );

    returnPolicyInput?.focus();

    return {
      valid: false
    };
  }

  return {
    valid: true,
    value: returnPolicy || null
  };
}


/* ==========================================================
   12.5.08 VALIDATE MINIMUM ORDER QUANTITY
   ========================================================== */

function validateMinimumOrderQuantity() {
  if (!minOrderQtyInput) {
    return {
      valid: false,
      message:
        'Minimum order quantity field is unavailable.'
    };
  }

  const quantity =
    Number(minOrderQtyInput.value);

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return {
      valid: false,
      message:
        'Minimum order quantity must be at least 1.'
    };
  }

  const availableStock =
    Number(uploadState.product.stockQuantity) || 0;

  if (
    availableStock > 0 &&
    quantity > availableStock
  ) {
    return {
      valid: false,
      message:
        'Minimum order quantity cannot exceed available stock.'
    };
  }

  return {
    valid: true,
    value: quantity
  };
}


/* ==========================================================
   12.5.09 STEP 6 FORM SUBMISSION
   ========================================================== */

if (step6Form) {
  step6Form.addEventListener('submit', event => {
    event.preventDefault();

    /* ------------------------------------------------------
       1. Browser validation
       ------------------------------------------------------ */

    if (!step6Form.checkValidity()) {
      step6Form.reportValidity();
      return;
    }

    
    /* ------------------------------------------------------
       2. Validate Variants
       ------------------------------------------------------ */

    const variantsResult =
      validateVariants();

    if (!variantsResult.valid) {
      return;
    }

    /* ------------------------------------------------------
       3. Validate Warranty
       ------------------------------------------------------ */

    const warrantyResult =
      validateWarranty();

    if (!warrantyResult.valid) {
      return;
    }

    /* ------------------------------------------------------
       4. Validate Return Policy
       ------------------------------------------------------ */

    const returnPolicyResult =
      validateReturnPolicy();

    if (!returnPolicyResult.valid) {
      return;
    }

    /* ------------------------------------------------------
       5. Validate Minimum Order
       ------------------------------------------------------ */

    const minimumOrderResult =
      validateMinimumOrderQuantity();

    if (!minimumOrderResult.valid) {
      showToast(
        minimumOrderResult.message,
        'error'
      );

      minOrderQtyInput?.focus();

      return;
    }

    /* ------------------------------------------------------
       6. Read COD
       ------------------------------------------------------ */

    const allowCOD =
      Boolean(codToggleInput?.checked);

    /* ------------------------------------------------------
       7. Save Step 6 State
       ------------------------------------------------------ */

    uploadState.variants =
      [...variantsResult.value];

    uploadState.product = {
      ...uploadState.product,

      variants:
        [...variantsResult.value],

      warranty:
        warrantyResult.value,

      returnPolicy:
        returnPolicyResult.value,

      minimumOrderQty:
        minimumOrderResult.value,

      allowCOD
    };

    /* ------------------------------------------------------
       8. Development Debug
       ------------------------------------------------------ */

    console.log(
      'BAZARIA STEP 6 MORE OPTIONS:',
      {
        variants: uploadState.product.variants,
        warranty: uploadState.product.warranty,
        returnPolicy: uploadState.product.returnPolicy,
        minimumOrderQty:
          uploadState.product.minimumOrderQty,
        allowCOD:
          uploadState.product.allowCOD
      }
    );

    console.log(
      'BAZARIA CURRENT PRODUCT STATE:',
      uploadState.product
    );

    /* ------------------------------------------------------
       9. Success + Step 7
       ------------------------------------------------------ */

    triggerHaptic(15);

    goToStep(7, 'forward');
  });
}

  /* ==========================================================
     13. RESET + INITIALIZATION
     ========================================================== */

  function revokeAllImagePreviewUrls() {
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    imagePreviewUrls.clear();
  }

  function resetUploadSystem() {
    revokeAllImagePreviewUrls();

    uploadState.currentStep = 0;
    uploadState.images = [];
    uploadState.currentPreviewIndex = 0;
    uploadState.tags = [];
    uploadState.variants = [];
    uploadState.product = {
      condition: 'new',
      specifications: []
    };

    steps.forEach(step => {
      step.classList.remove(
        'is-active',
        'step-exit-left',
        'step-exit-right',
        'step-enter-left',
        'step-enter-right'
      );
    });

    const firstStep = getStep(0);
    if (firstStep) firstStep.classList.add('is-active');

    if (step1Form) step1Form.reset();
    if (step2Form) step2Form.reset();
    if (step3Form) step3Form.reset();
    if (step4Form) step4Form.reset();
    if (step5Form) step5Form.reset();

    if (hiddenConditionInput) hiddenConditionInput.value = 'new';

    conditionButtons.forEach((button, index) => {
      button.classList.toggle('active', index === 0);
    });

    if (specsContainer) specsContainer.innerHTML = '';
    if (richEditor) richEditor.innerHTML = '';
    if (tagInput) tagInput.value = '';
    if (variantsContainer) {
      variantsContainer.innerHTML = '';
    }

    

    if (step6Form) {
      step6Form.reset();
    }

    renderTags();
    renderImageGallery();
    updateDescriptionCounter();
    updateImageStatus();
    calculateProfit();
    updateProgress(1);
  }

  function initializeUploadSystem() {
    steps.forEach(step => {
      step.classList.remove(
        'is-active',
        'step-exit-left',
        'step-exit-right',
        'step-enter-left',
        'step-enter-right'
      );
    });

    const firstStep = getStep(0);
    if (firstStep) firstStep.classList.add('is-active');

    uploadState.currentStep = 0;

    updateDescriptionCounter();
    updateImageStatus();
    renderTags();
    calculateProfit();
    updateProgress(1);
  }

/* ==========================================================
   14. PUBLIC API
   ----------------------------------------------------------
   Exposes only the safe bridges required by external modules.
   Step 7 uses this API through preview.js.
   ========================================================== */

window.BazariaUpload = {

  /* --------------------------------------------------------
     14.01 READ CURRENT UPLOAD STATE
     -------------------------------------------------------- */

  getState: () => ({
    currentStep: uploadState.currentStep,

    images: [...uploadState.images],

    currentPreviewIndex:
      uploadState.currentPreviewIndex,

    tags: [...uploadState.tags],

    variants: [...uploadState.variants],

    product: {
      ...uploadState.product,

      images: uploadState.product.images
        ? [...uploadState.product.images]
        : undefined,

      specifications: [
        ...(uploadState.product.specifications || [])
      ],

      tags: [
        ...(uploadState.product.tags || [])
      ],

      variants: [
        ...(uploadState.product.variants || [])
      ],

      shipping: uploadState.product.shipping
        ? {
            ...uploadState.product.shipping,
            dimensions:
              uploadState.product.shipping.dimensions
                ? {
                    ...uploadState.product.shipping.dimensions
                  }
                : null
          }
        : undefined
    }
  }),

  /* --------------------------------------------------------
     14.02 STEP NAVIGATION BRIDGE
     -------------------------------------------------------- */

  goToStep: (
    stepNumber,
    direction = 'forward'
  ) => {
    goToStep(stepNumber, direction);
  },

  /* --------------------------------------------------------
     14.03 RESET UPLOAD SYSTEM
     -------------------------------------------------------- */

  reset: () => resetUploadSystem()
};
  
  initializeUploadSystem();

});