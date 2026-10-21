/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   step4.js
   ------------------------------------------------------------
   STEP 4 — PRODUCT DETAILS

   Responsibilities:
   - Rich text description editor
   - Bold / Italic / Underline
   - Unordered / Ordered lists
   - Description character counter
   - Description state sync
   - Specifications management
   - Tags management
   - State restoration

   This file does NOT:
   - Control navigation
   - Perform validation
   - Upload product
   - Save drafts
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     SAFETY CHECK
     ========================================================== */

  if (!window.BazariaUpload) {
    console.error("BazariaUpload is not available.");
    return;
  }

  /* ==========================================================
     DOM ELEMENTS
     ========================================================== */

  const step4 = document.getElementById("uploadStep4");

  const richEditor = document.getElementById("richEditor");
  const longDescCount = document.getElementById("longDescCount");

  const specsContainer = document.getElementById("specsContainer");
  const btnAddSpec = document.getElementById("btnAddSpec");

  const tagsWrapper = document.getElementById("tagsWrapper");
  const tagsList = document.getElementById("tagsList");
  const tagInput = document.getElementById("tagInput");

  /* ==========================================================
     CONSTANTS
     ========================================================== */

  const MAX_DESCRIPTION_LENGTH = 2000;
  const MAX_TAGS = 10;
  const MAX_TAG_LENGTH = 30;

  /* ==========================================================
     INTERNAL STATE
     ----------------------------------------------------------
     We keep a local copy for UI handling, while the official
     product data remains inside state.js.
     ========================================================== */

  let specifications = [];
  let tags = [];

  /* ==========================================================
     UTILITY — GET CURRENT STATE
     ========================================================== */

  const getCurrentState = () => {
    if (typeof BazariaUpload.getState !== "function") {
      return null;
    }

    return BazariaUpload.getState();
  };

  /* ==========================================================
     UTILITY — MARK PRODUCT DIRTY
     ========================================================== */

  const markDirty = () => {
    if (typeof BazariaUpload.markDirty === "function") {
      BazariaUpload.markDirty();
    }
  };

  /* ==========================================================
     UTILITY — CLEAN TEXT
     ========================================================== */

  const cleanText = (value) => {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();
  };

  /* ==========================================================
     DESCRIPTION
     ========================================================== */

  const getDescriptionText = () => {
    if (!richEditor) {
      return "";
    }

    return richEditor.textContent || "";
  };

  /* ==========================================================
     DESCRIPTION — CHARACTER COUNT
     ========================================================== */

  const updateDescriptionCounter = () => {
    if (!richEditor || !longDescCount) {
      return;
    }

    const length = getDescriptionText().length;

    longDescCount.textContent = `${length}/${MAX_DESCRIPTION_LENGTH}`;
  };

  /* ==========================================================
     DESCRIPTION — LIMIT CONTENT
     ----------------------------------------------------------
     Keeps formatting while removing characters beyond the
     allowed 2000 character limit.
     ========================================================== */

  const enforceDescriptionLimit = () => {
    if (!richEditor) {
      return;
    }

    const text = getDescriptionText();

    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      return;
    }

    const walker = document.createTreeWalker(
      richEditor,
      NodeFilter.SHOW_TEXT
    );

    let currentLength = 0;
    let targetNode = null;
    let targetOffset = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const nodeLength = node.textContent.length;

      if (currentLength + nodeLength >= MAX_DESCRIPTION_LENGTH) {
        targetNode = node;
        targetOffset = MAX_DESCRIPTION_LENGTH - currentLength;
        break;
      }

      currentLength += nodeLength;
    }

    if (targetNode) {
      const range = document.createRange();

      range.setStart(targetNode, targetOffset);
      range.setEnd(
        targetNode,
        targetNode.textContent.length
      );

      range.deleteContents();

      /* Remove anything after the truncated position */
      let parent = targetNode.parentNode;

      while (parent && parent !== richEditor) {
        let sibling = parent.nextSibling;

        while (sibling) {
          const nextSibling = sibling.nextSibling;

          if (sibling.parentNode) {
            sibling.parentNode.removeChild(sibling);
          }

          sibling = nextSibling;
        }

        parent = parent.parentNode;
      }
    }

    updateDescriptionCounter();
  };

  /* ==========================================================
     DESCRIPTION — SYNC TO STATE
     ========================================================== */

  const syncDescriptionToState = () => {
    if (!richEditor) {
      return;
    }

    BazariaUpload.updateDetails({
      longDescription: richEditor.innerHTML
    });

    markDirty();
  };

  /* ==========================================================
     DESCRIPTION — INPUT HANDLER
     ========================================================== */

  const handleDescriptionInput = () => {
    enforceDescriptionLimit();
    updateDescriptionCounter();
    syncDescriptionToState();
  };

  /* ==========================================================
     RICH TEXT TOOLBAR
     ========================================================== */

  const executeEditorCommand = (command) => {
    if (!richEditor) {
      return;
    }

    richEditor.focus();

    try {
      document.execCommand(command, false, null);
    } catch (error) {
      console.warn(
        `Editor command failed: ${command}`,
        error
      );
    }

    enforceDescriptionLimit();
    updateDescriptionCounter();
    syncDescriptionToState();
  };

  /* ==========================================================
     TOOLBAR BUTTONS
     ========================================================== */

  const bindToolbarButtons = () => {
    if (!step4) {
      return;
    }

    const toolbarButtons =
      step4.querySelectorAll(".tool-btn");

    toolbarButtons.forEach((button) => {
      button.addEventListener("mousedown", (event) => {
        /*
         Prevent losing the editor selection when the toolbar
         button is clicked.
        */
        event.preventDefault();
      });

      button.addEventListener("click", () => {
        const command = button.dataset.command;

        if (!command) {
          return;
        }

        executeEditorCommand(command);
      });
    });
  };

  /* ==========================================================
     SPECIFICATIONS — DEFAULT OBJECT
     ========================================================== */

  const createSpecification = (
    name = "",
    value = ""
  ) => {
    return {
      name: String(name ?? ""),
      value: String(value ?? "")
    };
  };

  /* ==========================================================
     SPECIFICATIONS — SYNC TO STATE
     ========================================================== */

  const syncSpecificationsToState = () => {
    BazariaUpload.updateDetails({
      specifications: specifications.map((spec) => ({
        name: spec.name,
        value: spec.value
      }))
    });

    markDirty();
  };

  /* ==========================================================
     SPECIFICATIONS — RENDER
     ========================================================== */

  const renderSpecifications = () => {
    if (!specsContainer) {
      return;
    }

    specsContainer.innerHTML = "";

    specifications.forEach((spec, index) => {
      const row = document.createElement("div");

      row.className = "upload-spec-row";
      row.dataset.specIndex = String(index);

      row.innerHTML = `
        <div class="upload-spec-field">
          <input
            type="text"
            class="upload-spec-name"
            placeholder="Specification"
            value=""
            maxlength="80"
            autocomplete="off"
          />
        </div>

        <div class="upload-spec-field">
          <input
            type="text"
            class="upload-spec-value"
            placeholder="Value"
            value=""
            maxlength="120"
            autocomplete="off"
          />
        </div>

        <button
          type="button"
          class="upload-spec-remove"
          aria-label="Remove specification"
          title="Remove specification"
        >
          ×
        </button>
      `;

      const nameInput =
        row.querySelector(".upload-spec-name");

      const valueInput =
        row.querySelector(".upload-spec-value");

      nameInput.value = spec.name;
      valueInput.value = spec.value;

      specsContainer.appendChild(row);
    });
  };

  /* ==========================================================
     SPECIFICATIONS — ADD
     ========================================================== */

  const addSpecification = (
    name = "",
    value = ""
  ) => {
    specifications.push(
      createSpecification(name, value)
    );

    renderSpecifications();
    syncSpecificationsToState();

    const rows =
      specsContainer?.querySelectorAll(
        ".upload-spec-row"
      );

    const lastRow =
      rows?.[rows.length - 1];

    const nameInput =
      lastRow?.querySelector(".upload-spec-name");

    if (nameInput) {
      nameInput.focus();
    }
  };

  /* ==========================================================
     SPECIFICATIONS — REMOVE
     ========================================================== */

  const removeSpecification = (index) => {
    if (
      index < 0 ||
      index >= specifications.length
    ) {
      return;
    }

    specifications.splice(index, 1);

    renderSpecifications();
    syncSpecificationsToState();
  };

  /* ==========================================================
     SPECIFICATIONS — INPUT CHANGE
     ========================================================== */

  const handleSpecificationInput = (event) => {
    const target = event.target;

    const row =
      target.closest(".upload-spec-row");

    if (!row) {
      return;
    }

    const index = Number(row.dataset.specIndex);

    if (
      Number.isNaN(index) ||
      !specifications[index]
    ) {
      return;
    }

    if (target.classList.contains("upload-spec-name")) {
      specifications[index].name = target.value;
    }

    if (target.classList.contains("upload-spec-value")) {
      specifications[index].value = target.value;
    }

    syncSpecificationsToState();
  };

  /* ==========================================================
     SPECIFICATIONS — EVENT DELEGATION
     ========================================================== */

  const bindSpecificationEvents = () => {
    if (!specsContainer) {
      return;
    }

    specsContainer.addEventListener(
      "input",
      handleSpecificationInput
    );

    specsContainer.addEventListener(
      "click",
      (event) => {
        const removeButton =
          event.target.closest(
            ".upload-spec-remove"
          );

        if (!removeButton) {
          return;
        }

        const row =
          removeButton.closest(
            ".upload-spec-row"
          );

        if (!row) {
          return;
        }

        const index =
          Number(row.dataset.specIndex);

        removeSpecification(index);
      }
    );
  };

  /* ==========================================================
     TAGS — NORMALIZE
     ========================================================== */

  const normalizeTag = (value) => {
    return cleanText(value)
      .replace(/^,+|,+$/g, "")
      .trim();
  };

  /* ==========================================================
     TAGS — CHECK DUPLICATE
     ========================================================== */

  const tagExists = (tag) => {
    const normalized =
      tag.toLowerCase();

    return tags.some(
      (existingTag) =>
        existingTag.toLowerCase() === normalized
    );
  };

  /* ==========================================================
     TAGS — SYNC TO STATE
     ========================================================== */

  const syncTagsToState = () => {
    BazariaUpload.updateDetails({
      tags: [...tags]
    });

    markDirty();
  };

  /* ==========================================================
     TAGS — RENDER
     ========================================================== */

  const renderTags = () => {
    if (!tagsList) {
      return;
    }

    tagsList.innerHTML = "";

    tags.forEach((tag, index) => {
      const tagElement =
        document.createElement("span");

      tagElement.className =
        "upload-tag-item";

      tagElement.dataset.tagIndex =
        String(index);

      const text =
        document.createElement("span");

      text.className =
        "upload-tag-text";

      text.textContent = tag;

      const removeButton =
        document.createElement("button");

      removeButton.type = "button";

      removeButton.className =
        "upload-tag-remove";

      removeButton.dataset.tagIndex =
        String(index);

      removeButton.setAttribute(
        "aria-label",
        `Remove ${tag}`
      );

      removeButton.title = "Remove tag";

      removeButton.textContent = "×";

      tagElement.appendChild(text);
      tagElement.appendChild(removeButton);

      tagsList.appendChild(tagElement);
    });
  };

  /* ==========================================================
     TAGS — ADD SINGLE TAG
     ========================================================== */

  const addTag = (rawTag) => {
    const tag = normalizeTag(rawTag);

    if (!tag) {
      return false;
    }

    if (tag.length > MAX_TAG_LENGTH) {
      return false;
    }

    if (tags.length >= MAX_TAGS) {
      return false;
    }

    if (tagExists(tag)) {
      return false;
    }

    tags.push(tag);

    renderTags();
    syncTagsToState();

    return true;
  };

  /* ==========================================================
     TAGS — ADD MULTIPLE TAGS
     ----------------------------------------------------------
     Supports:
       mobile, smartphone, android
     ========================================================== */

  const addTagsFromInput = (value) => {
    const rawTags = String(value ?? "")
      .split(",");

    let addedAny = false;

    rawTags.forEach((rawTag) => {
      if (tags.length >= MAX_TAGS) {
        return;
      }

      const added =
        addTag(rawTag);

      if (added) {
        addedAny = true;
      }
    });

    return addedAny;
  };

  /* ==========================================================
     TAGS — REMOVE
     ========================================================== */

  const removeTag = (index) => {
    if (
      index < 0 ||
      index >= tags.length
    ) {
      return;
    }

    tags.splice(index, 1);

    renderTags();
    syncTagsToState();
  };

  /* ==========================================================
     TAGS — INPUT HANDLING
     ========================================================== */

  const handleTagInputKeydown = (event) => {
    if (!tagInput) {
      return;
    }

    /*
     Enter = create tag
    */
    if (event.key === "Enter") {
      event.preventDefault();

      const value =
        tagInput.value.trim();

      if (value.includes(",")) {
        addTagsFromInput(value);
      } else {
        addTag(value);
      }

      tagInput.value = "";
      return;
    }

    /*
     Comma = create tag
    */
    if (event.key === ",") {
      event.preventDefault();

      addTag(tagInput.value);

      tagInput.value = "";
    }

    /*
     Backspace on empty input:
     remove the last tag, similar to common tag inputs.
    */
    if (
      event.key === "Backspace" &&
      tagInput.value === "" &&
      tags.length > 0
    ) {
      removeTag(tags.length - 1);
    }
  };

  /* ==========================================================
     TAGS — PASTE SUPPORT
     ----------------------------------------------------------
     Allows:
       mobile, smartphone, android
     ========================================================== */

  const handleTagPaste = (event) => {
    if (!tagInput) {
      return;
    }

    const pastedText =
      event.clipboardData?.getData("text");

    if (!pastedText) {
      return;
    }

    if (!pastedText.includes(",")) {
      return;
    }

    event.preventDefault();

    addTagsFromInput(pastedText);

    tagInput.value = "";
  };

  /* ==========================================================
     TAGS — REMOVE BUTTON
     ========================================================== */

  const bindTagRemoveEvents = () => {
    if (!tagsList) {
      return;
    }

    tagsList.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            ".upload-tag-remove"
          );

        if (!button) {
          return;
        }

        const index =
          Number(button.dataset.tagIndex);

        removeTag(index);
      }
    );
  };

  /* ==========================================================
     RESTORE FROM STATE
     ========================================================== */

  const restoreFromState = () => {
    const state = getCurrentState();

    if (!state?.product?.details) {
      return;
    }

    const details =
      state.product.details;

    /* --------------------------------------------------------
       Description
       -------------------------------------------------------- */

    if (richEditor) {
      richEditor.innerHTML =
        details.longDescription || "";

      enforceDescriptionLimit();
      updateDescriptionCounter();
    }

    /* --------------------------------------------------------
       Specifications
       -------------------------------------------------------- */

    if (
      Array.isArray(details.specifications)
    ) {
      specifications =
        details.specifications
          .filter(
            (spec) =>
              spec &&
              typeof spec === "object"
          )
          .map((spec) =>
            createSpecification(
              spec.name,
              spec.value
            )
          );
    } else {
      specifications = [];
    }

    renderSpecifications();

    /* --------------------------------------------------------
       Tags
       -------------------------------------------------------- */

    if (Array.isArray(details.tags)) {
      tags =
        details.tags
          .map((tag) => normalizeTag(tag))
          .filter(Boolean)
          .slice(0, MAX_TAGS);
    } else {
      tags = [];
    }

    renderTags();
  };

  /* ==========================================================
     BIND DESCRIPTION
     ========================================================== */

  const bindDescriptionEvents = () => {
    if (!richEditor) {
      return;
    }

    richEditor.addEventListener(
      "input",
      handleDescriptionInput
    );

    /*
     Prevent unsupported drag/drop content from creating
     unexpected files/content inside the editor.
    */
    richEditor.addEventListener(
      "drop",
      (event) => {
        event.preventDefault();
      }
    );
  };

  /* ==========================================================
     BIND TAG EVENTS
     ========================================================== */

  const bindTagEvents = () => {
    if (!tagInput) {
      return;
    }

    tagInput.addEventListener(
      "keydown",
      handleTagInputKeydown
    );

    tagInput.addEventListener(
      "paste",
      handleTagPaste
    );
  };

  /* ==========================================================
     BIND ADD SPECIFICATION
     ========================================================== */

  const bindAddSpecification = () => {
    if (!btnAddSpec) {
      return;
    }

    btnAddSpec.addEventListener(
      "click",
      () => {
        addSpecification();
      }
    );
  };

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const api = {
    getDescription: () => {
      return richEditor
        ? richEditor.innerHTML
        : "";
    },

    getDescriptionText: () => {
      return getDescriptionText();
    },

    getSpecifications: () => {
      return specifications.map(
        (spec) => ({ ...spec })
      );
    },

    addSpecification,

    removeSpecification,

    getTags: () => {
      return [...tags];
    },

    addTag,

    removeTag,

    clearTags: () => {
      tags = [];

      renderTags();
      syncTagsToState();
    }
  };

  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  const init = () => {
    if (!step4) {
      return;
    }

    restoreFromState();

    bindDescriptionEvents();
    bindToolbarButtons();

    bindAddSpecification();
    bindSpecificationEvents();

    bindTagEvents();
    bindTagRemoveEvents();

    updateDescriptionCounter();

    console.log("Bazaria Step 4 initialized.");
  };

  /* ==========================================================
     PUBLIC MODULE
     ========================================================== */

  window.BazariaStep4 = api;

  /* ==========================================================
     DOM READY
     ========================================================== */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();