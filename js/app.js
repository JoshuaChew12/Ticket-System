// =====================================================
// INIT
// =====================================================

async function initApp() {

  const status =
    document.getElementById(
      "systemStatus"
    );


  try {

    status.textContent =
      "Connecting to backend...";


    const result =
      await loadPricing();


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        "Invalid pricing response."
      );

    }


    renderTicketTypes(
      result.data
    );


    status.textContent =
      "Backend connection successful.";


  } catch (error) {

    console.error(error);


    status.textContent =
      "Backend connection failed: " +
      error.message;

  }

}


document.addEventListener(
  "DOMContentLoaded",
  initApp
);
