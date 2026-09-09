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

  document
  .querySelectorAll(
    'input[name="paymentStatus"]'
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      updatePaymentUI
    );

  });

  document.getElementById("createSaleBtn")
  .onclick = submitSale;

document.getElementById(
  "saleSearchBtn"
).onclick = runSaleSearch;  

 document.getElementById(
  "saleSearchInput"
).addEventListener(
  "keydown",
  e => {

    if (e.key === "Enter") {
      runSaleSearch();
    }

  }
); 

document.getElementById(
  "recordPaymentBtn"
).onclick =
  submitSalePayment;
  
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

  renderPreview();

  document.getElementById(
    "previewSection"
  ).classList.remove("hidden");

  document.getElementById(
    "previewSection"
  ).scrollIntoView({
    behavior: "smooth"
  });
}

function renderPreview() {

  const name =
    document.getElementById(
      "customerName"
    ).value.trim();

  const phone =
    document.getElementById(
      "customerPhone"
    ).value.trim();

  const remark =
    document.getElementById(
      "customerRemark"
    ).value.trim();

  const books =
    window.ticketState.selectedBooks;

  const amount =
    books.reduce((sum, book) => {

      const p =
        getPricing(book.type);

      return sum +
        Number(
          p ? p.pricePerBook : 0
        );

    }, 0);

  document.getElementById(
    "previewCustomer"
  ).innerHTML = `
    <div class="preview-customer">
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(phone)}</span>
      ${
        remark
          ? `<small>${escapeHtml(remark)}</small>`
          : ""
      }
    </div>
  `;

  document.getElementById(
    "previewBooks"
  ).innerHTML =
    books.map(book => `
      <div class="preview-book">
        <strong>${book.bookId}</strong>
        <span>
          ${book.startNo} – ${book.endNo}
        </span>
        <b>
          RM${Number(
            getPricing(book.type)
              .pricePerBook
          ).toLocaleString()}
        </b>
      </div>
    `).join("");

  document.getElementById(
    "previewBookCount"
  ).textContent =
    books.length;

  document.getElementById(
    "previewTicketCount"
  ).textContent =
    books.length * 10;

  document.getElementById(
    "previewAmount"
  ).textContent =
    "RM" + amount.toLocaleString();
}

function updatePaymentUI() {

  const status =
    document.querySelector(
      'input[name="paymentStatus"]:checked'
    ).value;

  const paidBox =
    document.getElementById(
      "paidAmountBox"
    );

  const methodBox =
    document.getElementById(
      "paymentMethodBox"
    );

  paidBox.classList.toggle(
    "hidden",
    status === "UNPAID"
  );

  methodBox.classList.toggle(
    "hidden",
    status === "UNPAID"
  );

  if (status === "PAID") {

    const amount =
      window.ticketState.selectedBooks
        .reduce((sum, book) => {

          const p =
            getPricing(book.type);

          return sum +
            Number(
              p ? p.pricePerBook : 0
            );

        }, 0);

    document.getElementById(
      "paidAmount"
    ).value = amount;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  initApp
);
