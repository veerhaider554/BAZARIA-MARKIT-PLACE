/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   step3.js
   ------------------------------------------------------------
   STEP 3 — PRODUCT IMAGES

   Responsibilities:
   - Image file selection
   - Drag & Drop
   - Image preview
   - Multiple images
   - Main / cover image
   - Image removal
   - Image ordering
   - Image validation
   - State synchronization
   - Existing image restoration

   This file does NOT:
   - Control step navigation
   - Perform step validation
   - Save drafts
   - Publish products
   - Upload files to backend
   ============================================================ */

(function () {

  "use strict";


  /* ============================================================
     01. SAFETY CHECK
     ============================================================ */

  if (!window.BazariaUpload) {

    console.error(
      "BazariaUpload: step3.js requires state.js."
    );

    return;
  }


  /* ============================================================
     02. STEP 3 ELEMENT
     ============================================================ */

  const step3 =
    document.getElementById(
      "uploadStep3"
    );


  if (!step3) {
    return;
  }


  /* ============================================================
     03. IMAGE ELEMENTS
     ============================================================ */

  const imageDropzone =
    document.getElementById(
      "imageDropzone"
    );


  const imageInput =
    document.getElementById(
      "imageInput"
    );


  const imagePreviewGrid =
    document.getElementById(
      "imagePreviewGrid"
    );


  /* ============================================================
     04. IMAGE CONFIGURATION
     ------------------------------------------------------------
     These limits are frontend safety limits.

     They can be changed later without changing the rest
     of the image system.
     ============================================================ */

  const MAX_IMAGES = 10;

  const MAX_FILE_SIZE =
    10 * 1024 * 1024;

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  /* ============================================================
     05. INTERNAL IMAGE STATE
     ------------------------------------------------------------
     Each image object keeps frontend information.

     Example:

     {
       id: "...",
       file: File,
       url: "...",
       name: "...",
       type: "...",
       size: 12345,
       isMain: true
     }

     The File object stays local for now.
     Later upload.js can send it to the backend.
     ============================================================ */

  let images = [];


  /* ============================================================
     06. IMAGE ID
     ------------------------------------------------------------ */

  function createImageId() {

    return (
      "img_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 8)
    );

  }


  /* ============================================================
     07. MARK DIRTY
     ============================================================ */

  function markDirty() {

    if (
      typeof BazariaUpload.markDirty ===
      "function"
    ) {

      BazariaUpload.markDirty();

    }

  }


  /* ============================================================
     08. IMAGE ERROR MESSAGE
     ------------------------------------------------------------
     Keeps image-related errors local to Step 3.

     We do not create a new permanent HTML structure.
     ============================================================ */

  function showImageMessage(message) {

    if (!imageDropzone) {
      return;
    }


    let messageElement =
      imageDropzone.querySelector(
        ".image-upload-message"
      );


    if (!messageElement) {

      messageElement =
        document.createElement("div");

      messageElement.className =
        "image-upload-message";

      messageElement.setAttribute(
        "role",
        "status"
      );

      imageDropzone.appendChild(
        messageElement
      );

    }


    messageElement.textContent =
      message;


    clearTimeout(
      messageElement._bazariaTimer
    );


    messageElement._bazariaTimer =
      setTimeout(
        function () {

          messageElement.textContent =
            "";

        },
        4000
      );

  }


  /* ============================================================
     09. CLEAR IMAGE MESSAGE
     ============================================================ */

  function clearImageMessage() {

    if (!imageDropzone) {
      return;
    }


    const messageElement =
      imageDropzone.querySelector(
        ".image-upload-message"
      );


    if (messageElement) {

      messageElement.textContent =
        "";

    }

  }


  /* ============================================================
     10. CHECK IMAGE FILE
     ============================================================ */

  function isValidImageFile(file) {

    if (!file) {
      return false;
    }


    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {

      return false;

    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      return false;

    }


    return true;

  }


  /* ============================================================
     11. IMAGE ERROR REASON
     ============================================================ */

  function getImageFileError(file) {

    if (!file) {
      return "Invalid image file.";
    }


    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {

      return (
        file.name +
        " is not a supported image format."
      );

    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {

      return (
        file.name +
        " is larger than 10 MB."
      );

    }


    return "";

  }


  /* ============================================================
     12. CHECK DUPLICATE FILE
     ------------------------------------------------------------
     Prevents accidentally adding the exact same file again.
     ============================================================ */

  function isDuplicateFile(file) {

    return images.some(
      function (image) {

        if (!image.file) {
          return false;
        }


        return (
          image.file.name === file.name &&
          image.file.size === file.size &&
          image.file.lastModified ===
            file.lastModified
        );

      }
    );

  }


  /* ============================================================
     13. CREATE IMAGE OBJECT
     ============================================================ */

  function createImageObject(file) {

    return {

      id: createImageId(),

      file: file,

      url: URL.createObjectURL(
        file
      ),

      name: file.name,

      type: file.type,

      size: file.size,

      lastModified:
        file.lastModified,

      isMain:
        images.length === 0

    };

  }


  /* ============================================================
     14. GET STATE-SAFE IMAGE DATA
     ------------------------------------------------------------
     Only serializable information is stored in central state.

     File and object URL remain inside Step 3 for now.
     ============================================================ */

  function getStateImages() {

    return images.map(
      function (image, index) {

        return {

          id: image.id,

          name: image.name,

          type: image.type,

          size: image.size,

          order: index,

          isMain:
            image.isMain === true

        };

      }
    );

  }


  /* ============================================================
     15. SYNC IMAGES TO CENTRAL STATE
     ============================================================ */

  function syncImagesToState() {

    BazariaUpload.setImages(
      getStateImages()
    );


    markDirty();

  }


  /* ============================================================
     16. ENSURE MAIN IMAGE
     ------------------------------------------------------------
     Exactly one image should be main.

     If the current main image is removed,
     the first remaining image becomes main.
     ============================================================ */

  function ensureMainImage() {

    if (!images.length) {
      return;
    }


    let mainFound = false;


    images.forEach(
      function (image) {

        if (
          image.isMain === true &&
          !mainFound
        ) {

          mainFound = true;

        } else {

          image.isMain = false;

        }

      }
    );


    if (!mainFound) {

      images[0].isMain = true;

    }

  }


  /* ============================================================
     17. RENDER IMAGE GRID
     ============================================================ */

  function renderImages() {

    if (!imagePreviewGrid) {
      return;
    }


    imagePreviewGrid.innerHTML = "";


    if (!images.length) {
      return;
    }


    images.forEach(
      function (image, index) {

        const item =
          document.createElement("div");


        item.className =
          "upload-image-item";


        item.dataset.imageId =
          image.id;


        item.dataset.imageIndex =
          String(index);


        if (image.isMain) {

          item.classList.add(
            "is-main"
          );

        }


        /* ----------------------------------------------------
           Image preview
           ---------------------------------------------------- */

        const imageElement =
          document.createElement("img");


        imageElement.src =
          image.url;


        imageElement.alt =
          image.isMain
            ? "Main product image"
            : "Product image " +
              (index + 1);


        imageElement.loading =
          "lazy";


        /* ----------------------------------------------------
           Preview wrapper
           ---------------------------------------------------- */

        const preview =
          document.createElement("div");


        preview.className =
          "upload-image-preview";


        preview.appendChild(
          imageElement
        );


        /* ----------------------------------------------------
           Main badge
           ---------------------------------------------------- */

        if (image.isMain) {

          const badge =
            document.createElement("span");


          badge.className =
            "upload-image-main-badge";


          badge.textContent =
            "Main";


          preview.appendChild(
            badge
          );

        }


        /* ----------------------------------------------------
           Image number
           ---------------------------------------------------- */

        const number =
          document.createElement("span");


        number.className =
          "upload-image-number";


        number.textContent =
          String(index + 1);


        preview.appendChild(
          number
        );


        /* ----------------------------------------------------
           Controls
           ---------------------------------------------------- */

        const controls =
          document.createElement("div");


        controls.className =
          "upload-image-controls";


        /* Main button */

        const mainButton =
          document.createElement("button");


        mainButton.type =
          "button";


        mainButton.className =
          "upload-image-main-button";


        mainButton.dataset.action =
          "main";


        mainButton.title =
          image.isMain
            ? "Main image"
            : "Set as main image";


        mainButton.setAttribute(
          "aria-label",
          image.isMain
            ? "Main image"
            : "Set as main image"
        );


        mainButton.textContent =
          image.isMain
            ? "Main"
            : "Set Main";


        /* Move left */

        const leftButton =
          document.createElement("button");


        leftButton.type =
          "button";


        leftButton.className =
          "upload-image-move-left";


        leftButton.dataset.action =
          "move-left";


        leftButton.title =
          "Move image left";


        leftButton.setAttribute(
          "aria-label",
          "Move image left"
        );


        leftButton.textContent =
          "←";


        /* Move right */

        const rightButton =
          document.createElement("button");


        rightButton.type =
          "button";


        rightButton.className =
          "upload-image-move-right";


        rightButton.dataset.action =
          "move-right";


        rightButton.title =
          "Move image right";


        rightButton.setAttribute(
          "aria-label",
          "Move image right"
        );


        rightButton.textContent =
          "→";


        /* Remove */

        const removeButton =
          document.createElement("button");


        removeButton.type =
          "button";


        removeButton.className =
          "upload-image-remove";


        removeButton.dataset.action =
          "remove";


        removeButton.title =
          "Remove image";


        removeButton.setAttribute(
          "aria-label",
          "Remove image"
        );


        removeButton.textContent =
          "×";


        controls.appendChild(
          mainButton
        );


        controls.appendChild(
          leftButton
        );


        controls.appendChild(
          rightButton
        );


        controls.appendChild(
          removeButton
        );


        /* ----------------------------------------------------
           Filename
           ---------------------------------------------------- */

        const filename =
          document.createElement("div");


        filename.className =
          "upload-image-filename";


        filename.textContent =
          image.name;


        filename.title =
          image.name;


        /* ----------------------------------------------------
           Final item
           ---------------------------------------------------- */

        item.appendChild(
          preview
        );


        item.appendChild(
          controls
        );


        item.appendChild(
          filename
        );


        imagePreviewGrid.appendChild(
          item
        );

      }
    );

  }


  /* ============================================================
     18. ADD IMAGE
     ============================================================ */

  function addImage(file) {

    if (!file) {
      return false;
    }


    if (
      images.length >= MAX_IMAGES
    ) {

      showImageMessage(
        "You can add up to " +
        MAX_IMAGES +
        " images."
      );

      return false;

    }


    if (
      !isValidImageFile(file)
    ) {

      showImageMessage(
        getImageFileError(file)
      );

      return false;

    }


    if (
      isDuplicateFile(file)
    ) {

      showImageMessage(
        "This image has already been added."
      );

      return false;

    }


    const image =
      createImageObject(
        file
      );


    images.push(
      image
    );


    ensureMainImage();

    renderImages();

    syncImagesToState();

    clearImageMessage();


    return true;

  }


  /* ============================================================
     19. ADD MULTIPLE IMAGES
     ============================================================ */

  function addImages(fileList) {

    if (!fileList) {
      return;
    }


    const files =
      Array.from(
        fileList
      );


    if (!files.length) {
      return;
    }


    let addedCount = 0;


    for (
      let i = 0;
      i < files.length;
      i++
    ) {

      if (
        images.length >= MAX_IMAGES
      ) {

        showImageMessage(
          "Maximum " +
          MAX_IMAGES +
          " images allowed."
        );

        break;

      }


      if (
        addImage(files[i])
      ) {

        addedCount++;

      }

    }


    if (
      addedCount > 0
    ) {

      renderImages();

    }

  }


  /* ============================================================
     20. REMOVE IMAGE
     ============================================================ */

  function removeImage(imageId) {

    const index =
      images.findIndex(
        function (image) {

          return image.id === imageId;

        }
      );


    if (index === -1) {
      return;
    }


    const image =
      images[index];


    /*
     * Release object URL to avoid unnecessary memory usage.
     */

    if (
      image.url &&
      image.url.startsWith("blob:")
    ) {

      URL.revokeObjectURL(
        image.url
      );

    }


    images.splice(
      index,
      1
    );


    ensureMainImage();

    renderImages();

    syncImagesToState();

  }


  /* ============================================================
     21. SET MAIN IMAGE
     ============================================================ */

  function setMainImage(imageId) {

    const imageExists =
      images.some(
        function (image) {

          return image.id === imageId;

        }
      );


    if (!imageExists) {
      return;
    }


    images.forEach(
      function (image) {

        image.isMain =
          image.id === imageId;

      }
    );


    renderImages();

    syncImagesToState();

  }


  /* ============================================================
     22. MOVE IMAGE
     ============================================================ */

  function moveImage(
    imageId,
    direction
  ) {

    const index =
      images.findIndex(
        function (image) {

          return image.id === imageId;

        }
      );


    if (index === -1) {
      return;
    }


    const newIndex =
      index + direction;


    if (
      newIndex < 0 ||
      newIndex >= images.length
    ) {

      return;

    }


    const movedImage =
      images.splice(
        index,
        1
      )[0];


    images.splice(
      newIndex,
      0,
      movedImage
    );


    /*
     * First image is always the preferred cover position.
     * Keep the main flag explicit as well.
     */

    if (
      index === 0 ||
      newIndex === 0
    ) {

      images.forEach(
        function (image) {

          image.isMain = false;

        }
      );


      images[0].isMain =
        true;

    }


    renderImages();

    syncImagesToState();

  }


  /* ============================================================
     23. IMAGE GRID ACTIONS
     ------------------------------------------------------------
     Event delegation keeps the system lightweight and avoids
     attaching separate listeners to every control repeatedly.
     ============================================================ */

  if (imagePreviewGrid) {

    imagePreviewGrid.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "button[data-action]"
          );


        if (!button) {
          return;
        }


        const item =
          button.closest(
            ".upload-image-item"
          );


        if (!item) {
          return;
        }


        const imageId =
          item.dataset.imageId;


        const action =
          button.dataset.action;


        if (
          action === "main"
        ) {

          setMainImage(
            imageId
          );

        }


        if (
          action === "move-left"
        ) {

          moveImage(
            imageId,
            -1
          );

        }


        if (
          action === "move-right"
        ) {

          moveImage(
            imageId,
            1
          );

        }


        if (
          action === "remove"
        ) {

          removeImage(
            imageId
          );

        }

      }
    );

  }


  /* ============================================================
     24. FILE INPUT
     ============================================================ */

  if (imageInput) {

    imageInput.addEventListener(
      "change",
      function () {

        addImages(
          imageInput.files
        );


        /*
         * Reset input so the same file can be selected again
         * after being removed.
         */

        imageInput.value =
          "";

      }
    );

  }


  /* ============================================================
     25. DROPZONE CLICK
     ------------------------------------------------------------
     Only open the native file picker when the click did not
     originate from an interactive child.
     ============================================================ */

  if (imageDropzone) {

    imageDropzone.addEventListener(
      "click",
      function (event) {

        if (
          event.target.closest(
            "button, input, a"
          )
        ) {

          return;

        }


        if (imageInput) {

          imageInput.click();

        }

      }
    );

  }


  /* ============================================================
     26. KEYBOARD ACCESS
     ------------------------------------------------------------ */

  if (imageDropzone) {

    imageDropzone.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {

          return;

        }


        if (
          event.target !==
          imageDropzone
        ) {

          return;

        }


        event.preventDefault();


        if (imageInput) {

          imageInput.click();

        }

      }
    );

  }


  /* ============================================================
     27. DRAG ENTER
     ============================================================ */

  if (imageDropzone) {

    imageDropzone.addEventListener(
      "dragenter",
      function (event) {

        event.preventDefault();

        imageDropzone.classList.add(
          "is-dragging"
        );

      }
    );

  }


  /* ============================================================
     28. DRAG OVER
     ============================================================ */

  if (imageDropzone) {

    imageDropzone.addEventListener(
      "dragover",
      function (event) {

        event.preventDefault();

        event.dataTransfer.dropEffect =
          "copy";

        imageDropzone.classList.add(
          "is-dragging"
        );

      }
    );

  }


  /* ============================================================
     29. DRAG LEAVE
     ============================================================ */

  if (imageDropzone) {

    imageDropzone.addEventListener(
      "dragleave",
      function (event) {

        /*
         * Do not remove the state when moving between
         * children inside the dropzone.
         */

        if (
          event.relatedTarget &&
          imageDropzone.contains(
            event.relatedTarget
          )
        ) {

          return;

        }


        imageDropzone.classList.remove(
          "is-dragging"
        );

      }
    );

  }


  /* ============================================================
     30. DROP
     ============================================================ */

  if (imageDropzone) {

    imageDropzone.addEventListener(
      "drop",
      function (event) {

        event.preventDefault();


        imageDropzone.classList.remove(
          "is-dragging"
        );


        const files =
          event.dataTransfer
            ? event.dataTransfer.files
            : null;


        addImages(
          files
        );

      }
    );

  }


  /* ============================================================
     31. RESTORE EXISTING STATE
     ------------------------------------------------------------
     At the current frontend stage, state contains serializable
     image metadata only.

     Real File objects cannot be restored after a page reload
     from JavaScript state alone.

     Therefore existing metadata is preserved safely, while
     local File previews are only restored when available.
     ============================================================ */

  function restoreFromState() {

    const state =
      BazariaUpload.getState();


    if (
      !state ||
      !state.product ||
      !state.product.media
    ) {

      return;

    }


    const stateImages =
      state.product.media.images;


    if (
      !Array.isArray(
        stateImages
      )
    ) {

      return;

    }


    /*
     * If the current session already has local image objects,
     * do not duplicate them.
     */

    if (images.length) {
      return;
    }


    /*
     * Metadata-only images cannot create a valid browser
     * preview URL. They are intentionally not fabricated.
     *
     * Future backend/upload integration can restore remote
     * image URLs here.
     */

  }


  /* ============================================================
     32. CLEAR ALL IMAGES
     ============================================================ */

  function clearAllImages() {

    images.forEach(
      function (image) {

        if (
          image.url &&
          image.url.startsWith("blob:")
        ) {

          URL.revokeObjectURL(
            image.url
          );

        }

      }
    );


    images = [];


    renderImages();

    syncImagesToState();

  }


  /* ============================================================
     33. GET IMAGES
     ============================================================ */

  function getImages() {

    return images.map(
      function (image) {

        return {

          id: image.id,

          file: image.file,

          url: image.url,

          name: image.name,

          type: image.type,

          size: image.size,

          isMain:
            image.isMain === true

        };

      }
    );

  }


  /* ============================================================
     34. INITIALIZE
     ============================================================ */

  function init() {

    restoreFromState();

    ensureMainImage();

    renderImages();

  }


  /* ============================================================
     35. PUBLIC STEP 3 API
     ============================================================ */

  window.BazariaStep3 = {

    addImages: function (
      fileList
    ) {

      addImages(
        fileList
      );

    },


    removeImage: function (
      imageId
    ) {

      removeImage(
        imageId
      );

    },


    setMainImage: function (
      imageId
    ) {

      setMainImage(
        imageId
      );

    },


    moveImage: function (
      imageId,
      direction
    ) {

      moveImage(
        imageId,
        direction
      );

    },


    clearAllImages: function () {

      clearAllImages();

    },


    getImages: function () {

      return getImages();

    },


    getImageCount: function () {

      return images.length;

    }

  };


  /* ============================================================
     36. START STEP 3
     ============================================================ */

  init();


})();