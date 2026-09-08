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


    window.ticketState.pricing =
      result.data || [];


    renderTicketTypes(
      window.ticketState.pricing
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


/* =====================================
   CONTINUE
===================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const continueBtn =
      document.getElementById(
        "continueBtn"
      );


    continueBtn.addEventListener(
      "click",
      () => {

        const selected =
          window.ticketState
            .selectedBooks;


        console.log(
          "Selected books:",
          selected
        );


        alert(
          "Selected " +
          selected.length +
          " book(s)."
        );

      }
    );

  }
);


document.addEventListener(
  "DOMContentLoaded",
  initApp
);
