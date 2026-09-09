window.ticketState={
  pricing:[],
  selectedBooks:[],
  foundBook:null
};

async function loadPricing(){
  return apiGet("getPricing");
}

async function findBook(ticketNo){
  return apiGet("findBookByTicket",{ticketNo});
}

function getPricing(type){
  return window.ticketState.pricing.find(
    x=>x.type===type
  );
}

async function searchTicket(){

  const input=document.getElementById("ticketNumber");
  const result=document.getElementById("ticketResult");

  if(!input||!result)return;

  const ticketNo=Number(input.value);

  if(!ticketNo){
    result.classList.remove("hidden");
    result.innerHTML=
      '<div class="status">Enter a ticket number.</div>';
    return;
  }

  try{

    result.classList.remove("hidden");
    result.innerHTML=
      '<div class="status">Searching...</div>';

    const book=(await findBook(ticketNo)).data;

    window.ticketState.foundBook=book;

    result.innerHTML=`
      <div class="found-book">

        <strong>${escapeHtml(book.bookId)}</strong>

        <span>
          ${escapeHtml(book.typeName)}
        </span>

        <small>
          Ticket ${book.startNo} – ${book.endNo}
        </small>

        <button id="addFoundBookBtn">
          Add Book
        </button>

      </div>`;

    const addBtn=
      document.getElementById("addFoundBookBtn");

    if(addBtn){
      addBtn.onclick=addFoundBook;
    }

  }catch(error){

    window.ticketState.foundBook=null;

    result.innerHTML=
      `<div class="status">
        ${escapeHtml(error.message)}
      </div>`;
  }
}

function addFoundBook(){

  const book=window.ticketState.foundBook;

  if(!book)return;

  if(
    window.ticketState.selectedBooks
      .some(x=>x.bookId===book.bookId)
  ){
    return;
  }

  window.ticketState.selectedBooks.push(book);

  const ticketInput=
    document.getElementById("ticketNumber");

  const ticketResult=
    document.getElementById("ticketResult");

  if(ticketInput){
    ticketInput.value="";
  }

  if(ticketResult){
    ticketResult.classList.add("hidden");
  }

  renderSelectedBooks();
  updateSummary();
  showCustomerSection();
}

function removeBook(bookId){

  window.ticketState.selectedBooks=
    window.ticketState.selectedBooks.filter(
      x=>x.bookId!==bookId
    );

  renderSelectedBooks();
  updateSummary();

  const preview=
    document.getElementById("previewSection");

  if(preview){
    preview.classList.add("hidden");
  }

  if(!window.ticketState.selectedBooks.length){

    const customer=
      document.getElementById("customerSection");

    if(customer){
      customer.classList.add("hidden");
    }
  }
}

function showCustomerSection(){

  const section=
    document.getElementById("customerSection");

  if(section){
    section.classList.remove("hidden");
  }
}

function renderSelectedBooks(){

  const books=
    window.ticketState.selectedBooks;

  const section=
    document.getElementById("selectedSection");

  const box=
    document.getElementById("selectedBooks");

  if(!section||!box)return;

  section.classList.toggle(
    "hidden",
    !books.length
  );

  box.innerHTML=
    books.map(book=>`
      <div class="selected-book">

        <div>

          <strong>
            ${escapeHtml(book.bookId)}
          </strong>

          <small>
            ${escapeHtml(book.typeName)}<br>
            ${book.startNo} – ${book.endNo}
          </small>

        </div>

        <button
          onclick="removeBook('${escapeHtml(book.bookId)}')">
          ×
        </button>

      </div>
    `).join("");
}

function calculateSaleTotal(){

  return window.ticketState.selectedBooks.reduce(
    (sum,book)=>{

      const p=getPricing(book.type);

      return sum+
        Number(p?.pricePerBook||0);

    },
    0
  );
}

function updateSummary(){

  const books=
    window.ticketState.selectedBooks;

  const amount=
    calculateSaleTotal();

  const bookCount=
    document.getElementById("selectedBookCount");

  const ticketCount=
    document.getElementById("selectedTicketCount");

  const totalAmount=
    document.getElementById("selectedTotalAmount");

  const summary=
    document.getElementById("selectionSummary");

  const continueBtn=
    document.getElementById("continueBtn");

  if(
    !bookCount||
    !ticketCount||
    !totalAmount||
    !summary||
    !continueBtn
  ){
    return;
  }

  bookCount.textContent=books.length;

  ticketCount.textContent=
    books.length*10;

  totalAmount.textContent=
    "RM"+amount.toLocaleString();

  summary.classList.toggle(
    "hidden",
    !books.length
  );

  continueBtn.disabled=
    !books.length;
}

function continueSale(){

  const nameElement=
    document.getElementById("customerName");

  const phoneElement=
    document.getElementById("customerPhone");

  if(!nameElement||!phoneElement)return;

  const name=
    nameElement.value.trim();

  const phone=
    phoneElement.value.trim();

  if(!name){
    alert("Name is required.");
    return;
  }

  if(!phone){
    alert("Phone is required.");
    return;
  }

  renderPreview();

  const preview=
    document.getElementById("previewSection");

  const summary=
    document.getElementById("selectionSummary");

  if(preview){
    preview.classList.remove("hidden");

    preview.scrollIntoView({
      behavior:"smooth"
    });
  }

  if(summary){
    summary.classList.add("hidden");
  }
}

function renderPreview(){

  const books=
    window.ticketState.selectedBooks;

  const name=
    document.getElementById("customerName")
      .value.trim();

  const phone=
    document.getElementById("customerPhone")
      .value.trim();

  const amount=
    calculateSaleTotal();

  document.getElementById(
    "previewCustomer"
  ).innerHTML=`
    <div>
      <strong>${escapeHtml(name)}</strong>
    </div>

    <div>
      ${escapeHtml(phone)}
    </div>
  `;

  document.getElementById(
    "previewBooks"
  ).innerHTML=
    books.map(book=>`
      <div class="preview-book">

        <strong>
          ${escapeHtml(book.bookId)}
        </strong>

        <span>
          ${escapeHtml(book.typeName)} ·
          ${book.startNo} – ${book.endNo}
        </span>

      </div>
    `).join("");

  document.getElementById(
    "previewBookCount"
  ).textContent=books.length;

  document.getElementById(
    "previewTicketCount"
  ).textContent=
    books.length*10;

  document.getElementById(
    "previewAmount"
  ).textContent=
    "RM"+amount.toLocaleString();

  updatePaymentUI();
}

function updatePaymentUI(){

  const selected=
    document.querySelector(
      'input[name="paymentStatus"]:checked'
    );

  if(!selected)return;

  const status=selected.value;

  const paidBox=
    document.getElementById("paidAmountBox");

  const methodBox=
    document.getElementById("paymentMethodBox");

  if(!paidBox||!methodBox)return;

  paidBox.classList.toggle(
    "hidden",
    status==="UNPAID"
  );

  methodBox.classList.toggle(
    "hidden",
    status==="UNPAID"
  );

  if(status==="PAID"){

    const paidAmount=
      document.getElementById("paidAmount");

    if(paidAmount){
      paidAmount.value=
        calculateSaleTotal();
    }
  }
}

async function submitSale(){

  const books=
    window.ticketState.selectedBooks;

  if(!books.length){
    alert("Please select at least one book.");
    return;
  }

  const data={
    name:
      document.getElementById("customerName")
        .value.trim(),

    phone:
      document.getElementById("customerPhone")
        .value.trim(),

    remark:
      document.getElementById("customerRemark")
        .value.trim(),

    paymentStatus:
      document.querySelector(
        'input[name="paymentStatus"]:checked'
      ).value,

    paidAmount:Number(
      document.getElementById("paidAmount")
        .value||0
    ),

    paymentMethod:
      document.getElementById("paymentMethod")
        .value,

    items:
      books.map(book=>({
        bookId:book.bookId,
        type:book.type
      }))
  };

  const btn=
    document.getElementById("createSaleBtn");

  if(!btn)return;

  try{

    btn.disabled=true;
    btn.textContent="Creating...";

    const result=
      await apiPost("createSale",data);

    showSaleResult(result);

  }catch(error){

    alert(error.message);

  }finally{

    btn.disabled=false;
    btn.textContent="Create Sale";
  }
}

function showSaleResult(result){

  const fields={
    resultSaleId:result.saleId,
    resultCustomer:result.name,
    resultPhone:result.phone,
    resultBooks:result.totalBooks,
    resultTickets:result.totalTickets,

    resultTotal:
      "RM"+
      Number(result.totalAmount||0)
        .toLocaleString(),

    resultPaid:
      "RM"+
      Number(result.paidAmount||0)
        .toLocaleString(),

    resultBalance:
      "RM"+
      Number(result.balance||0)
        .toLocaleString(),

    resultPaymentStatus:
      result.paymentStatus
  };

  Object.keys(fields).forEach(id=>{

    const el=
      document.getElementById(id);

    if(el){
      el.textContent=fields[id];
    }

  });

  const resultBox=
    document.getElementById("saleResult");

  if(resultBox){

    resultBox.classList.remove("hidden");

    resultBox.scrollIntoView({
      behavior:"smooth"
    });
  }
}

function resetSale(){

  window.ticketState={
    pricing:window.ticketState.pricing,
    selectedBooks:[],
    foundBook:null
  };

  [
    "ticketNumber",
    "customerName",
    "customerPhone",
    "customerRemark",
    "paidAmount",
    "paymentMethod"
  ].forEach(id=>{

    const el=
      document.getElementById(id);

    if(el){
      el.value="";
    }

  });

  const unpaid=
    document.querySelector(
      'input[name="paymentStatus"][value="UNPAID"]'
    );

  if(unpaid){
    unpaid.checked=true;
  }

  [
    "selectedSection",
    "customerSection",
    "previewSection",
    "saleResult"
  ].forEach(id=>{

    const el=
      document.getElementById(id);

    if(el){
      el.classList.add("hidden");
    }

  });

  renderSelectedBooks();
  updateSummary();
  updatePaymentUI();

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function escapeHtml(value){

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

async function initTickets(){

  const findBtn=
    document.getElementById("findTicketBtn");

  const continueBtn=
    document.getElementById("continueBtn");

  const createBtn=
    document.getElementById("createSaleBtn");

  const newSaleBtn=
    document.getElementById("newSaleBtn");

  if(findBtn){
    findBtn.onclick=searchTicket;
  }

  if(continueBtn){
    continueBtn.onclick=continueSale;
  }

  if(createBtn){
    createBtn.onclick=submitSale;
  }

  if(newSaleBtn){
    newSaleBtn.onclick=resetSale;
  }

  document.querySelectorAll(
    'input[name="paymentStatus"]'
  ).forEach(input=>{
    input.onchange=updatePaymentUI;
  });

  updatePaymentUI();

  try{

    const response=
      await loadPricing();

    if(
      !document.getElementById("ticketNumber")
    ){
      return;
    }

    window.ticketState.pricing=
      response.data||response||[];

  }catch(error){

    console.error(
      "Pricing load failed:",
      error
    );
  }
}
