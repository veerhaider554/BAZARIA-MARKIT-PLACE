/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   step1.js
   ------------------------------------------------------------
   STEP 1 — BASIC INFORMATION

   Responsibilities:
   - Product Name
   - Brand selection
   - Brand search / browse
   - Category selection
   - Category search / browse
   - Sub-category selection
   - Condition selection
   - Short Description
   - Character counter
   - Sync Step 1 data with BazariaUpload state

   This file does NOT:
   - Control step navigation
   - Perform validation
   - Handle upload
   - Handle draft saving
   ============================================================ */

(function () {

  "use strict";


  /* ============================================================
     01. SAFETY CHECK
     ============================================================ */

  if (!window.BazariaUpload) {
    console.error(
      "BazariaUpload: step1.js requires state.js."
    );
    return;
  }


  const step1 =
    document.getElementById("uploadStep1");


  if (!step1) {
    return;
  }


  /* ============================================================
     02. PRODUCT NAME ELEMENT
     ============================================================ */

  const productNameInput =
    document.getElementById("productName");


  /* ============================================================
     03. BRAND ELEMENTS
     ============================================================ */

  const brandTrigger =
    document.getElementById(
      "productBrandTrigger"
    );

  const brandDisplay =
    document.getElementById(
      "productBrandDisplay"
    );

  const brandInput =
    document.getElementById(
      "productBrand"
    );

  const brandPicker =
    document.getElementById(
      "brandPicker"
    );

  const closeBrandPicker =
    document.getElementById(
      "closeBrandPicker"
    );

  const brandSearchInput =
    document.getElementById(
      "brandSearchInput"
    );

  const clearBrandSearch =
    document.getElementById(
      "clearBrandSearch"
    );

  const brandSearchResults =
    document.getElementById(
      "brandSearchResults"
    );

  const brandResultList =
    document.getElementById(
      "brandResultList"
    );

  const popularBrandGrid =
    document.getElementById(
      "popularBrandGrid"
    );

  const brandList =
    document.getElementById(
      "brandList"
    );


  /* ============================================================
     04. CATEGORY ELEMENTS
     ============================================================ */

  const categoryTrigger =
    document.getElementById(
      "productCategoryTrigger"
    );

  const categoryDisplay =
    document.getElementById(
      "productCategoryDisplay"
    );

  const categoryInput =
    document.getElementById(
      "productCategory"
    );

  const subCategoryInput =
    document.getElementById(
      "productSubCategory"
    );

  const categoryPicker =
    document.getElementById(
      "categoryPicker"
    );

  const closeCategoryPicker =
    document.getElementById(
      "closeCategoryPicker"
    );

  const categorySearchInput =
    document.getElementById(
      "categorySearchInput"
    );

  const clearCategorySearch =
    document.getElementById(
      "clearCategorySearch"
    );

  const categorySearchResults =
    document.getElementById(
      "categorySearchResults"
    );

  const categoryResultList =
    document.getElementById(
      "categoryResultList"
    );

  const selectedCategoryPath =
    document.getElementById(
      "selectedCategoryPath"
    );

  const clearCategorySelection =
    document.getElementById(
      "clearCategorySelection"
    );

  const searchCategoriesAction =
    document.getElementById(
      "searchCategoriesAction"
    );

  const categoryList =
    document.getElementById(
      "categoryList"
    );

  const categoryChildrenSection =
    document.getElementById(
      "categoryChildrenSection"
    );

  const categoryChildrenTitle =
    document.getElementById(
      "categoryChildrenTitle"
    );

  const categoryChildrenBack =
    document.getElementById(
      "categoryChildrenBack"
    );

  const categoryChildrenList =
    document.getElementById(
      "categoryChildrenList"
    );

  const categoryFinalSection =
    document.getElementById(
      "categoryFinalSection"
    );

  const confirmCategorySelection =
    document.getElementById(
      "confirmCategorySelection"
    );


  /* ============================================================
     05. CONDITION ELEMENTS
     ============================================================ */

  const conditionInput =
    document.getElementById(
      "productCondition"
    );

  const conditionButtons =
    step1.querySelectorAll(
      ".segment-btn"
    );


  /* ============================================================
     06. SHORT DESCRIPTION ELEMENTS
     ============================================================ */

  const shortDescriptionInput =
    document.getElementById(
      "shortDescription"
    );

  const descCharCount =
    document.getElementById(
      "descCharCount"
    );


  /* ============================================================
     07. INTERNAL UI STATE
     ============================================================ */

  let lastFocusedElement = null;


  let selectedCategory = {
    parentId: "",
    parentLabel: "",
    childId: "",
    childLabel: ""
  };


  /* ============================================================
     08. BRAND DATA
     ------------------------------------------------------------
     Local dataset for now.

     Later:
     API / database data can replace this array
     without changing picker logic.
     ============================================================ */

  const brands = [

    {
      id: "adidas",
      label: "Adidas"
    },

    {
      id: "apple",
      label: "Apple"
    },

    {
      id: "asus",
      label: "Asus"
    },

    {
      id: "samsung",
      label: "Samsung"
    },

    {
      id: "xiaomi",
      label: "Xiaomi"
    },

    {
      id: "nike",
      label: "Nike"
    },

    {
      id: "bsc",
      label: "BSC"
    },

    {
      id: "levi",
      label: "Levi's"
    }

  ];


  /* ============================================================
     09. CATEGORY DATA
     ------------------------------------------------------------
     Initial local category structure.

     Parent → Child structure is kept compatible with
     the current HTML and picker architecture.

     More hierarchy can be added later without changing
     the core picker system.
     ============================================================ */

  const categories = [

    {
      id: "electronics",
      label: "Electronics",

      children: [

        {
          id: "mobile-phones",
          label: "Mobile Phones"
        },

        {
          id: "laptops",
          label: "Laptops"
        },

        {
          id: "tablets",
          label: "Tablets"
        },

        {
          id: "headphones",
          label: "Headphones"
        },

        {
          id: "cameras",
          label: "Cameras"
        }

      ]
    },


    {
      id: "fashion",
      label: "Fashion",

      children: [

        {
          id: "mens-clothing",
          label: "Men's Clothing"
        },

        {
          id: "womens-clothing",
          label: "Women's Clothing"
        },

        {
          id: "shoes",
          label: "Shoes"
        },

        {
          id: "bags",
          label: "Bags"
        },

        {
          id: "accessories",
          label: "Accessories"
        }

      ]
    },


    {
      id: "home-lifestyle",
      label: "Home & Lifestyle",

      children: [

        {
          id: "furniture",
          label: "Furniture"
        },

        {
          id: "kitchen",
          label: "Kitchen"
        },

        {
          id: "home-decor",
          label: "Home Decor"
        },

        {
          id: "lighting",
          label: "Lighting"
        },

        {
          id: "garden",
          label: "Garden"
        }

      ]
    },


    {
      id: "beauty",
      label: "Beauty",

      children: [

        {
          id: "skincare",
          label: "Skincare"
        },

        {
          id: "makeup",
          label: "Makeup"
        },

        {
          id: "hair-care",
          label: "Hair Care"
        },

        {
          id: "fragrance",
          label: "Fragrance"
        }

      ]
    }

  ];


  /* ============================================================
     10. HELPER — ESCAPE HTML
     ============================================================ */

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* ============================================================
     11. HELPER — MARK STEP DIRTY
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
     12. HELPER — NOTIFY CHANGE
     ------------------------------------------------------------
     Used for hidden picker inputs so other systems can
     observe the value change if needed.
     ============================================================ */

  function notifyChange(element) {

    if (!element) {
      return;
    }

    element.dispatchEvent(
      new Event("change", {
        bubbles: true
      })
    );

  }


  /* ============================================================
     13. BODY SCROLL LOCK
     ============================================================ */

  function lockBody() {

    document.body.classList.add(
      "picker-open"
    );

  }


  function unlockBody() {

    document.body.classList.remove(
      "picker-open"
    );

  }


  /* ============================================================
     14. OPEN PICKER
     ============================================================ */

  function openPicker(
    picker,
    trigger
  ) {

    if (!picker) {
      return;
    }

    lastFocusedElement =
      trigger ||
      document.activeElement;

    picker.hidden = false;

    lockBody();


    const focusable =
      picker.querySelector(
        "input, button"
      );


    if (focusable) {

      requestAnimationFrame(
        function () {

          focusable.focus();

        }
      );

    }

  }


  /* ============================================================
     15. CLOSE PICKER
     ============================================================ */

  function closePicker(picker) {

    if (!picker) {
      return;
    }

    picker.hidden = true;

    unlockBody();


    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
      "function"
    ) {

      requestAnimationFrame(
        function () {

          lastFocusedElement.focus();

        }
      );

    }

    lastFocusedElement = null;

  }


  /* ============================================================
     16. BRAND — FIND
     ============================================================ */

  function findBrand(id) {

    return brands.find(
      function (brand) {

        return brand.id === id;

      }
    ) || null;

  }


  /* ============================================================
     17. BRAND — SET
     ============================================================ */

  function setBrand(brand) {

    if (!brand) {
      return;
    }


    if (brandInput) {

      brandInput.value =
        brand.id;

      notifyChange(
        brandInput
      );

    }


    if (brandDisplay) {

      brandDisplay.textContent =
        brand.label;

    }


    if (brandTrigger) {

      brandTrigger.classList.add(
        "has-value"
      );

      brandTrigger.setAttribute(
        "aria-expanded",
        "false"
      );

    }


    BazariaUpload.updateBasicInfo({

      brand: brand.id

    });


    markDirty();

    clearBrandSearchInput();

    closePicker(
      brandPicker
    );

  }


  /* ============================================================
     18. BRAND — SEARCH
     ============================================================ */

  function searchBrands(query) {

    const search =
      query
        .trim()
        .toLowerCase();


    if (!search) {

      hideBrandSearchResults();

      return;

    }


    const results =
      brands.filter(
        function (brand) {

          return brand.label
            .toLowerCase()
            .includes(search);

        }
      );


    renderBrandResults(
      results
    );

  }


  /* ============================================================
     19. BRAND — RENDER RESULTS
     ============================================================ */

  function renderBrandResults(
    results
  ) {

    if (
      !brandResultList ||
      !brandSearchResults
    ) {

      return;

    }


    brandResultList.innerHTML =
      "";

    brandSearchResults.hidden =
      false;


    if (!results.length) {

      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "picker-empty-state";

      empty.textContent =
        "No brands found.";

      brandResultList.appendChild(
        empty
      );

      return;

    }


    results.forEach(
      function (brand) {

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "picker-result-item";


        button.innerHTML = `
          <span>
            ${escapeHTML(brand.label)}
          </span>

          <span class="brand-list-arrow">
            ›
          </span>
        `;


        button.addEventListener(
          "click",
          function () {

            setBrand(brand);

          }
        );


        brandResultList.appendChild(
          button
        );

      }
    );

  }


  /* ============================================================
     20. BRAND — HIDE SEARCH RESULTS
     ============================================================ */

  function hideBrandSearchResults() {

    if (brandSearchResults) {

      brandSearchResults.hidden =
        true;

    }


    if (brandResultList) {

      brandResultList.innerHTML =
        "";

    }

  }


  /* ============================================================
     21. BRAND — CLEAR SEARCH
     ============================================================ */

  function clearBrandSearchInput() {

    if (brandSearchInput) {

      brandSearchInput.value =
        "";

    }


    if (clearBrandSearch) {

      clearBrandSearch.hidden =
        true;

    }


    hideBrandSearchResults();

  }


  /* ============================================================
     22. BRAND — CLEAR BUTTON STATE
     ============================================================ */

  function updateBrandClearButton() {

    if (
      !brandSearchInput ||
      !clearBrandSearch
    ) {

      return;

    }


    clearBrandSearch.hidden =
      brandSearchInput.value
        .trim() === "";

  }


  /* ============================================================
     23. BRAND — CLEAR SELECTED BRAND
     ============================================================ */

  function clearBrand() {

    if (brandInput) {

      brandInput.value =
        "";

      notifyChange(
        brandInput
      );

    }


    if (brandDisplay) {

      brandDisplay.textContent =
        "Select brand";

    }


    if (brandTrigger) {

      brandTrigger.classList.remove(
        "has-value"
      );

      brandTrigger.setAttribute(
        "aria-expanded",
        "false"
      );

    }


    BazariaUpload.updateBasicInfo({

      brand: ""

    });


    markDirty();

  }


  /* ============================================================
     24. CATEGORY — FIND PARENT
     ============================================================ */

  function findCategory(id) {

    return categories.find(
      function (category) {

        return category.id === id;

      }
    ) || null;

  }


  /* ============================================================
     25. CATEGORY — FIND CHILD
     ============================================================ */

  function findChild(
    parentId,
    childId
  ) {

    const parent =
      findCategory(parentId);


    if (!parent) {
      return null;
    }


    return parent.children.find(
      function (child) {

        return child.id === childId;

      }
    ) || null;

  }


  /* ============================================================
     26. CATEGORY — RESET CHILDREN UI
     ============================================================ */

  function resetCategoryChildren() {

    if (categoryChildrenSection) {

      categoryChildrenSection.hidden =
        true;

    }


    if (categoryChildrenList) {

      categoryChildrenList.innerHTML =
        "";

    }


    if (categoryFinalSection) {

      categoryFinalSection.hidden =
        true;

    }

  }


  /* ============================================================
     27. CATEGORY — SHOW CHILDREN
     ============================================================ */

  function showCategoryChildren(
    category
  ) {

    if (
      !category ||
      !categoryChildrenSection ||
      !categoryChildrenList
    ) {

      return;

    }


    categoryChildrenList.innerHTML =
      "";


    if (categoryChildrenTitle) {

      categoryChildrenTitle.textContent =
        "Select " +
        category.label;

    }


    category.children.forEach(
      function (child) {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";

        button.className =
          "category-list-item";


        button.dataset.category =
          child.id;

        button.dataset.categoryParent =
          category.id;

        button.dataset.categoryLabel =
          child.label;


        button.innerHTML = `
          <span class="category-list-content">

            <span class="category-list-title">
              ${escapeHTML(child.label)}
            </span>

          </span>

          <span class="category-list-arrow">
            ›
          </span>
        `;


        button.addEventListener(
          "click",
          function () {

            selectCategoryChild(
              category,
              child
            );

          }
        );


        categoryChildrenList.appendChild(
          button
        );

      }
    );


    categoryChildrenSection.hidden =
      false;


    if (categoryFinalSection) {

      categoryFinalSection.hidden =
        true;

    }

  }


  /* ============================================================
     28. CATEGORY — SELECT PARENT
     ============================================================ */

  function selectCategoryParent(
    category
  ) {

    if (!category) {
      return;
    }


    selectedCategory.parentId =
      category.id;

    selectedCategory.parentLabel =
      category.label;

    selectedCategory.childId =
      "";

    selectedCategory.childLabel =
      "";


    updateSelectedCategoryPath();

    showCategoryChildren(
      category
    );

    scrollToCategoryChildren();

  }


  /* ============================================================
     29. CATEGORY — SELECT CHILD
     ============================================================ */

  function selectCategoryChild(
    parent,
    child
  ) {

    if (
      !parent ||
      !child
    ) {

      return;

    }


    selectedCategory.parentId =
      parent.id;

    selectedCategory.parentLabel =
      parent.label;

    selectedCategory.childId =
      child.id;

    selectedCategory.childLabel =
      child.label;


    updateSelectedCategoryPath();


    if (categoryFinalSection) {

      categoryFinalSection.hidden =
        false;

    }


    if (categoryChildrenSection) {

      categoryChildrenSection.hidden =
        false;

    }


    scrollToCategoryFinal();

  }


  /* ============================================================
     30. CATEGORY — UPDATE PATH
     ============================================================ */

  function updateSelectedCategoryPath() {

    if (!selectedCategoryPath) {
      return;
    }


    if (!selectedCategory.parentLabel) {

      selectedCategoryPath.textContent =
        "No category selected";

      selectedCategoryPath.classList.remove(
        "has-selection"
      );

      return;

    }


    if (
      selectedCategory.childLabel
    ) {

      selectedCategoryPath.textContent =
        selectedCategory.parentLabel +
        " › " +
        selectedCategory.childLabel;

    } else {

      selectedCategoryPath.textContent =
        selectedCategory.parentLabel;

    }


    selectedCategoryPath.classList.add(
      "has-selection"
    );

  }


  /* ============================================================
     31. CATEGORY — CONFIRM
     ============================================================ */

  function confirmCategory() {

    if (
      !selectedCategory.parentId ||
      !selectedCategory.childId
    ) {

      return;

    }


    if (categoryInput) {

      categoryInput.value =
        selectedCategory.parentId;

      notifyChange(
        categoryInput
      );

    }


    if (subCategoryInput) {

      subCategoryInput.value =
        selectedCategory.childId;

      notifyChange(
        subCategoryInput
      );

    }


    if (categoryDisplay) {

      categoryDisplay.textContent =
        selectedCategory.parentLabel +
        " › " +
        selectedCategory.childLabel;

    }


    if (categoryTrigger) {

      categoryTrigger.classList.add(
        "has-value"
      );

      categoryTrigger.setAttribute(
        "aria-expanded",
        "false"
      );

    }


    BazariaUpload.updateBasicInfo({

      category:
        selectedCategory.parentId,

      subCategory:
        selectedCategory.childId

    });


    markDirty();


    closePicker(
      categoryPicker
    );


    resetCategoryPickerState();

  }


  /* ============================================================
     32. CATEGORY — CLEAR
     ============================================================ */

  function clearCategory() {

    selectedCategory.parentId =
      "";

    selectedCategory.parentLabel =
      "";

    selectedCategory.childId =
      "";

    selectedCategory.childLabel =
      "";


    if (categoryInput) {

      categoryInput.value =
        "";

      notifyChange(
        categoryInput
      );

    }


    if (subCategoryInput) {

      subCategoryInput.value =
        "";

      notifyChange(
        subCategoryInput
      );

    }


    if (categoryDisplay) {

      categoryDisplay.textContent =
        "Select category";

    }


    if (categoryTrigger) {

      categoryTrigger.classList.remove(
        "has-value"
      );

    }


    BazariaUpload.updateBasicInfo({

      category: "",
      subCategory: ""

    });


    markDirty();


    updateSelectedCategoryPath();

    resetCategoryChildren();

  }


  /* ============================================================
     33. CATEGORY — RESET PICKER
     ============================================================ */

  function resetCategoryPickerState() {

    if (categorySearchInput) {

      categorySearchInput.value =
        "";

    }


    if (clearCategorySearch) {

      clearCategorySearch.hidden =
        true;

    }


    if (categorySearchResults) {

      categorySearchResults.hidden =
        true;

    }


    if (categoryResultList) {

      categoryResultList.innerHTML =
        "";

    }


    resetCategoryChildren();

  }


  /* ============================================================
     34. CATEGORY — SEARCH
     ============================================================ */

  function searchCategories(query) {

    const search =
      query
        .trim()
        .toLowerCase();


    if (!search) {

      hideCategorySearchResults();

      return;

    }


    const results = [];


    categories.forEach(
      function (parent) {

        if (
          parent.label
            .toLowerCase()
            .includes(search)
        ) {

          results.push({

            type: "parent",

            parent: parent,

            child: null

          });

        }


        parent.children.forEach(
          function (child) {

            if (
              child.label
                .toLowerCase()
                .includes(search)
            ) {

              results.push({

                type: "child",

                parent: parent,

                child: child

              });

            }

          }
        );

      }
    );


    renderCategoryResults(
      results
    );

  }


  /* ============================================================
     35. CATEGORY — RENDER SEARCH RESULTS
     ============================================================ */

  function renderCategoryResults(
    results
  ) {

    if (
      !categoryResultList ||
      !categorySearchResults
    ) {

      return;

    }


    categoryResultList.innerHTML =
      "";

    categorySearchResults.hidden =
      false;


    if (!results.length) {

      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "picker-empty-state";

      empty.textContent =
        "No categories found.";

      categoryResultList.appendChild(
        empty
      );

      return;

    }


    results.forEach(
      function (result) {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";

        button.className =
          "picker-result-item";


        if (
          result.type === "parent"
        ) {

          button.innerHTML = `
            <span>
              ${escapeHTML(
                result.parent.label
              )}
            </span>

            <span class="category-list-arrow">
              ›
            </span>
          `;


          button.addEventListener(
            "click",
            function () {

              selectCategoryParent(
                result.parent
              );

            }
          );

        } else {

          button.innerHTML = `
            <span>

              <strong>
                ${escapeHTML(
                  result.child.label
                )}
              </strong>

              <small style="
                display:block;
                margin-top:3px;
                color:var(--text-muted);
                font-size:12px;
                font-weight:500;
              ">
                ${escapeHTML(
                  result.parent.label
                )}
              </small>

            </span>

            <span class="category-list-arrow">
              ›
            </span>
          `;


          button.addEventListener(
            "click",
            function () {

              selectCategoryChild(
                result.parent,
                result.child
              );

            }
          );

        }


        categoryResultList.appendChild(
          button
        );

      }
    );

  }


  /* ============================================================
     36. CATEGORY — HIDE SEARCH RESULTS
     ============================================================ */

  function hideCategorySearchResults() {

    if (categorySearchResults) {

      categorySearchResults.hidden =
        true;

    }


    if (categoryResultList) {

      categoryResultList.innerHTML =
        "";

    }

  }


  /* ============================================================
     37. CATEGORY — CLEAR SEARCH
     ============================================================ */

  function clearCategorySearchInput() {

    if (categorySearchInput) {

      categorySearchInput.value =
        "";

    }


    if (clearCategorySearch) {

      clearCategorySearch.hidden =
        true;

    }


    hideCategorySearchResults();

  }


  /* ============================================================
     38. CATEGORY — CLEAR BUTTON STATE
     ============================================================ */

  function updateCategoryClearButton() {

    if (
      !categorySearchInput ||
      !clearCategorySearch
    ) {

      return;

    }


    clearCategorySearch.hidden =
      categorySearchInput.value
        .trim() === "";

  }


  /* ============================================================
     39. CATEGORY — SCROLL TO CHILDREN
     ============================================================ */

  function scrollToCategoryChildren() {

    if (!categoryChildrenSection) {
      return;
    }


    requestAnimationFrame(
      function () {

        categoryChildrenSection.scrollIntoView({

          behavior: "smooth",

          block: "start"

        });

      }
    );

  }


  /* ============================================================
     40. CATEGORY — SCROLL TO FINAL
     ============================================================ */

  function scrollToCategoryFinal() {

    if (!categoryFinalSection) {
      return;
    }


    requestAnimationFrame(
      function () {

        categoryFinalSection.scrollIntoView({

          behavior: "smooth",

          block: "center"

        });

      }
    );

  }


  /* ============================================================
     41. PRODUCT NAME — UPDATE STATE
     ============================================================ */

  function updateProductName() {

    if (!productNameInput) {
      return;
    }


    BazariaUpload.updateBasicInfo({

      productName:
        productNameInput.value.trim()

    });


    markDirty();

  }


  /* ============================================================
     42. PRODUCT NAME — INPUT
     ============================================================ */

  if (productNameInput) {

    productNameInput.addEventListener(
      "input",
      updateProductName
    );


    productNameInput.addEventListener(
      "change",
      updateProductName
    );

  }


  /* ============================================================
     43. CONDITION — SET
     ============================================================ */

  function setCondition(value) {

    const allowedConditions = [
      "new",
      "used",
      "refurbished"
    ];


    if (
      !allowedConditions.includes(
        value
      )
    ) {

      return;

    }


    if (conditionInput) {

      conditionInput.value =
        value;

      notifyChange(
        conditionInput
      );

    }


    conditionButtons.forEach(
      function (button) {

        const isSelected =
          button.dataset.value ===
          value;


        button.classList.toggle(
          "is-active",
          isSelected
        );


        button.setAttribute(
          "aria-pressed",
          String(isSelected)
        );

      }
    );


    BazariaUpload.updateBasicInfo({

      condition: value

    });


    markDirty();

  }


  /* ============================================================
     44. CONDITION — CLICK EVENTS
     ============================================================ */

  conditionButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          setCondition(
            button.dataset.value
          );

        }
      );

    }
  );


  /* ============================================================
     45. SHORT DESCRIPTION — COUNTER
     ============================================================ */

  function updateDescriptionCounter() {

    if (
      !shortDescriptionInput ||
      !descCharCount
    ) {

      return;

    }


    descCharCount.textContent =
      shortDescriptionInput.value
        .length;

  }


  /* ============================================================
     46. SHORT DESCRIPTION — STATE
     ============================================================ */

  function updateShortDescription() {

    if (!shortDescriptionInput) {
      return;
    }


    BazariaUpload.updateBasicInfo({

      shortDescription:
        shortDescriptionInput.value.trim()

    });


    updateDescriptionCounter();

    markDirty();

  }


  /* ============================================================
     47. SHORT DESCRIPTION — INPUT
     ============================================================ */

  if (shortDescriptionInput) {

    shortDescriptionInput.addEventListener(
      "input",
      updateShortDescription
    );


    shortDescriptionInput.addEventListener(
      "change",
      updateShortDescription
    );

  }


  /* ============================================================
     48. BRAND — POPULAR BRANDS
     ============================================================ */

  if (popularBrandGrid) {

    popularBrandGrid.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            ".popular-brand-item"
          );


        if (!button) {
          return;
        }


        const brandId =
          button.dataset.brand;


        const brand =
          findBrand(brandId);


        if (brand) {

          setBrand(brand);

        }

      }
    );

  }


  /* ============================================================
     49. BRAND — BROWSE LIST
     ============================================================ */

  if (brandList) {

    brandList.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            ".brand-list-item"
          );


        if (!button) {
          return;
        }


        const brandId =
          button.dataset.brand;


        const brand =
          findBrand(brandId);


        if (brand) {

          setBrand(brand);

        }

      }
    );

  }


  /* ============================================================
     50. BRAND — OPEN
     ============================================================ */

  if (brandTrigger) {

    brandTrigger.addEventListener(
      "click",
      function () {

        openPicker(
          brandPicker,
          brandTrigger
        );


        brandTrigger.setAttribute(
          "aria-expanded",
          "true"
        );

      }
    );

  }


  /* ============================================================
     51. BRAND — CLOSE
     ============================================================ */

  if (closeBrandPicker) {

    closeBrandPicker.addEventListener(
      "click",
      function () {

        closePicker(
          brandPicker
        );


        if (brandTrigger) {

          brandTrigger.setAttribute(
            "aria-expanded",
            "false"
          );

        }


        clearBrandSearchInput();

      }
    );

  }


  /* ============================================================
     52. BRAND — SEARCH INPUT
     ============================================================ */

  if (brandSearchInput) {

    brandSearchInput.addEventListener(
      "input",
      function () {

        updateBrandClearButton();

        searchBrands(
          brandSearchInput.value
        );

      }
    );

  }


  /* ============================================================
     53. BRAND — SEARCH CLEAR
     ============================================================ */

  if (clearBrandSearch) {

    clearBrandSearch.addEventListener(
      "click",
      function () {

        clearBrandSearchInput();


        if (brandSearchInput) {

          brandSearchInput.focus();

        }

      }
    );

  }


  /* ============================================================
     54. CATEGORY — OPEN
     ============================================================ */

  if (categoryTrigger) {

    categoryTrigger.addEventListener(
      "click",
      function () {

        openPicker(
          categoryPicker,
          categoryTrigger
        );


        categoryTrigger.setAttribute(
          "aria-expanded",
          "true"
        );


        updateSelectedCategoryPath();

      }
    );

  }


  /* ============================================================
     55. CATEGORY — CLOSE
     ============================================================ */

  if (closeCategoryPicker) {

    closeCategoryPicker.addEventListener(
      "click",
      function () {

        closePicker(
          categoryPicker
        );


        if (categoryTrigger) {

          categoryTrigger.setAttribute(
            "aria-expanded",
            "false"
          );

        }


        resetCategoryPickerState();

      }
    );

  }


  /* ============================================================
     56. CATEGORY — PARENT LIST
     ============================================================ */

  if (categoryList) {

    categoryList.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            ".category-list-item"
          );


        if (!button) {
          return;
        }


        const categoryId =
          button.dataset.category;


        const category =
          findCategory(
            categoryId
          );


        if (category) {

          selectCategoryParent(
            category
          );

        }

      }
    );

  }


  /* ============================================================
     57. CATEGORY — SEARCH INPUT
     ============================================================ */

  if (categorySearchInput) {

    categorySearchInput.addEventListener(
      "input",
      function () {

        updateCategoryClearButton();

        searchCategories(
          categorySearchInput.value
        );

      }
    );

  }


  /* ============================================================
     58. CATEGORY — SEARCH CLEAR
     ============================================================ */

  if (clearCategorySearch) {

    clearCategorySearch.addEventListener(
      "click",
      function () {

        clearCategorySearchInput();


        if (categorySearchInput) {

          categorySearchInput.focus();

        }

      }
    );

  }


  /* ============================================================
     59. CATEGORY — SEARCH ACTION
     ============================================================ */

  if (searchCategoriesAction) {

    searchCategoriesAction.addEventListener(
      "click",
      function () {

        if (!categorySearchInput) {
          return;
        }


        categorySearchInput.focus();


        categorySearchInput.scrollIntoView({

          behavior: "smooth",

          block: "center"

        });

      }
    );

  }


  /* ============================================================
     60. CATEGORY — CHILDREN BACK
     ============================================================ */

  if (categoryChildrenBack) {

    categoryChildrenBack.addEventListener(
      "click",
      function () {

        selectedCategory.parentId =
          "";

        selectedCategory.parentLabel =
          "";

        selectedCategory.childId =
          "";

        selectedCategory.childLabel =
          "";


        updateSelectedCategoryPath();

        resetCategoryChildren();


        if (categoryList) {

          categoryList.scrollIntoView({

            behavior: "smooth",

            block: "start"

          });

        }

      }
    );

  }


  /* ============================================================
     61. CATEGORY — CLEAR SELECTION
     ============================================================ */

  if (clearCategorySelection) {

    clearCategorySelection.addEventListener(
      "click",
      function () {

        clearCategory();

      }
    );

  }


  /* ============================================================
     62. CATEGORY — CONFIRM
     ============================================================ */

  if (confirmCategorySelection) {

    confirmCategorySelection.addEventListener(
      "click",
      function () {

        confirmCategory();

      }
    );

  }


  /* ============================================================
     63. ESC KEY SUPPORT
     ============================================================ */

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Escape") {
        return;
      }


      if (
        brandPicker &&
        !brandPicker.hidden
      ) {

        closePicker(
          brandPicker
        );


        if (brandTrigger) {

          brandTrigger.setAttribute(
            "aria-expanded",
            "false"
          );

        }


        clearBrandSearchInput();

        return;

      }


      if (
        categoryPicker &&
        !categoryPicker.hidden
      ) {

        closePicker(
          categoryPicker
        );


        if (categoryTrigger) {

          categoryTrigger.setAttribute(
            "aria-expanded",
            "false"
          );

        }


        resetCategoryPickerState();

      }

    }
  );


  /* ============================================================
     64. RESTORE FROM STATE
     ------------------------------------------------------------
     State is the source of truth.
     DOM is only the visual representation.
     ============================================================ */

  function restoreFromState() {

    const state =
      BazariaUpload.getState();


    if (
      !state ||
      !state.product ||
      !state.product.basicInfo
    ) {

      return;

    }


    const basicInfo =
      state.product.basicInfo;


    /* ---------------- PRODUCT NAME ---------------- */

    if (
      productNameInput &&
      basicInfo.productName
    ) {

      productNameInput.value =
        basicInfo.productName;

    }


    /* ---------------- BRAND ---------------- */

    if (basicInfo.brand) {

      const brand =
        findBrand(
          basicInfo.brand
        );


      if (brand) {

        if (brandInput) {

          brandInput.value =
            brand.id;

        }


        if (brandDisplay) {

          brandDisplay.textContent =
            brand.label;

        }


        if (brandTrigger) {

          brandTrigger.classList.add(
            "has-value"
          );

        }

      }

    }


    /* ---------------- CATEGORY ---------------- */

    if (basicInfo.category) {

      const parent =
        findCategory(
          basicInfo.category
        );


      if (parent) {

        selectedCategory.parentId =
          parent.id;

        selectedCategory.parentLabel =
          parent.label;


        if (basicInfo.subCategory) {

          const child =
            findChild(
              parent.id,
              basicInfo.subCategory
            );


          if (child) {

            selectedCategory.childId =
              child.id;

            selectedCategory.childLabel =
              child.label;

          }

        }


        if (
          categoryInput
        ) {

          categoryInput.value =
            selectedCategory.parentId;

        }


        if (
          subCategoryInput
        ) {

          subCategoryInput.value =
            selectedCategory.childId;

        }


        if (
          categoryDisplay
        ) {

          if (
            selectedCategory.childLabel
          ) {

            categoryDisplay.textContent =
              selectedCategory.parentLabel +
              " › " +
              selectedCategory.childLabel;

          } else {

            categoryDisplay.textContent =
              selectedCategory.parentLabel;

          }

        }


        if (
          categoryTrigger
        ) {

          categoryTrigger.classList.add(
            "has-value"
          );

        }

      }

    }


    /* ---------------- CONDITION ---------------- */

    setCondition(
      basicInfo.condition ||
      "new"
    );


    /* ---------------- DESCRIPTION ---------------- */

    if (
      shortDescriptionInput &&
      basicInfo.shortDescription
    ) {

      shortDescriptionInput.value =
        basicInfo.shortDescription;

    }


    updateDescriptionCounter();

  }


  /* ============================================================
     65. INITIAL DOM → STATE SYNC
     ------------------------------------------------------------
     If the page already has values before state restoration,
     synchronize them into the central state.
     ============================================================ */

  function syncInitialValuesToState() {

    const state =
      BazariaUpload.getState();


    if (!state) {
      return;
    }


    const basicInfo =
      state.product.basicInfo;


    /* ---------------- PRODUCT NAME ---------------- */

    if (
      productNameInput &&
      !basicInfo.productName &&
      productNameInput.value.trim()
    ) {

      basicInfo.productName =
        productNameInput.value.trim();

    }


    /* ---------------- BRAND ---------------- */

    if (
      brandInput &&
      !basicInfo.brand &&
      brandInput.value
    ) {

      basicInfo.brand =
        brandInput.value;

    }


    /* ---------------- CATEGORY ---------------- */

    if (
      categoryInput &&
      !basicInfo.category &&
      categoryInput.value
    ) {

      basicInfo.category =
        categoryInput.value;

    }


    /* ---------------- SUB CATEGORY ---------------- */

    if (
      subCategoryInput &&
      !basicInfo.subCategory &&
      subCategoryInput.value
    ) {

      basicInfo.subCategory =
        subCategoryInput.value;

    }


    /* ---------------- CONDITION ---------------- */

    if (
      conditionInput &&
      conditionInput.value
    ) {

      basicInfo.condition =
        conditionInput.value;

    }


    /* ---------------- DESCRIPTION ---------------- */

    if (
      shortDescriptionInput &&
      !basicInfo.shortDescription &&
      shortDescriptionInput.value.trim()
    ) {

      basicInfo.shortDescription =
        shortDescriptionInput.value.trim();

    }

  }


  /* ============================================================
     66. INITIALIZATION
     ============================================================ */

  function init() {

    /*
     * First synchronize existing HTML values
     * into the central state.
     */

    syncInitialValuesToState();


    /*
     * Then restore the visual UI from state.
     */

    restoreFromState();


    /*
     * Ensure the description counter
     * is correct on initial load.
     */

    updateDescriptionCounter();

  }


  /* ============================================================
     67. INITIALIZE
     ============================================================ */

  init();


  /* ============================================================
     68. PUBLIC STEP 1 API
     ------------------------------------------------------------
     Only Step 1 related functions are exposed.
     Navigation, validation and upload remain
     responsibility of their own modules.
     ============================================================ */

  window.BazariaStep1 = {

    openBrandPicker: function () {

      openPicker(
        brandPicker,
        brandTrigger
      );

    },


    closeBrandPicker: function () {

      closePicker(
        brandPicker
      );

    },


    openCategoryPicker: function () {

      openPicker(
        categoryPicker,
        categoryTrigger
      );

    },


    closeCategoryPicker: function () {

      closePicker(
        categoryPicker
      );

    },


    getProductName: function () {

      return productNameInput
        ? productNameInput.value.trim()
        : "";

    },


    getBrand: function () {

      return brandInput
        ? brandInput.value
        : "";

    },


    getCategory: function () {

      return {

        category:
          categoryInput
            ? categoryInput.value
            : "",

        subCategory:
          subCategoryInput
            ? subCategoryInput.value
            : ""

      };

    },


    getCondition: function () {

      return conditionInput
        ? conditionInput.value
        : "";

    },


    getShortDescription: function () {

      return shortDescriptionInput
        ? shortDescriptionInput.value.trim()
        : "";

    },


    clearBrand: function () {

      clearBrand();

    },


    clearCategory: function () {

      clearCategory();

    },


    getSelectedCategoryPath: function () {

      if (
        !selectedCategory.parentLabel
      ) {

        return "";

      }


      if (
        selectedCategory.childLabel
      ) {

        return (
          selectedCategory.parentLabel +
          " › " +
          selectedCategory.childLabel
        );

      }


      return selectedCategory.parentLabel;

    }

  };


})();