async function initApp() {

  const status =
    document.getElementById(
      "systemStatus"
    );

  try {

    const result =
      await loadPricing();

    window.ticketState.pricing =
      result.data || [];

    status.textContent =
      "Backend connection successful.";

  } catch (error) {

    status.textContent =
      "Backend connection failed: " +
      error.message;
  }

  document.getElementById(
    "findTicketBtn"
  ).onclick = searchTicket;

  document.getElementById(
    "ticketNumber"
  ).addEventListener(
    "keydown",
    e => {
      if (e.key === "Enter") {
        searchTicket();
      }
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  initApp
);
