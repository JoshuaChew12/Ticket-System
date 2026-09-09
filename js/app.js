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

  document.getElementById(
    "continueBtn"
  ).onclick = continueSale;
}

function continueSale() {

  const name =
    document.getElementById(
      "customerName"
    ).value.trim();

  const phone =
    document.getElementById(
      "customerPhone"
    ).value.trim();

  if (!name) {
    alert("Please enter customer name.");
    return;
  }

  if (!phone) {
    alert("Please enter phone number.");
    return;
  }

  const saleData = {

    name: name,

    phone: phone,

    remark:
      document.getElementById(
        "customerRemark"
      ).value.trim(),

    books:
      window.ticketState.selectedBooks

  };

  console.log(
    "Sale data:",
    saleData
  );

  alert(
    "Customer information completed."
  );
}

document.addEventListener(
  "DOMContentLoaded",
  initApp
);
