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
  return window.ticketState.pricing.find(x=>x.type===type);
}

async function searchTicket(){

  const input=document.getElementById("ticketNumber");
  const result=document.getElementById("ticketResult");
  const ticketNo=Number(input.value);

  if(!ticketNo){
    result.classList.remove("hidden");
    result.innerHTML='<div class="status">Enter a ticket number.</div>';
    return;
  }

  try{

    result.classList.remove("hidden");
    result.innerHTML='<div class="status">Searching...</div>';

    const book=(await findBook(ticketNo)).data;

    window.ticketState.foundBook=book;

    result.innerHTML=`
      <div class="found-book">
        <strong>${escapeHtml(book.bookId)}</strong>
        <span>${escapeHtml(book.typeName)}</span>
        <small>Ticket ${book.startNo} – ${book.endNo}</small>
        <button onclick="addFoundBook()">Add Book</button>
      </div>`;

  }catch(error){

    window.ticketState.foundBook=null;
    result.innerHTML=
      `<div class="status">${escapeHtml(error.message)}</div>`;
  }
}

function addFoundBook(){

  const book=window.ticketState.foundBook;

  if(!book)return;

  if(window.ticketState.selectedBooks
    .some(x=>x.bookId===book.bookId))return;

  window.ticketState.selectedBooks.push(book);

  document.getElementById("ticketNumber").value="";
  document.getElementById("ticketResult").classList.add("hidden");

  renderSelectedBooks();
  updateSummary();
  showCustomerSection();
}

function removeBook(bookId){

  window.ticketState.selectedBooks=
    window.ticketState.selectedBooks
      .filter(x=>x.bookId!==bookId);

  renderSelectedBooks();
  updateSummary();

  if(!window.ticketState.selectedBooks.length){

    document.getElementById("customerSection")
      .classList.add("hidden");

    document.getElementById("previewSection")
      .classList.add("hidden");
  }
}

function showCustomerSection(){
  document.getElementById("customerSection")
    .classList.remove("hidden");
}

function renderSelectedBooks(){

  const books=window.ticketState.selectedBooks;

  document.getElementById("selectedSection")
    .classList.toggle("hidden",!books.length);

  document.getElementById("selectedBooks").innerHTML=
    books.map(book=>`
      <div class="selected-book">

        <div>
          <strong>${escapeHtml(book.bookId)}</strong>
          <small>
            ${escapeHtml(book.typeName)}<br>
            ${book.startNo} – ${book.endNo}
          </small>
        </div>

        <button onclick="removeBook('${escapeHtml(book.bookId)}')">
          ×
        </button>

      </div>
    `).join("");
}

function calculateSaleTotal(){

  return window.ticketState.selectedBooks.reduce(
    (sum,book)=>{
      const p=getPricing(book.type);
      return sum+Number(p?.pricePerBook||0);
    },
    0
  );
}

function updateSummary(){

  const books=window.ticketState.selectedBooks;
  const amount=calculateSaleTotal();

  document.getElementById("selectedBookCount").textContent=
    books.length;

  document.getElementById("selectedTicketCount").textContent=
    books.length*10;

  document.getElementById("selectedTotalAmount").textContent=
    "RM"+amount.toLocaleString();

  document.getElementById("selectionSummary")
    .classList.toggle("hidden",!books.length);

  document.getElementById("continueBtn").disabled=
    !books.length;
}

function continueSale(){

  const name=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();

  if(!name){
    alert("Name is required.");
    return;
  }

  if(!phone){
    alert("Phone is required.");
    return;
  }

  renderPreview();

  document.getElementById("previewSection")
    .classList.remove("hidden");

  document.getElementById("previewSection")
    .scrollIntoView({behavior:"smooth"});
}

function renderPreview(){

  const books=window.ticketState.selectedBooks;
  const name=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();
  const amount=calculateSaleTotal();

  document.getElementById("previewCustomer").innerHTML=`
    <div><strong>${escapeHtml(name)}</strong></div>
    <div>${escapeHtml(phone)}</div>`;

  document.getElementById("previewBooks").innerHTML=
    books.map(book=>`
      <div class="preview-book">
        <strong>${escapeHtml(book.bookId)}</strong>
        <span>
          ${escapeHtml(book.typeName)} ·
          ${book.startNo} – ${book.endNo}
        </span>
      </div>
    `).join("");

  document.getElementById("previewBookCount").textContent=
    books.length;

  document.getElementById("previewTicketCount").textContent=
    books.length*10;

  document.getElementById("previewAmount").textContent=
    "RM"+amount.toLocaleString();

  updatePaymentUI();
}

function updatePaymentUI(){

  const status=document.querySelector(
    'input[name="paymentStatus"]:checked'
  ).value;

  const paidBox=document.getElementById("paidAmountBox");
  const methodBox=document.getElementById("paymentMethodBox");

  paidBox.classList.toggle("hidden",status==="UNPAID");
  methodBox.classList.toggle("hidden",status==="UNPAID");

  if(status==="PAID"){
    document.getElementById("paidAmount").value=
      calculateSaleTotal();
  }
}

async function submitSale(){

  const books=window.ticketState.selectedBooks;

  if(!books.length){
    alert("Please select at least one book.");
    return;
  }

  const data={
    name:document.getElementById("customerName").value.trim(),
    phone:document.getElementById("customerPhone").value.trim(),
    remark:document.getElementById("customerRemark").value.trim(),
    paymentStatus:document.querySelector(
      'input[name="paymentStatus"]:checked'
    ).value,
    paidAmount:Number(
      document.getElementById("paidAmount").value||0
    ),
    paymentMethod:
      document.getElementById("paymentMethod").value,
    items:books.map(book=>({
      bookId:book.bookId,
      type:book.type
    }))
  };

  const btn=document.getElementById("createSaleBtn");

  try{

    btn.disabled=true;
    btn.textContent="Creating...";

    const result=await apiPost("createSale",data);

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
      "RM"+Number(result.totalAmount||0).toLocaleString(),
    resultPaid:
      "RM"+Number(result.paidAmount||0).toLocaleString(),
    resultBalance:
      "RM"+Number(result.balance||0).toLocaleString(),
    resultPaymentStatus:result.paymentStatus
  };

  Object.keys(fields).forEach(id=>{
    document.getElementById(id).textContent=fields[id];
  });

  document.getElementById("saleResult")
    .classList.remove("hidden");

  document.getElementById("saleResult")
    .scrollIntoView({behavior:"smooth"});
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
    document.getElementById(id).value="";
  });

  document.querySelector(
    'input[name="paymentStatus"][value="UNPAID"]'
  ).checked=true;

  [
    "selectedSection",
    "customerSection",
    "previewSection",
    "saleResult"
  ].forEach(id=>{
    document.getElementById(id).classList.add("hidden");
  });

  renderSelectedBooks();
  updateSummary();
  updatePaymentUI();

  window.scrollTo({top:0,behavior:"smooth"});
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

  try{

    const response=await loadPricing();

    window.ticketState.pricing=
      response.data||response||[];

  }catch(error){

    console.error("Pricing load failed:",error);
  }

  document.getElementById("findTicketBtn").onclick=searchTicket;
  document.getElementById("continueBtn").onclick=continueSale;
  document.getElementById("createSaleBtn").onclick=submitSale;
  document.getElementById("newSaleBtn").onclick=resetSale;

  document.querySelectorAll(
    'input[name="paymentStatus"]'
  ).forEach(input=>{
    input.onchange=updatePaymentUI;
  });

  updatePaymentUI();
}
