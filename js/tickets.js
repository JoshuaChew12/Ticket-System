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

    alert(
      "Sale created successfully.\n\nSale ID: " +
      result.saleId
    );

  } catch (error) {
    alert(error.message);

  } finally {
    const btn =
      document.getElementById("createSaleBtn");

    btn.disabled = false;
    btn.textContent = "Create Sale";
  }
}
