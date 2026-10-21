/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   step0.js
   ------------------------------------------------------------
   STEP 0 — PRODUCT TYPE SELECTION

   Responsibilities:
   - Single Product → Start the 7-step upload system
   - Bulk Product → Show "Coming Soon"
   - Save selected product type into upload state
   - Keep Step 0 logic separate from navigation.js
   ============================================================ */

(function () {

  "use strict";


  /* ==========================================================
     SAFETY CHECK
     ========================================================== */

  if (!window.BazariaUpload) {
    console.error(
      "BazariaUpload: step0.js requires state.js."
    );
    return;
  }


  if (!BazariaUpload.navigation) {
    console.error(
      "BazariaUpload: step0.js requires navigation.js."
    );
    return;
  }


  /* ==========================================================
     DOM ELEMENTS
     ========================================================== */

  const singleProductButton =
    document.getElementById("btnSingleProduct");

  const bulkUploadButton =
    document.getElementById("btnBulkUpload");


  /* ==========================================================
     BULK — COMING SOON MESSAGE
     ========================================================== */

  const showBulkComingSoon = () => {

    /*
     * Do not move to Step 1.
     *
     * Bulk Product Upload is not available yet.
     * We only inform the user for now.
     */

    let message =
      document.getElementById(
        "bulkComingSoonMessage"
      );


    /* --------------------------------------------------------
       Create message if it does not already exist
       -------------------------------------------------------- */

    if (!message) {

      message = document.createElement("div");

      message.id =
        "bulkComingSoonMessage";

      message.className =
        "upload-coming-soon-message";

      message.setAttribute(
        "role",
        "status"
      );

      message.setAttribute(
        "aria-live",
        "polite"
      );

      message.textContent =
        "Coming Soon.";


      /*
       * Place the message below the Step 0
       * product selection area.
       */

      const step0 =
        document.getElementById(
          "uploadStep0"
        );


      if (step0) {

        step0.appendChild(message);

      }

    }


    /* --------------------------------------------------------
       Show message
       -------------------------------------------------------- */

    message.hidden = false;

    message.classList.add(
      "is-visible"
    );


    /* --------------------------------------------------------
       Remove previous hide timer
       -------------------------------------------------------- */

    if (message._hideTimer) {

      clearTimeout(
        message._hideTimer
      );

    }


    /* --------------------------------------------------------
       Automatically hide after a few seconds
       -------------------------------------------------------- */

    message._hideTimer =
      setTimeout(() => {

        message.classList.remove(
          "is-visible"
        );

        message.hidden = true;

      }, 3000);

  };


  /* ==========================================================
     SINGLE PRODUCT
     ========================================================== */

  const handleSingleProduct = () => {

    /*
     * Save product type.
     */

    BazariaUpload.setProductType(
      "single"
    );


    /*
     * Mark the upload system as changed.
     */

    BazariaUpload.markDirty();


    /*
     * Start the actual 7-step
     * Single Product Upload System.
     *
     * Step 0 → Step 1
     */

    BazariaUpload.navigation.nextStep();

  };


  /* ==========================================================
     BULK PRODUCT
     ========================================================== */

  const handleBulkProduct = () => {

    /*
     * Save product type even though
     * the Bulk system is not active yet.
     */

    BazariaUpload.setProductType(
      "bulk"
    );


    /*
     * Do NOT navigate to Step 1.
     */

    showBulkComingSoon();

  };


  /* ==========================================================
     EVENT LISTENERS
     ========================================================== */

  if (singleProductButton) {

    singleProductButton.addEventListener(
      "click",
      handleSingleProduct
    );

  }


  if (bulkUploadButton) {

    bulkUploadButton.addEventListener(
      "click",
      handleBulkProduct
    );

  }


  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  const init = () => {

    /*
     * Step 0 has no form submission.
     *
     * Navigation is controlled only when
     * the user selects a product type.
     */

  };


  /* ==========================================================
     DOM READY
     ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }


  /* ==========================================================
     PUBLIC API
     ========================================================== */

  BazariaUpload.step0 = {

    handleSingleProduct,
    handleBulkProduct,
    showBulkComingSoon

  };


})();