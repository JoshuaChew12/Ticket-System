window.ticketState = {
  pricing: [],
  selectedBooks: [],
  foundBook: null
};

async function loadPricing() {
  return apiGet("getPricing");
}

async function findBook(ticketNo) {
  return apiGet("findBookByTicket", {
    ticketNo: ticketNo
  });
}

function getPricing(type) {
  return window.ticketState.pricing.find(
    x => x.type === type
  );
}

async function searchTicket() {
  const input =
    document.getElementById("ticketNumber");

  const result =
    document.getElementById("ticketResult");

  const ticketNo =
    Number(input.value);

  if (!ticketNo) {
    result.classList.remove("hidden");
    result.innerHTML =
      `<div class="status">
        Enter a ticket number.
      </div>`;
    return;
  }

  try {

    result.classList.remove("hidden");
    result.innerHTML =
      `<div class="status">
        Searching...
      </div>`;

    const response =
      await findBook(ticketNo);

    const book = response.data;

    window.ticketState.foundBook =
      book;

    result.innerHTML = `
      <div class="found-book">
        <strong>${book.bookId}</strong>
        <span>${book.typeName}</span>
        <small>
          Ticket ${book.startNo} – ${book.endNo}
        </small>
        <button onclick="addFoundBook()">
          Add Book
        </button>
      </div>
    `;

  } catch (error) {

    window.ticketState.foundBook = null;

    result.innerHTML =
      `<div class="status">
        ${escapeHtml(error.message)}
      </div>`;
  }
}

function addFoundBook() {

  const book =
    window.ticketState.foundBook;

  if (!book) return;

  const exists =
    window.ticketState.selectedBooks
      .some(x => x.bookId === book.bookId);

  if (exists) return;

  window.ticketState.selectedBooks.push(book);

  document.getElementById(
    "ticketNumber"
  ).value = "";

  document.getElementById(
    "ticketResult"
  ).classList.add("hidden");

  renderSelectedBooks();
  updateSummary();
  showCustomerSection();
}

function showCustomerSection() {
  document.getElementById(
    "customerSection"
  ).classList.remove("hidden");
}

function removeBook(bookId) {

  window.ticketState.selectedBooks =
    window.ticketState.selectedBooks.filter(
      x => x.bookId !== bookId
    );

  renderSelectedBooks();
  updateSummary();
}

function renderSelectedBooks() {

  const section =
    document.getElementById(
      "selectedSection"
    );

  const box =
    document.getElementById(
      "selectedBooks"
    );

  const books =
    window.ticketState.selectedBooks;

  section.classList.toggle(
    "hidden",
    books.length === 0
  );

  box.innerHTML =
    books.map(book => `
      <div class="selected-book">
        <div>
          <strong>${book.bookId}</strong>
          <small>
            ${book.typeName}<br>
            ${book.startNo} – ${book.endNo}
          </small>
        </div>

        <button
          onclick="removeBook('${book.bookId}')">
          ×
        </button>
      </div>
    `).join("");
}

function updateSummary() {

  const books =
    window.ticketState.selectedBooks;

  const tickets =
    books.length * 10;

  const amount =
    books.reduce((sum, book) => {
      const p = getPricing(book.type);
      return sum +
        Number(p ? p.pricePerBook : 0);
    }, 0);

  document.getElementById(
    "selectedBookCount"
  ).textContent = books.length;

  document.getElementById(
    "selectedTicketCount"
  ).textContent = tickets;

  document.getElementById(
    "selectedTotalAmount"
  ).textContent =
    "RM" + amount.toLocaleString();

  document.getElementById(
    "selectionSummary"
  ).classList.toggle(
    "hidden",
    books.length === 0
  );

  document.getElementById(
    "continueBtn"
  ).disabled = books.length === 0;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function submitSale() {
  const books = window.ticketState.selectedBooks;

  if (!books.length) {
    alert("Please select at least one book.");
    return;
  }

  const name =
    document.getElementById("customerName").value.trim();

  const phone =
    document.getElementById("customerPhone").value.trim();

  const remark =
    document.getElementById("customerRemark").value.trim();

  const paymentStatus =
    document.querySelector(
      'input[name="paymentStatus"]:checked'
    ).value;

  const paidAmount =
    Number(
      document.getElementById("paidAmount").value || 0
    );

  const paymentMethod =
    document.getElementById("paymentMethod").value;

  const data = {
    name,
    phone,
    remark,
    paymentStatus,
    paidAmount,
    paymentMethod,
    items: books.map(book => ({
      bookId: book.bookId,
      type: book.type
    }))
  };

  try {
    const btn =
      document.getElementById("createSaleBtn");

    btn.disabled = true;
    btn.textContent = "Creating...";

    const result =
      await apiPost("createSale", data);

    console.log("Sale created:", result);

    showSaleResult(result);
    
  } catch (error) {
    alert(error.message);

  } finally {
    const btn =
      document.getElementById("createSaleBtn");

    btn.disabled = false;
    btn.textContent = "Create Sale";
  }
}

function showSaleResult(result) {
  document.getElementById("resultSaleId").textContent =
    result.saleId;

  document.getElementById("resultCustomer").textContent =
    result.name;

  document.getElementById("resultPhone").textContent =
    result.phone;

  document.getElementById("resultBooks").textContent =
    result.totalBooks;

  document.getElementById("resultTickets").textContent =
    result.totalTickets;

  document.getElementById("resultTotal").textContent =
    "RM" + Number(result.totalAmount).toLocaleString();

  document.getElementById("resultPaid").textContent =
    "RM" + Number(result.paidAmount).toLocaleString();

  document.getElementById("resultBalance").textContent =
    "RM" + Number(result.balance).toLocaleString();

  document.getElementById("resultPaymentStatus").textContent =
    result.paymentStatus;

  document.getElementById("saleResult")
    .classList.remove("hidden");

  document.getElementById("saleResult")
    .scrollIntoView({ behavior: "smooth" });
}

document.getElementById("newSaleBtn")
  .onclick = resetSale;

function resetSale() {
  window.ticketState.selectedBooks = [];
  window.ticketState.foundBook = null;

  document.getElementById("ticketNumber").value = "";
  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("customerRemark").value = "";
  document.getElementById("paidAmount").value = "";
  document.getElementById("paymentMethod").value = "";

  document.querySelector(
    'input[name="paymentStatus"][value="UNPAID"]'
  ).checked = true;

  document.getElementById("selectedSection")
    .classList.add("hidden");

  document.getElementById("customerSection")
    .classList.add("hidden");

  document.getElementById("previewSection")
    .classList.add("hidden");

  document.getElementById("saleResult")
    .classList.add("hidden");

  renderSelectedBooks();
  updateSummary();
  updatePaymentUI();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function searchSales(keyword) {

  return apiGet("searchSales", {
    keyword: keyword
  });

}

async function runSaleSearch() {

  const input =
    document.getElementById(
      "saleSearchInput"
    );

  const status =
    document.getElementById(
      "saleSearchStatus"
    );

  const results =
    document.getElementById(
      "saleSearchResults"
    );

  const keyword =
    input.value.trim();

  if (!keyword) {

    status.innerHTML =
      `<div class="status">
        Enter a search keyword.
      </div>`;

    results.innerHTML = "";

    return;
  }

  try {

    status.innerHTML =
      `<div class="status">
        Searching...
      </div>`;

    results.innerHTML = "";

    const response =
      await searchSales(keyword);

    const sales =
      response.data || [];

    if (!sales.length) {

      status.innerHTML =
        `<div class="status">
          No sales found.
        </div>`;

      return;
    }

    status.innerHTML =
      `<div class="status">
        ${sales.length} sale(s) found.
      </div>`;

    renderSaleSearchResults(sales);

  } catch (error) {

    status.innerHTML =
      `<div class="status">
        ${escapeHtml(error.message)}
      </div>`;

  }

}

function renderSaleSearchResults(sales) {

  const box =
    document.getElementById(
      "saleSearchResults"
    );

  box.innerHTML =
    sales.map(sale => `

      <button
        class="sale-search-item"
        onclick="openSaleDetail('${escapeHtml(sale.saleId)}')"
      >

        <div>

          <strong>
            ${escapeHtml(sale.saleId)}
          </strong>

          <span>
            ${escapeHtml(sale.name)}
          </span>

          <small>
            ${escapeHtml(sale.phone)}
          </small>

        </div>

        <div>

          <b>
            RM${Number(
              sale.totalAmount
            ).toLocaleString()}
          </b>

          <small>
            ${escapeHtml(
              sale.paymentStatus
            )}
          </small>

        </div>

      </button>

    `).join("");

}

async function openSaleDetail(saleId) {

  try {

    const response =
      await apiGet("getSale", {
        saleId: saleId
      });

    renderSaleDetail(response);

  } catch (error) {

    alert(error.message);

  }

}

function renderSaleDetail(result) {

  const sale = result.sale;
  const items = result.items || [];
  const payments = result.payments || [];

  const box =
    document.getElementById(
      "saleDetail"
    );

  box.innerHTML = `

    <div class="sale-detail-header">

      <span>Sale ID</span>

      <strong>
        ${escapeHtml(sale.saleId)}
      </strong>

    </div>


    <div class="sale-detail-customer">

      <strong>
        ${escapeHtml(sale.name)}
      </strong>

      <span>
        ${escapeHtml(sale.phone)}
      </span>

      ${
        sale.remark
          ? `<small>
              ${escapeHtml(sale.remark)}
            </small>`
          : ""
      }

    </div>


    <div class="sale-detail-books">

      ${items.map(item => `

        <div class="sale-detail-book">

          <div>

            <strong>
              ${escapeHtml(item.bookId)}
            </strong>

            <span>
              ${escapeHtml(item.typeName)}
            </span>

          </div>

          <div>

            <span>
              ${item.startNo} – ${item.endNo}
            </span>

            <small>
              ${escapeHtml(item.status)}
            </small>

          </div>

        </div>

      `).join("")}

    </div>


    <div class="sale-detail-total">

      <div>
        <span>Total Books</span>
        <strong>
          ${sale.totalBooks}
        </strong>
      </div>

      <div>
        <span>Total Tickets</span>
        <strong>
          ${sale.totalTickets}
        </strong>
      </div>

      <div>
        <span>Total</span>
        <strong>
          RM${Number(
            sale.totalAmount
          ).toLocaleString()}
        </strong>
      </div>

      <div>
        <span>Paid</span>
        <strong>
          RM${Number(
            sale.paidAmount
          ).toLocaleString()}
        </strong>
      </div>

      <div>
        <span>Balance</span>
        <strong>
          RM${Number(
            sale.balance
          ).toLocaleString()}
        </strong>
      </div>

      <div>
        <span>Status</span>
        <strong>
          ${escapeHtml(
            sale.paymentStatus
          )}
        </strong>
      </div>

    </div>


    ${
      payments.length
        ? `

          <div class="sale-detail-payments">

            <h3>Payments</h3>

            ${payments.map(payment => `

              <div class="payment-row">

                <div>

                  <strong>
                    RM${Number(
                      payment.amount
                    ).toLocaleString()}
                  </strong>

                  <span>
                    ${escapeHtml(
                      payment.paymentMethod || ""
                    )}
                  </span>

                </div>

                ${
                  payment.reference
                    ? `<small>
                        ${escapeHtml(
                          payment.reference
                        )}
                      </small>`
                    : ""
                }

              </div>

            `).join("")}

          </div>

        `
        : ""
    }

  `;

  document.getElementById(
    "searchSection"
  ).classList.add("hidden");

  document.getElementById(
    "saleDetailSection"
  ).classList.remove("hidden");

}

document.getElementById(
  "backToSaleSearchBtn"
).onclick = function() {

  document.getElementById(
    "saleDetailSection"
  ).classList.add("hidden");

  document.getElementById(
    "searchSection"
  ).classList.remove("hidden");

};
