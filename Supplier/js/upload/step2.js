/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   step2.js
   ------------------------------------------------------------
   STEP 2 — PRICING & INVENTORY

   Responsibilities:
   - Cost Price
   - Selling Price
   - Discount Price
   - Profit Calculation
   - Stock Quantity
   - SKU
   - Auto SKU Generation
   - Sync Step 2 data with BazariaUpload state
   - Restore existing values from state

   This file does NOT:
   - Perform validation
   - Control step navigation
   - Handle media/images
   - Handle draft saving
   - Handle product publishing
   ============================================================ */

(function () {

  "use strict";


  /* ============================================================
     01. STEP 2 ELEMENT
     ============================================================ */

  const step2 =
    document.getElementById("uploadStep2");


  if (!step2) {
    return;
  }


  /* ============================================================
     02. PRICE ELEMENTS
     ============================================================ */

  const costPriceInput =
    document.getElementById("costPrice");

  const sellingPriceInput =
    document.getElementById("sellingPrice");

  const discountPriceInput =
    document.getElementById("discountPrice");

  const profitOutput =
    document.getElementById("calcProfit");


  /* ============================================================
     03. INVENTORY ELEMENTS
     ============================================================ */

  const stockQtyInput =
    document.getElementById("stockQty");


  /* ============================================================
     04. SKU ELEMENTS
     ============================================================ */

  const skuInput =
    document.getElementById("skuInput");

  const generateSkuButton =
    document.getElementById("btnGenerateSKU");


  /* ============================================================
     05. SAFETY CHECK
     ============================================================ */

  if (!window.BazariaUpload) {

    console.error(
      "BazariaUpload: step2.js requires state.js."
    );

    return;

  }


  /* ============================================================
     06. HELPER — MARK DIRTY
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
     07. HELPER — NORMALIZE NUMBER
     ============================================================ */

  function toNumber(value) {

    const number =
      Number.parseFloat(value);


    if (!Number.isFinite(number)) {
      return 0;
    }


    return number;

  }


  /* ============================================================
     08. HELPER — FORMAT MONEY
     ------------------------------------------------------------
     Keeps the displayed profit clean and readable.
     ============================================================ */

  function formatMoney(value) {

    if (!Number.isFinite(value)) {
      return "0";
    }


    return value
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1");

  }


  /* ============================================================
     09. PROFIT — CALCULATE
     ------------------------------------------------------------
     Profit is calculated from:

       Selling Price - Cost Price

     Discount price does not replace selling price here.
     It is stored independently and validated by validation.js.

     Later, if Bazaria introduces net-profit calculations
     after discounts, fees, tax or shipping, that logic can
     be added without changing the basic Step 2 structure.
     ============================================================ */

  function calculateProfit() {

    const cost =
      toNumber(
        costPriceInput
          ? costPriceInput.value
          : ""
      );


    const selling =
      toNumber(
        sellingPriceInput
          ? sellingPriceInput.value
          : ""
      );


    const profit =
      selling - cost;


    if (profitOutput) {

      profitOutput.textContent =
        formatMoney(profit);

    }


    return profit;

  }


  /* ============================================================
     10. STATE — UPDATE PRICING
     ============================================================ */

  function syncPricingToState() {

    BazariaUpload.updatePricing({

      costPrice:
        costPriceInput
          ? costPriceInput.value.trim()
          : "",

      sellingPrice:
        sellingPriceInput
          ? sellingPriceInput.value.trim()
          : "",

      discountPrice:
        discountPriceInput
          ? discountPriceInput.value.trim()
          : "",

      stockQty:
        stockQtyInput
          ? stockQtyInput.value.trim()
          : "",

      sku:
        skuInput
          ? skuInput.value.trim()
          : ""

    });


    calculateProfit();

    markDirty();

  }


  /* ============================================================
     11. PRICE INPUT EVENTS
     ============================================================ */

  [
    costPriceInput,
    sellingPriceInput,
    discountPriceInput,
    stockQtyInput,
    skuInput
  ].forEach(function (input) {

    if (!input) {
      return;
    }


    input.addEventListener(
      "input",
      function () {

        syncPricingToState();

      }
    );


    input.addEventListener(
      "change",
      function () {

        syncPricingToState();

      }
    );

  });


  /* ============================================================
     12. SKU — RANDOM SEGMENT
     ============================================================ */

  function randomSegment(length) {

    const characters =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let result = "";


    for (
      let index = 0;
      index < length;
      index++
    ) {

      const randomIndex =
        Math.floor(
          Math.random() *
          characters.length
        );


      result +=
        characters[randomIndex];

    }


    return result;

  }


  /* ============================================================
     13. SKU — CREATE PREFIX
     ------------------------------------------------------------
     Uses product/category information when available.

     Example:
       IPH-MOB-7K4P2
       SAM-ELE-9QX8M
       GEN-GEN-4KD7A
     ============================================================ */

  function createSkuPrefix() {

    const state =
      BazariaUpload.getState();


    const basicInfo =
      state &&
      state.product &&
      state.product.basicInfo
        ? state.product.basicInfo
        : {};


    const productName =
      String(
        basicInfo.productName || ""
      )
      .trim()
      .toUpperCase();


    const category =
      String(
        basicInfo.category || ""
      )
      .trim()
      .toUpperCase();


    let productPart =
      "GEN";


    let categoryPart =
      "GEN";


    if (productName) {

      const words =
        productName
          .replace(
            /[^A-Z0-9\s]/g,
            " "
          )
          .split(/\s+/)
          .filter(Boolean);


      if (words.length) {

        productPart =
          words
            .slice(0, 2)
            .map(function (word) {

              return word
                .slice(0, 3);

            })
            .join("")
            .slice(0, 6);

      }

    }


    if (category) {

      const categoryWords =
        category
          .replace(
            /[^A-Z0-9\s]/g,
            " "
          )
          .split(/\s+/)
          .filter(Boolean);


      if (categoryWords.length) {

        categoryPart =
          categoryWords
            .slice(0, 2)
            .map(function (word) {

              return word
                .slice(0, 3);

            })
            .join("")
            .slice(0, 6);

      }

    }


    return (
      productPart +
      "-" +
      categoryPart
    );

  }


  /* ============================================================
     14. SKU — GENERATE
     ============================================================ */

  function generateSKU() {

    const prefix =
      createSkuPrefix();


    const uniquePart =
      randomSegment(5);


    const sku =
      prefix +
      "-" +
      uniquePart;


    if (skuInput) {

      skuInput.value =
        sku;

    }


    BazariaUpload.updatePricing({

      sku: sku

    });


    markDirty();


    return sku;

  }


  /* ============================================================
     15. SKU — GENERATE BUTTON
     ============================================================ */

  if (generateSkuButton) {

    generateSkuButton.addEventListener(
      "click",
      function () {

        generateSKU();

      }
    );

  }


  /* ============================================================
     16. PROFIT — PUBLIC CALCULATION
     ============================================================ */

  function getProfit() {

    const cost =
      toNumber(
        costPriceInput
          ? costPriceInput.value
          : ""
      );


    const selling =
      toNumber(
        sellingPriceInput
          ? sellingPriceInput.value
          : ""
      );


    return selling - cost;

  }


  /* ============================================================
     17. GET CURRENT STEP 2 DATA
     ============================================================ */

  function getStep2Data() {

    return {

      costPrice:
        costPriceInput
          ? costPriceInput.value.trim()
          : "",

      sellingPrice:
        sellingPriceInput
          ? sellingPriceInput.value.trim()
          : "",

      discountPrice:
        discountPriceInput
          ? discountPriceInput.value.trim()
          : "",

      stockQty:
        stockQtyInput
          ? stockQtyInput.value.trim()
          : "",

      sku:
        skuInput
          ? skuInput.value.trim()
          : "",

      profit:
        getProfit()

    };

  }


  /* ============================================================
     18. RESTORE FROM STATE
     ------------------------------------------------------------
     State remains the source of truth.
     ============================================================ */

  function restoreFromState() {

    const state =
      BazariaUpload.getState();


    if (
      !state ||
      !state.product ||
      !state.product.pricing
    ) {

      return;

    }


    const pricing =
      state.product.pricing;


    /* ---------------- COST ---------------- */

    if (
      costPriceInput &&
      pricing.costPrice !== undefined &&
      pricing.costPrice !== null
    ) {

      costPriceInput.value =
        pricing.costPrice;

    }


    /* ---------------- SELLING ---------------- */

    if (
      sellingPriceInput &&
      pricing.sellingPrice !== undefined &&
      pricing.sellingPrice !== null
    ) {

      sellingPriceInput.value =
        pricing.sellingPrice;

    }


    /* ---------------- DISCOUNT ---------------- */

    if (
      discountPriceInput &&
      pricing.discountPrice !== undefined &&
      pricing.discountPrice !== null
    ) {

      discountPriceInput.value =
        pricing.discountPrice;

    }


    /* ---------------- STOCK ---------------- */

    if (
      stockQtyInput &&
      pricing.stockQty !== undefined &&
      pricing.stockQty !== null
    ) {

      stockQtyInput.value =
        pricing.stockQty;

    }


    /* ---------------- SKU ---------------- */

    if (
      skuInput &&
      pricing.sku !== undefined &&
      pricing.sku !== null
    ) {

      skuInput.value =
        pricing.sku;

    }


    calculateProfit();

  }


  /* ============================================================
     19. SYNC EXISTING HTML VALUES
     ------------------------------------------------------------
     Useful if values already exist in HTML before this
     module initializes.
     ============================================================ */

  function syncExistingHTMLValues() {

    const state =
      BazariaUpload.getState();


    if (!state) {
      return;
    }


    const pricing =
      state.product.pricing;


    if (
      !pricing.costPrice &&
      costPriceInput &&
      costPriceInput.value.trim()
    ) {

      pricing.costPrice =
        costPriceInput.value.trim();

    }


    if (
      !pricing.sellingPrice &&
      sellingPriceInput &&
      sellingPriceInput.value.trim()
    ) {

      pricing.sellingPrice =
        sellingPriceInput.value.trim();

    }


    if (
      !pricing.discountPrice &&
      discountPriceInput &&
      discountPriceInput.value.trim()
    ) {

      pricing.discountPrice =
        discountPriceInput.value.trim();

    }


    if (
      !pricing.stockQty &&
      stockQtyInput &&
      stockQtyInput.value.trim()
    ) {

      pricing.stockQty =
        stockQtyInput.value.trim();

    }


    if (
      !pricing.sku &&
      skuInput &&
      skuInput.value.trim()
    ) {

      pricing.sku =
        skuInput.value.trim();

    }


    calculateProfit();

  }


  /* ============================================================
     20. INITIALIZE STEP 2
     ============================================================ */

  function init() {

    syncExistingHTMLValues();

    restoreFromState();

    calculateProfit();

  }


  /* ============================================================
     21. PUBLIC STEP 2 API
     ------------------------------------------------------------
     Only Step 2 functionality is exposed.
     ============================================================ */

  window.BazariaStep2 = {

    calculateProfit:

      calculateProfit,


    getProfit:

      getProfit,


    generateSKU:

      generateSKU,


    getData:

      getStep2Data,


    restore:

      restoreFromState

  };


  /* ============================================================
     22. START
     ============================================================ */

  init();


})();