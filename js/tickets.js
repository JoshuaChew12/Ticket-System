// =====================================================
// LOAD PRICING
// =====================================================

async function loadPricing() {

  return await apiGet(
    "getPricing"
  );

}


// =====================================================
// LOAD AVAILABLE BOOKS
// =====================================================

async function loadAvailableBooks(
  type
) {

  return await apiGet(
    "getAvailableBooks",
    {
      type: type
    }
  );

}


// =====================================================
// RENDER TICKET TYPES
// =====================================================

function renderTicketTypes(
  pricing
) {

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
    pricing
      .map(item => {

        return `

          <div class="ticket-type">

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
              )} books

            </div>

          </div>

        `;

      })
      .join("");

}


// =====================================================
// HTML ESCAPE
// =====================================================

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
