/* =====================================
   STATE
===================================== */

window.ticketState = {

  pricing: [],

  selectedType: null,

  availableBooks: {},

  selectedBooks: []

};


/* =====================================
   LOAD PRICING
===================================== */

async function loadPricing() {

  return await apiGet("getPricing");

}


/* =====================================
   LOAD AVAILABLE BOOKS
===================================== */

async function loadAvailableBooks(type) {

  return await apiGet(
    "getAvailableBooks",
    {
      type: type
    }
  );

}


/* =====================================
   RENDER TICKET TYPES
===================================== */

function renderTicketTypes(pricing) {

  const container =
    document.getElementById(
      "ticketTypes"
    );


  if (
    !pricing ||
    pricing.length === 0
  ) {

    container.innerHTML =
      "No ticket types found.";

    return;

  }


  container.innerHTML =
    pricing.map(item => {

      return `

        <div
          class="ticket-type"
          data-type="${escapeHtml(item.type)}"
          onclick="selectTicketType('${escapeJs(item.type)}')"
        >

          <div class="ticket-type-name">

            ${escapeHtml(item.name)}

          </div>


          <div class="ticket-type-price">

            RM${Number(
              item.pricePerTicket
            ).toLocaleString()}

            / ticket

            ·

            RM${Number(
              item.pricePerBook
            ).toLocaleString()}

            / book

          </div>


          <div class="ticket-type-books">

            ${Number(
              item.totalBooks
            )}

            books

          </div>

        </div>

      `;

    }).join("");

}


/* =====================================
   SELECT TICKET TYPE
===================================== */

async function selectTicketType(type) {

  try {

    window.ticketState.selectedType =
      type;


    document
      .querySelectorAll(".ticket-type")
      .forEach(card => {

        card.classList.toggle(
          "active",
          card.dataset.type === type
        );

      });


    const pricing =
      getPricingByType(type);


    const selection =
      document.getElementById(
        "bookSelection"
      );


    const title =
      document.getElementById(
        "bookSelectionTitle"
      );


    const subtitle =
      document.getElementById(
        "bookSelectionSubtitle"
      );


    selection.classList.remove(
      "hidden"
    );


    title.textContent =
      "Select " +
      pricing.name +
      " Books";


    subtitle.textContent =
      "Loading available books...";


    const result =
      await loadAvailableBooks(type);


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        "Unable to load books."
      );

    }


    const books =
      result.data || [];


    window.ticketState
      .availableBooks[type] =
      books;


    subtitle.textContent =
      books.length +
      " available books";


    renderBookList(
      books
    );


  } catch (error) {

    console.error(error);

    document.getElementById(
      "bookList"
    ).innerHTML =

      `<div class="status">
        ${escapeHtml(error.message)}
      </div>`;

  }

}


/* =====================================
   RENDER BOOK LIST
===================================== */

function renderBookList(books) {

  const container =
    document.getElementById(
      "bookList"
    );


  if (
    !books ||
    books.length === 0
  ) {

    container.innerHTML =

      `<div class="status">
        No available books.
      </div>`;

    return;

  }


  container.innerHTML =
    books.map(book => {

      const bookId =
        getBookId(book);


      const selected =
        isBookSelected(bookId);


      return `

        <button
          type="button"
          class="book-button ${
            selected
              ? "selected"
              : ""
          }"
          onclick="toggleBook('${escapeJs(bookId)}')"
        >

          ${escapeHtml(bookId)}

        </button>

      `;

    }).join("");

}


/* =====================================
   TOGGLE BOOK
===================================== */

function toggleBook(bookId) {

  const index =
    window.ticketState
      .selectedBooks
      .findIndex(
        item =>
          item.bookId === bookId
      );


  if (index >= 0) {

    window.ticketState
      .selectedBooks
      .splice(index, 1);

  } else {

    const type =
      getBookType(bookId);


    window.ticketState
      .selectedBooks
      .push({

        bookId: bookId,

        type: type

      });

  }


  refreshSelectionUI();

}


/* =====================================
   REFRESH SELECTION UI
===================================== */

function refreshSelectionUI() {

  renderCurrentBookList();

  renderSelectedBooks();

  updateSummary();

}


/* =====================================
   RENDER CURRENT BOOK LIST
===================================== */

function renderCurrentBookList() {

  const type =
    window.ticketState
      .selectedType;


  if (!type) {
    return;
  }


  const books =
    window.ticketState
      .availableBooks[type] || [];


  renderBookList(
    books
  );

}


/* =====================================
   RENDER SELECTED BOOKS
===================================== */

function renderSelectedBooks() {

  const section =
    document.getElementById(
      "selectedSection"
    );


  const container =
    document.getElementById(
      "selectedBooks"
    );


  const selected =
    window.ticketState
      .selectedBooks;


  if (
    selected.length === 0
  ) {

    section.classList.add(
      "hidden"
    );

    container.innerHTML = "";

    return;

  }


  section.classList.remove(
    "hidden"
  );


  container.innerHTML =
    selected.map(item => {

      return `

        <div
          class="selected-book"
        >

          <span>
            ${escapeHtml(
              item.bookId
            )}
          </span>

          <button
            type="button"
            class="selected-book-remove"
            onclick="toggleBook('${escapeJs(item.bookId)}')"
          >
            ×
          </button>

        </div>

      `;

    }).join("");

}


/* =====================================
   UPDATE SUMMARY
===================================== */

function updateSummary() {

  const selected =
    window.ticketState
      .selectedBooks;


  const summary =
    document.getElementById(
      "selectionSummary"
    );


  const bookCount =
    selected.length;


  const ticketCount =
    bookCount * 10;


  const totalAmount =
    selected.reduce(
      (total, item) => {

        const pricing =
          getPricingByType(
            item.type
          );


        if (!pricing) {
          return total;
        }


        return total +
          Number(
            pricing.pricePerBook
          );

      },
      0
    );


  document.getElementById(
    "selectedBookCount"
  ).textContent =
    bookCount;


  document.getElementById(
    "selectedTicketCount"
  ).textContent =
    ticketCount;


  document.getElementById(
    "selectedTotalAmount"
  ).textContent =
    "RM" +
    totalAmount.toLocaleString();


  const continueBtn =
    document.getElementById(
      "continueBtn"
    );


  continueBtn.disabled =
    bookCount === 0;


  if (bookCount > 0) {

    summary.classList.remove(
      "hidden"
    );

  } else {

    summary.classList.add(
      "hidden"
    );

  }

}


/* =====================================
   GET PRICING
===================================== */

function getPricingByType(type) {

  return window.ticketState
    .pricing
    .find(
      item =>
        item.type === type
    );

}


/* =====================================
   CHECK SELECTED
===================================== */

function isBookSelected(bookId) {

  return window.ticketState
    .selectedBooks
    .some(
      item =>
        item.bookId === bookId
    );

}


/* =====================================
   GET BOOK ID
===================================== */

function getBookId(book) {

  if (
    typeof book === "string"
  ) {

    return book;

  }


  return String(
    book.bookId ||
    book.Book_ID ||
    book.id ||
    book.ID ||
    ""
  );

}


/* =====================================
   GET BOOK TYPE
===================================== */

function getBookType(bookId) {

  return String(
    bookId
  ).charAt(0)
    .toUpperCase();

}


/* =====================================
   ESCAPE HTML
===================================== */

function escapeHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================
   ESCAPE JS
===================================== */

function escapeJs(value) {

  return String(value)
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    );

}
