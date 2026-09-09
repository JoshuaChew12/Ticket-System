const pages = ["home","tickets","sales","return"];

async function loadPage(page) {

  if (!pages.includes(page)) page = "home";

  const box = document.getElementById("pageContent");

  try {

    box.innerHTML = "<div class=\"status\">Loading...</div>";

    const response = await fetch(page + ".html");

    if (!response.ok) {
      throw new Error("Page load failed.");
    }

    box.innerHTML = await response.text();

    document
      .querySelectorAll(".bottom-nav button")
      .forEach(btn =>
        btn.classList.toggle(
          "active",
          btn.dataset.page === page
        )
      );

    if (page === "home" && typeof initHome === "function") {
      initHome();
    }

    if (page === "tickets" && typeof initTickets === "function") {
      initTickets();
    }

    if (page === "sales" && typeof initSales === "function") {
      initSales();
    }

    if (page === "return" && typeof initReturn === "function") {
      initReturn();
    }

  } catch (error) {

    box.innerHTML =
      `<div class="status">
        ${error.message}
      </div>`;

  }

}


document
  .querySelectorAll(".bottom-nav button")
  .forEach(btn => {

    btn.onclick = () =>
      loadPage(btn.dataset.page);

  });


loadPage("home");
