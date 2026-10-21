/* ============================================================
   BAZARIA — UPLOAD PRODUCT SYSTEM
   navigation.js
   ------------------------------------------------------------
   CENTRAL STEP NAVIGATION
   Handles Step 0 → Step 7 movement.
   ------------------------------------------------------------
   IMPORTANT:
   - State is managed by state.js.
   - Validation is handled by validation.js.
   - This file does not contain product data.
   - This file does not contain step-specific business logic.
   ============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     NAMESPACE
     ========================================================== */

  const BazariaUpload = window.BazariaUpload;

  if (!BazariaUpload) {
    console.error(
      "[BazariaUpload] navigation.js requires state.js."
    );
    return;
  }


  if (!BazariaUpload.validation) {
    console.error(
      "[BazariaUpload] navigation.js requires validation.js."
    );
    return;
  }


  /* ==========================================================
     CONSTANTS
     ========================================================== */

  const FIRST_STEP = 0;
  const LAST_STEP = 7;

  const VALIDATED_FIRST_STEP = 1;
  const VALIDATED_LAST_STEP = 6;


  /* ==========================================================
     DOM REFERENCES
     ========================================================== */

  let stepElements = [];


  /* ==========================================================
     INITIALIZE DOM REFERENCES
     ========================================================== */

  const cacheElements = () => {

    stepElements = Array.from(
      document.querySelectorAll(
        ".upload-step[data-step]"
      )
    );

  };


  /* ==========================================================
     GET STEP ELEMENT
     ========================================================== */

  const getStepElement = (step) => {

    const numericStep = Number(step);

    return (
      stepElements.find(
        (element) =>
          Number(
            element.dataset.step
          ) === numericStep
      ) || null
    );

  };


  /* ==========================================================
     CHECK STEP NUMBER
     ========================================================== */

  const isValidStep = (step) => {

    const numericStep = Number(step);

    return (
      Number.isInteger(numericStep) &&
      numericStep >= FIRST_STEP &&
      numericStep <= LAST_STEP
    );

  };


  /* ==========================================================
     UPDATE STEP VISIBILITY
     ========================================================== */

  const updateStepVisibility = (targetStep) => {

    stepElements.forEach((stepElement) => {

      const step =
        Number(stepElement.dataset.step);

      const isActive =
        step === targetStep;

      stepElement.classList.toggle(
        "is-active",
        isActive
      );

      stepElement.setAttribute(
        "aria-hidden",
        String(!isActive)
      );

    });

  };


  /* ==========================================================
     UPDATE BODY / SCREEN STATE
     ========================================================== */

  const updateScreenState = (targetStep) => {

    const uploadScreen =
      document.getElementById(
        "uploadScreen"
      );

    if (!uploadScreen) {
      return;
    }

    uploadScreen.dataset.currentStep =
      String(targetStep);

  };


  /* ==========================================================
     SCROLL STEP TO TOP
     ========================================================== */

  const scrollStepToTop = (stepElement) => {

    if (!stepElement) {
      return;
    }

    const main =
      stepElement.querySelector(
        ".upload-main"
      );

    if (main) {
      main.scrollTop = 0;
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

  };


  /* ==========================================================
     FOCUS FIRST USEFUL ELEMENT
     ========================================================== */

  const focusStep = (stepElement) => {

    if (!stepElement) {
      return;
    }

    /*
     * Do not aggressively focus inputs.
     * We only focus a suitable heading/container if available.
     * This keeps mobile keyboard behavior under control.
     */

    const heading =
      stepElement.querySelector(
        "h1, h2, h3"
      );

    if (
      heading &&
      typeof heading.focus === "function"
    ) {

      const hadTabIndex =
        heading.hasAttribute(
          "tabindex"
        );

      if (!hadTabIndex) {
        heading.setAttribute(
          "tabindex",
          "-1"
        );
      }

      heading.focus({
        preventScroll: true
      });

    }

  };


  /* ==========================================================
     VALIDATE STEP BEFORE LEAVING
     ========================================================== */

  const validateBeforeNext = (step) => {

    const numericStep = Number(step);

    /*
     * Step 0 has no form validation.
     */

    if (
      numericStep < VALIDATED_FIRST_STEP ||
      numericStep > VALIDATED_LAST_STEP
    ) {
      return {
        valid: true,
        errors: []
      };
    }


    return BazariaUpload.validation.validateStep(
      numericStep
    );

  };


  /* ==========================================================
     GO TO STEP
     ========================================================== */

  const goToStep = (
    targetStep,
    options = {}
  ) => {

    const numericStep =
      Number(targetStep);

    if (!isValidStep(numericStep)) {

      console.warn(
        "[BazariaUpload] Invalid navigation step:",
        targetStep
      );

      return false;
    }


    const currentStep =
      BazariaUpload.getState().currentStep;


    /*
     * When moving forward, make sure all previous
     * required steps are valid.
     */

    if (
      options.validate !== false &&
      numericStep > currentStep
    ) {

      /*
       * Validate every required step between
       * the current step and the target step.
       */

      for (
        let step = Math.max(
          VALIDATED_FIRST_STEP,
          currentStep
        );
        step < numericStep;
        step++
      ) {

        const result =
          validateBeforeNext(step);

        if (!result.valid) {

          /*
           * Stay on the invalid step.
           */

          showStep(
            step
          );

          return false;
        }

      }

    }


    const targetElement =
      getStepElement(
        numericStep
      );

    if (!targetElement) {

      console.warn(
        "[BazariaUpload] Step element not found:",
        numericStep
      );

      return false;
    }


    /* --------------------------------------------------------
       Update state
       -------------------------------------------------------- */

    BazariaUpload.setCurrentStep(
      numericStep
    );


    /* --------------------------------------------------------
       Update UI
       -------------------------------------------------------- */

    updateStepVisibility(
      numericStep
    );

    updateScreenState(
      numericStep
    );

    scrollStepToTop(
      targetElement
    );


    /*
     * Allow the browser to complete the visual step change
     * before focusing the heading.
     */

    window.requestAnimationFrame(() => {
      focusStep(targetElement);
    });


    return true;
  };


  /* ==========================================================
     SHOW STEP
     ----------------------------------------------------------
     Internal helper.
     Does not perform validation.
     ========================================================== */

  const showStep = (step) => {

    const numericStep =
      Number(step);

    if (!isValidStep(numericStep)) {
      return false;
    }


    const targetElement =
      getStepElement(
        numericStep
      );

    if (!targetElement) {
      return false;
    }


    BazariaUpload.setCurrentStep(
      numericStep
    );

    updateStepVisibility(
      numericStep
    );

    updateScreenState(
      numericStep
    );

    scrollStepToTop(
      targetElement
    );


    return true;
  };


  /* ==========================================================
     NEXT STEP
     ========================================================== */

  const nextStep = () => {

    const currentStep =
      BazariaUpload.getState().currentStep;

    if (
      currentStep >= LAST_STEP
    ) {
      return false;
    }


    /*
     * Step 0 → Step 1
     * No validation required.
     */

    if (currentStep === 0) {

      return goToStep(
        1,
        {
          validate: false
        }
      );

    }


    /*
     * Steps 1–6 → next step
     */

    return goToStep(
      currentStep + 1
    );

  };


  /* ==========================================================
     PREVIOUS STEP
     ========================================================== */

  const previousStep = () => {

    const currentStep =
      BazariaUpload.getState().currentStep;

    if (
      currentStep <= FIRST_STEP
    ) {
      return false;
    }


    return goToStep(
      currentStep - 1,
      {
        validate: false
      }
    );

  };


  /* ==========================================================
     GO TO PREVIOUS VALIDATION STEP
     ========================================================== */

  const goToFirstInvalidStep = () => {

    const invalidStep =
      BazariaUpload.validation
        .getFirstInvalidStep();


    if (!invalidStep) {

      return goToStep(
        LAST_STEP,
        {
          validate: false
        }
      );

    }


    return goToStep(
      invalidStep,
      {
        validate: false
      }
    );

  };


  /* ==========================================================
     HANDLE STEP BACK BUTTONS
     ========================================================== */

  const handleBackButtons = () => {

    for (
      let step = FIRST_STEP;
      step <= LAST_STEP;
      step++
    ) {

      const button =
        document.getElementById(
          `goBackBtn${step}`
        );

      if (!button) {
        continue;
      }


      button.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          previousStep();

        }
      );

    }

  };


  /* ==========================================================
     HANDLE STEP FORMS
     ----------------------------------------------------------
     We attach to Step 1–6 forms.
     Step 0 uses cards instead.
     ========================================================== */

  const handleStepForms = () => {

    for (
      let step = VALIDATED_FIRST_STEP;
      step <= VALIDATED_LAST_STEP;
      step++
    ) {

      const form =
        document.getElementById(
          `step${step}Form`
        );

      if (!form) {
        continue;
      }


      form.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          nextStep();

        }
      );

    }

  };





  /* ==========================================================
     HANDLE SUMMARY STEP BUTTONS
     ========================================================== */

  const handleSummaryButtons = () => {

    const summaryButtons =
      document.querySelectorAll(
        "[data-summary-step]"
      );


    summaryButtons.forEach(
      (button) => {

        button.addEventListener(
          "click",
          (event) => {

            event.preventDefault();

            const targetStep =
              Number(
                button.dataset.summaryStep
              );

            if (
              !isValidStep(
                targetStep
              )
            ) {
              return;
            }


            goToStep(
              targetStep,
              {
                validate: false
              }
            );

          }
        );

      }
    );

  };


  /* ==========================================================
     INITIAL STEP
     ========================================================== */

  const initializeStep = () => {

    const state =
      BazariaUpload.getState();

    const initialStep =
      isValidStep(
        state.currentStep
      )
        ? state.currentStep
        : FIRST_STEP;


    showStep(
      initialStep
    );

  };


  /* ==========================================================
     INITIALIZE NAVIGATION
     ========================================================== */

  const init = () => {

    cacheElements();

    handleBackButtons();

    handleStepForms();

    

    handleSummaryButtons();

    initializeStep();

    console.log(
      "[BazariaUpload] navigation.js initialized."
    );

  };


  /* ==========================================================
     PUBLIC NAVIGATION API
     ========================================================== */

  BazariaUpload.navigation = {

    goToStep,

    nextStep,

    previousStep,

    goToFirstInvalidStep,

    getCurrentStep: () => {
      return BazariaUpload
        .getState()
        .currentStep;
    },

    getFirstStep: () => FIRST_STEP,

    getLastStep: () => LAST_STEP

  };


  /* ==========================================================
     DOM READY
     ========================================================== */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();

  }

})();