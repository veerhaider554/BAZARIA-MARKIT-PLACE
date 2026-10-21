/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   state.js
   ------------------------------------------------------------
   CENTRAL STATE MANAGEMENT
   Single Source of Truth for the complete upload system.
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     NAMESPACE
     ========================================================== */

  const BazariaUpload = window.BazariaUpload =
    window.BazariaUpload || {};


  /* ==========================================================
     INITIAL STATE
     ========================================================== */

  const createInitialState = () => ({
    /* --------------------------------------------------------
       SYSTEM
       -------------------------------------------------------- */

    currentStep: 0,

    productType: null,

    isInitialized: false,

    isDirty: false,

    isUploading: false,

    isSavingDraft: false,


    /* --------------------------------------------------------
       PRODUCT DATA
       -------------------------------------------------------- */

    product: {

      /* ======================================================
         STEP 1 — BASIC INFORMATION
         ====================================================== */

      basicInfo: {
        productName: "",
        brand: "",
        category: "",
        subCategory: "",
        condition: "new",
        shortDescription: ""
      },


      /* ======================================================
         STEP 2 — PRICING & STOCK
         ====================================================== */

      pricing: {
        costPrice: "",
        sellingPrice: "",
        discountPrice: "",
        stockQty: "",
        sku: ""
      },


      /* ======================================================
         STEP 3 — IMAGES & MEDIA
         ====================================================== */

      media: {
        images: []
      },


      /* ======================================================
         STEP 4 — PRODUCT DETAILS
         ====================================================== */

      details: {
        longDescription: "",
        specifications: [],
        tags: []
      },


      /* ======================================================
         STEP 5 — SHIPPING
         ====================================================== */

      shipping: {
        weight: "",
        dimensions: {
          length: "",
          width: "",
          height: ""
        },
        shippingType: "",
        processingTime: ""
      },


      /* ======================================================
         STEP 6 — MORE OPTIONS
         ====================================================== */

      options: {
        variants: [],
        warranty: "",
        returnPolicy: "",
        minOrderQty: 1,
        isCodAllowed: true
      }

    },


    /* --------------------------------------------------------
       VALIDATION STATE
       -------------------------------------------------------- */

    validation: {
      step1: {
        valid: false,
        errors: []
      },

      step2: {
        valid: false,
        errors: []
      },

      step3: {
        valid: false,
        errors: []
      },

      step4: {
        valid: false,
        errors: []
      },

      step5: {
        valid: false,
        errors: []
      },

      step6: {
        valid: false,
        errors: []
      }
    }

  });


  /* ==========================================================
     STATE INSTANCE
     ========================================================== */

  let state = createInitialState();


  /* ==========================================================
     SUBSCRIBERS
     ========================================================== */

  const subscribers = new Set();


  /* ==========================================================
     GET STATE
     ========================================================== */

  const getState = () => state;


  /* ==========================================================
     SUBSCRIBE
     ----------------------------------------------------------
     Other modules can listen for state changes without directly
     controlling the state object.
     ========================================================== */

  const subscribe = (callback) => {

    if (typeof callback !== "function") {
      return () => {};
    }

    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  };


  /* ==========================================================
     NOTIFY
     ========================================================== */

  const notify = (change = {}) => {

    subscribers.forEach((callback) => {

      try {
        callback(state, change);
      } catch (error) {
        console.error(
          "[BazariaUpload] State subscriber error:",
          error
        );
      }

    });

  };


  /* ==========================================================
     SET CURRENT STEP
     ========================================================== */

  const setCurrentStep = (step) => {

    const numericStep = Number(step);

    if (
      !Number.isInteger(numericStep) ||
      numericStep < 0 ||
      numericStep > 7
    ) {
      console.warn(
        "[BazariaUpload] Invalid step:",
        step
      );

      return false;
    }

    const previousStep = state.currentStep;

    state.currentStep = numericStep;

    notify({
      type: "step-change",
      previousStep,
      currentStep: numericStep
    });

    return true;
  };


  /* ==========================================================
     SET PRODUCT TYPE
     ========================================================== */

  const setProductType = (type) => {

    if (type !== "single" && type !== "bulk") {
      console.warn(
        "[BazariaUpload] Invalid product type:",
        type
      );

      return false;
    }

    state.productType = type;
    state.isDirty = true;

    notify({
      type: "product-type-change",
      value: type
    });

    return true;
  };


  /* ==========================================================
     UPDATE PRODUCT SECTION
     ----------------------------------------------------------
     Used by step modules to update their own section.
     ========================================================== */

  const updateProductSection = (section, data) => {

    if (!section || typeof section !== "string") {
      return false;
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        state.product,
        section
      )
    ) {
      console.warn(
        "[BazariaUpload] Unknown product section:",
        section
      );

      return false;
    }

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return false;
    }

    state.product[section] = {
      ...state.product[section],
      ...data
    };

    state.isDirty = true;

    notify({
      type: "product-update",
      section,
      data
    });

    return true;
  };


  /* ==========================================================
     UPDATE BASIC INFORMATION
     ========================================================== */

  const updateBasicInfo = (data) => {
    return updateProductSection("basicInfo", data);
  };


  /* ==========================================================
     UPDATE PRICING
     ========================================================== */

  const updatePricing = (data) => {
    return updateProductSection("pricing", data);
  };


  /* ==========================================================
     UPDATE MEDIA
     ========================================================== */

  const setImages = (images) => {

    if (!Array.isArray(images)) {
      return false;
    }

    state.product.media.images = [...images];

    state.isDirty = true;

    notify({
      type: "images-update",
      images: state.product.media.images
    });

    return true;
  };


  /* ==========================================================
     UPDATE DETAILS
     ========================================================== */

  const updateDetails = (data) => {
    return updateProductSection("details", data);
  };


  /* ==========================================================
     UPDATE SHIPPING
     ========================================================== */

  const updateShipping = (data) => {
    return updateProductSection("shipping", data);
  };


  /* ==========================================================
     UPDATE OPTIONS
     ========================================================== */

  const updateOptions = (data) => {
    return updateProductSection("options", data);
  };


  /* ==========================================================
     SET VALIDATION RESULT
     ========================================================== */

  const setValidationResult = (
    step,
    valid,
    errors = []
  ) => {

    const stepKey = `step${step}`;

    if (
      !Object.prototype.hasOwnProperty.call(
        state.validation,
        stepKey
      )
    ) {
      console.warn(
        "[BazariaUpload] Invalid validation step:",
        step
      );

      return false;
    }

    state.validation[stepKey] = {
      valid: Boolean(valid),
      errors: Array.isArray(errors)
        ? [...errors]
        : []
    };

    notify({
      type: "validation-update",
      step,
      valid: Boolean(valid),
      errors: state.validation[stepKey].errors
    });

    return true;
  };


  /* ==========================================================
     GET VALIDATION RESULT
     ========================================================== */

  const getValidationResult = (step) => {

    const stepKey = `step${step}`;

    if (
      !Object.prototype.hasOwnProperty.call(
        state.validation,
        stepKey
      )
    ) {
      return null;
    }

    return state.validation[stepKey];
  };


  /* ==========================================================
     CHECK ALL STEPS
     ========================================================== */

  const areAllStepsValid = () => {

    return Object.values(state.validation)
      .every((result) => result.valid === true);

  };


  /* ==========================================================
     MARK INITIALIZED
     ========================================================== */

  const markInitialized = () => {

    state.isInitialized = true;

    notify({
      type: "initialized"
    });

  };


  /* ==========================================================
     MARK DIRTY
     ========================================================== */

  const markDirty = () => {

    state.isDirty = true;

    notify({
      type: "dirty"
    });

  };


  /* ==========================================================
     MARK CLEAN
     ========================================================== */

  const markClean = () => {

    state.isDirty = false;

    notify({
      type: "clean"
    });

  };


  /* ==========================================================
     UPLOADING STATE
     ========================================================== */

  const setUploading = (value) => {

    state.isUploading = Boolean(value);

    notify({
      type: "uploading-change",
      value: state.isUploading
    });

  };


  /* ==========================================================
     SAVING DRAFT STATE
     ========================================================== */

  const setSavingDraft = (value) => {

    state.isSavingDraft = Boolean(value);

    notify({
      type: "draft-saving-change",
      value: state.isSavingDraft
    });

  };


  /* ==========================================================
     RESET STATE
     ========================================================== */

  const reset = () => {

    state = createInitialState();

    notify({
      type: "reset"
    });

  };


  /* ==========================================================
     PUBLIC API
     ========================================================== */

  BazariaUpload.state = state;

  BazariaUpload.getState = getState;

  BazariaUpload.subscribe = subscribe;

  BazariaUpload.setCurrentStep = setCurrentStep;

  BazariaUpload.setProductType = setProductType;

  BazariaUpload.updateProductSection =
    updateProductSection;

  BazariaUpload.updateBasicInfo =
    updateBasicInfo;

  BazariaUpload.updatePricing =
    updatePricing;

  BazariaUpload.setImages =
    setImages;

  BazariaUpload.updateDetails =
    updateDetails;

  BazariaUpload.updateShipping =
    updateShipping;

  BazariaUpload.updateOptions =
    updateOptions;

  BazariaUpload.setValidationResult =
    setValidationResult;

  BazariaUpload.getValidationResult =
    getValidationResult;

  BazariaUpload.areAllStepsValid =
    areAllStepsValid;

  BazariaUpload.markInitialized =
    markInitialized;

  BazariaUpload.markDirty =
    markDirty;

  BazariaUpload.markClean =
    markClean;

  BazariaUpload.setUploading =
    setUploading;

  BazariaUpload.setSavingDraft =
    setSavingDraft;

  BazariaUpload.reset =
    reset;


  /* ==========================================================
     DEVELOPMENT HELPER
     ========================================================== */

  if (!window.BazariaUploadState) {
    window.BazariaUploadState = getState;
  }


  /* ==========================================================
     READY LOG
     ========================================================== */

  console.log(
    "[BazariaUpload] state.js initialized."
  );

})();