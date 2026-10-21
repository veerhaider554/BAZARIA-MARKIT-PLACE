/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   validation.js
   ------------------------------------------------------------
   CENTRAL VALIDATION ENGINE
   Validates Steps 1–6 and stores results in state.js.
   ------------------------------------------------------------
   IMPORTANT:
   - No navigation logic here.
   - No step switching here.
   - No upload logic here.
   - No duplicate state here.
   ============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     NAMESPACE
     ========================================================== */

  const BazariaUpload = window.BazariaUpload;

  if (!BazariaUpload) {
    console.error(
      "[BazariaUpload] validation.js requires state.js."
    );
    return;
  }


  /* ==========================================================
     HELPERS
     ========================================================== */

  const normalizeString = (value) => {
    return String(value ?? "").trim();
  };


  const isPositiveNumber = (value) => {

    if (value === "" || value === null || value === undefined) {
      return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number > 0;
  };


  const isNonNegativeNumber = (value) => {

    if (value === "" || value === null || value === undefined) {
      return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0;
  };


  const isPositiveInteger = (value) => {

    if (value === "" || value === null || value === undefined) {
      return false;
    }

    const number = Number(value);

    return (
      Number.isInteger(number) &&
      number >= 1
    );
  };


  const isNonNegativeInteger = (value) => {

    if (value === "" || value === null || value === undefined) {
      return false;
    }

    const number = Number(value);

    return (
      Number.isInteger(number) &&
      number >= 0
    );
  };


  const createError = (field, message) => ({
    field,
    message
  });


  /* ==========================================================
     SAVE RESULT
     ========================================================== */

  const saveResult = (step, errors) => {

    const valid = errors.length === 0;

    BazariaUpload.setValidationResult(
      step,
      valid,
      errors
    );

    return {
      step,
      valid,
      errors
    };
  };


  /* ==========================================================
     STEP 1 — BASIC INFORMATION
     ========================================================== */

  const validateStep1 = () => {

    const state = BazariaUpload.getState();

    const basicInfo = state.product.basicInfo;

    const errors = [];


    /* --------------------------------------------------------
       Product Name
       -------------------------------------------------------- */

    const productName =
      normalizeString(basicInfo.productName);

    if (!productName) {

      errors.push(
        createError(
          "productName",
          "Product name is required."
        )
      );

    } else if (productName.length > 120) {

      errors.push(
        createError(
          "productName",
          "Product name cannot exceed 120 characters."
        )
      );

    }


    /* --------------------------------------------------------
       Brand
       -------------------------------------------------------- */

    const brand =
      normalizeString(basicInfo.brand);

    if (!brand) {

      errors.push(
        createError(
          "brand",
          "Please select a brand."
        )
      );

    }


    /* --------------------------------------------------------
       Category
       -------------------------------------------------------- */

    const category =
      normalizeString(basicInfo.category);

    if (!category) {

      errors.push(
        createError(
          "category",
          "Please select a category."
        )
      );

    }


    /* --------------------------------------------------------
       Condition
       -------------------------------------------------------- */

    const allowedConditions = [
      "new",
      "used",
      "refurbished"
    ];

    if (
      !allowedConditions.includes(
        basicInfo.condition
      )
    ) {

      errors.push(
        createError(
          "condition",
          "Please select a valid product condition."
        )
      );

    }


    /* --------------------------------------------------------
       Short Description
       -------------------------------------------------------- */

    const shortDescription =
      normalizeString(basicInfo.shortDescription);

    if (!shortDescription) {

      errors.push(
        createError(
          "shortDescription",
          "Short description is required."
        )
      );

    } else if (shortDescription.length > 120) {

      errors.push(
        createError(
          "shortDescription",
          "Short description cannot exceed 120 characters."
        )
      );

    }


    return saveResult(1, errors);
  };


  /* ==========================================================
     STEP 2 — PRICING & STOCK
     ========================================================== */

  const validateStep2 = () => {

    const state = BazariaUpload.getState();

    const pricing = state.product.pricing;

    const errors = [];


    /* --------------------------------------------------------
       Cost Price
       -------------------------------------------------------- */

    if (!isNonNegativeNumber(pricing.costPrice)) {

      errors.push(
        createError(
          "costPrice",
          "Please enter a valid cost price."
        )
      );

    }


    /* --------------------------------------------------------
       Selling Price
       -------------------------------------------------------- */

    if (!isPositiveNumber(pricing.sellingPrice)) {

      errors.push(
        createError(
          "sellingPrice",
          "Please enter a valid selling price."
        )
      );

    }


    /* --------------------------------------------------------
       Cost vs Selling Price
       -------------------------------------------------------- */

    if (
      isNonNegativeNumber(pricing.costPrice) &&
      isPositiveNumber(pricing.sellingPrice)
    ) {

      const costPrice =
        Number(pricing.costPrice);

      const sellingPrice =
        Number(pricing.sellingPrice);

      if (sellingPrice < costPrice) {

        errors.push(
          createError(
            "sellingPrice",
            "Selling price cannot be lower than cost price."
          )
        );

      }

    }


    /* --------------------------------------------------------
       Discount Price
       -------------------------------------------------------- */

    if (
      normalizeString(pricing.discountPrice) !== ""
    ) {

      if (
        !isNonNegativeNumber(
          pricing.discountPrice
        )
      ) {

        errors.push(
          createError(
            "discountPrice",
            "Please enter a valid discount price."
          )
        );

      } else if (
        isPositiveNumber(pricing.sellingPrice) &&
        Number(pricing.discountPrice) >=
        Number(pricing.sellingPrice)
      ) {

        errors.push(
          createError(
            "discountPrice",
            "Discount price must be lower than selling price."
          )
        );

      }

    }


    /* --------------------------------------------------------
       Stock Quantity
       -------------------------------------------------------- */

    if (
      !isNonNegativeInteger(
        pricing.stockQty
      )
    ) {

      errors.push(
        createError(
          "stockQty",
          "Please enter a valid stock quantity."
        )
      );

    }


    /* --------------------------------------------------------
       SKU
       -------------------------------------------------------- */

    const sku =
      normalizeString(pricing.sku);

    if (sku.length > 50) {

      errors.push(
        createError(
          "sku",
          "SKU cannot exceed 50 characters."
        )
      );

    }


    return saveResult(2, errors);
  };


  /* ==========================================================
     STEP 3 — IMAGES & MEDIA
     ========================================================== */

  const validateStep3 = () => {

    const state = BazariaUpload.getState();

    const media = state.product.media;

    const errors = [];


    /* --------------------------------------------------------
       Product Images
       -------------------------------------------------------- */

    if (
      !Array.isArray(media.images) ||
      media.images.length === 0
    ) {

      errors.push(
        createError(
          "images",
          "Please add at least one product image."
        )
      );

    }


    return saveResult(3, errors);
  };


  /* ==========================================================
     STEP 4 — PRODUCT DETAILS
     ========================================================== */

  const validateStep4 = () => {

    const state = BazariaUpload.getState();

    const details = state.product.details;

    const errors = [];


    /* --------------------------------------------------------
       Long Description
       --------------------------------------------------------
       Optional in the current HTML.
       We only enforce the 2000-character limit.
       -------------------------------------------------------- */

    const longDescription =
      normalizeString(details.longDescription);

    if (longDescription.length > 2000) {

      errors.push(
        createError(
          "longDescription",
          "Product description cannot exceed 2000 characters."
        )
      );

    }


    /* --------------------------------------------------------
       Specifications
       -------------------------------------------------------- */

    if (!Array.isArray(details.specifications)) {

      errors.push(
        createError(
          "specifications",
          "Specifications data is invalid."
        )
      );

    }


    /* --------------------------------------------------------
       Tags
       -------------------------------------------------------- */

    if (!Array.isArray(details.tags)) {

      errors.push(
        createError(
          "tags",
          "Tags data is invalid."
        )
      );

    }


    /* --------------------------------------------------------
       Tag Length
       -------------------------------------------------------- */

    if (Array.isArray(details.tags)) {

      details.tags.forEach((tag, index) => {

        const normalizedTag =
          normalizeString(tag);

        if (normalizedTag.length > 30) {

          errors.push(
            createError(
              `tag-${index}`,
              "Each tag cannot exceed 30 characters."
            )
          );

        }

      });

    }


    return saveResult(4, errors);
  };


  /* ==========================================================
     STEP 5 — SHIPPING INFORMATION
     ========================================================== */

  const validateStep5 = () => {

    const state = BazariaUpload.getState();

    const shipping = state.product.shipping;

    const errors = [];


    /* --------------------------------------------------------
       Weight
       -------------------------------------------------------- */

    if (
      !isNonNegativeNumber(
        shipping.weight
      )
    ) {

      errors.push(
        createError(
          "weight",
          "Please enter a valid product weight."
        )
      );

    }


    /* --------------------------------------------------------
       Dimensions
       -------------------------------------------------------- */

    const dimensions =
      shipping.dimensions || {};

    const dimensionFields = [
      {
        key: "length",
        label: "Length"
      },
      {
        key: "width",
        label: "Width"
      },
      {
        key: "height",
        label: "Height"
      }
    ];


    dimensionFields.forEach((dimension) => {

      const value =
        normalizeString(
          dimensions[dimension.key]
        );

      /*
       * Dimensions are optional in the current HTML.
       * If supplied, they must be valid non-negative numbers.
       */

      if (
        value !== "" &&
        !isNonNegativeNumber(value)
      ) {

        errors.push(
          createError(
            dimension.key,
            `${dimension.label} must be a valid number.`
          )
        );

      }

    });


    /* --------------------------------------------------------
       Shipping Type
       -------------------------------------------------------- */

    const allowedShippingTypes = [
      "flat_rate",
      "calculated",
      "local_pickup"
    ];

    if (
      !allowedShippingTypes.includes(
        shipping.shippingType
      )
    ) {

      errors.push(
        createError(
          "shippingType",
          "Please select a valid shipping type."
        )
      );

    }


    /* --------------------------------------------------------
       Processing Time
       -------------------------------------------------------- */

    const allowedProcessingTimes = [
      "1",
      "2",
      "3",
      "7"
    ];

    if (
      !allowedProcessingTimes.includes(
        String(shipping.processingTime)
      )
    ) {

      errors.push(
        createError(
          "processingTime",
          "Please select a valid processing time."
        )
      );

    }


    return saveResult(5, errors);
  };


  /* ==========================================================
     STEP 6 — MORE OPTIONS
     ========================================================== */

  const validateStep6 = () => {

    const state = BazariaUpload.getState();

    const options = state.product.options;

    const errors = [];


    /* --------------------------------------------------------
       Variants
       -------------------------------------------------------- */

    if (!Array.isArray(options.variants)) {

      errors.push(
        createError(
          "variants",
          "Variants data is invalid."
        )
      );

    }


    /* --------------------------------------------------------
       Warranty
       -------------------------------------------------------- */

    const warranty =
      normalizeString(options.warranty);

    if (warranty.length > 100) {

      errors.push(
        createError(
          "warranty",
          "Warranty information cannot exceed 100 characters."
        )
      );

    }


    /* --------------------------------------------------------
       Return Policy
       -------------------------------------------------------- */

    const returnPolicy =
      normalizeString(options.returnPolicy);

    if (returnPolicy.length > 100) {

      errors.push(
        createError(
          "returnPolicy",
          "Return policy cannot exceed 100 characters."
        )
      );

    }


    /* --------------------------------------------------------
       Minimum Order Quantity
       -------------------------------------------------------- */

    if (
      !isPositiveInteger(
        options.minOrderQty
      )
    ) {

      errors.push(
        createError(
          "minOrderQty",
          "Minimum order quantity must be at least 1."
        )
      );

    }


    /* --------------------------------------------------------
       COD
       --------------------------------------------------------
       Boolean value is valid when true or false.
       -------------------------------------------------------- */

    if (
      typeof options.isCodAllowed !== "boolean"
    ) {

      errors.push(
        createError(
          "isCodAllowed",
          "COD setting is invalid."
        )
      );

    }


    return saveResult(6, errors);
  };


  /* ==========================================================
     VALIDATE SINGLE STEP
     ========================================================== */

  const validateStep = (step) => {

    switch (Number(step)) {

      case 1:
        return validateStep1();

      case 2:
        return validateStep2();

      case 3:
        return validateStep3();

      case 4:
        return validateStep4();

      case 5:
        return validateStep5();

      case 6:
        return validateStep6();

      default:

        console.warn(
          "[BazariaUpload] Cannot validate step:",
          step
        );

        return {
          step,
          valid: false,
          errors: [
            createError(
              "step",
              "Invalid validation step."
            )
          ]
        };

    }

  };


  /* ==========================================================
     VALIDATE ALL STEPS
     ========================================================== */

  const validateAll = () => {

    const results = [
      validateStep1(),
      validateStep2(),
      validateStep3(),
      validateStep4(),
      validateStep5(),
      validateStep6()
    ];


    const errors = results.flatMap(
      (result) => result.errors
    );


    const valid =
      results.every(
        (result) => result.valid
      );


    return {
      valid,
      errors,
      steps: results
    };

  };


  /* ==========================================================
     GET FIRST INVALID STEP
     ========================================================== */

  const getFirstInvalidStep = () => {

    const state = BazariaUpload.getState();


    for (let step = 1; step <= 6; step++) {

      const result =
        state.validation[`step${step}`];

      if (!result || result.valid !== true) {
        return step;
      }

    }


    return null;
  };


  /* ==========================================================
     PUBLIC VALIDATION API
     ========================================================== */

  BazariaUpload.validation = {

    validateStep,

    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    validateStep6,

    validateAll,

    getFirstInvalidStep

  };


  /* ==========================================================
     READY
     ========================================================== */

  console.log(
    "[BazariaUpload] validation.js initialized."
  );

})();