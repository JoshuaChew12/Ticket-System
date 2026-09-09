window.salesState={
  currentSaleId:"",
  searchResults:[]
};

async function searchSales(){

  const input=document.getElementById("saleSearchInput");
  const status=document.getElementById("saleSearchStatus");
  const results=document.getElementById("saleSearchResults");
  const keyword=input.value.trim();

  if(!keyword){
    status.innerHTML='<div class="status">Enter a search keyword.</div>';
    results.innerHTML="";
    return;
  }

  try{

    status.innerHTML='<div class="status">Searching...</div>';
    results.innerHTML="";

    const response=await apiGet(
      "searchSales",
      {keyword}
    );

    window.salesState.searchResults=response.data||[];

    renderSaleSearchResults();

    status.innerHTML=window.salesState.searchResults.length
      ?""
      :'<div class="status">No sales found.</div>';

  }catch(error){

    status.innerHTML=
      `<div class="status">${escapeHtml(error.message)}</div>`;
  }
}

function renderSaleSearchResults(){

  const box=document.getElementById("saleSearchResults");
  const data=window.salesState.searchResults;

  box.className="sale-search-results";

  box.innerHTML=data.map(sale=>{

    const status=
      String(sale.paymentStatus||"").toUpperCase();

    return`

      <button class="sale-search-item"
        onclick="openSaleDetail('${escapeHtml(sale.saleId)}')">

        <div>

          <strong>${escapeHtml(sale.saleId)}</strong>

          <span>
            ${escapeHtml(sale.name||"-")}
          </span>

          <small>
            ${escapeHtml(sale.phone||"-")}
          </small>

        </div>

        <div>

          <b>
            RM${Number(sale.totalAmount||0).toLocaleString()}
          </b>

          <small class="status-badge status-${status.toLowerCase()}">
            ${escapeHtml(status||"-")}
          </small>

        </div>

      </button>
    `;

  }).join("");
}

async function openSaleDetail(saleId){

  window.salesState.currentSaleId=saleId;

  const section=document.getElementById("saleDetailSection");
  const detail=document.getElementById("saleDetail");
  const payment=document.getElementById("paymentSection");

  section.classList.remove("hidden");
  payment.classList.add("hidden");
  detail.innerHTML='<div class="status">Loading...</div>';

  try{

    const result=await apiGet(
      "getSale",
      {saleId}
    );

    renderSaleDetail(result);

    section.scrollIntoView({
      behavior:"smooth"
    });

  }catch(error){

    detail.innerHTML=
      `<div class="status">${escapeHtml(error.message)}</div>`;
  }
}

function renderSaleDetail(result){

  const sale=result.sale;
  const items=result.items||[];
  const payments=result.payments||[];

  const paymentStatus=
    String(sale.paymentStatus||"").toUpperCase();

  document.getElementById("saleDetail").innerHTML=`

    <div class="sale-detail-header">

      <span>Sale ID</span>

      <strong>
        ${escapeHtml(sale.saleId)}
      </strong>

    </div>

    <div class="sale-detail-customer">

      <strong>
        ${escapeHtml(sale.name||"-")}
      </strong>

      <span>
        ${escapeHtml(sale.phone||"-")}
      </span>

      ${sale.remark?
        `<small>${escapeHtml(sale.remark)}</small>`:""}

    </div>

    <div class="sale-detail-books">

      ${items.map(item=>`

        <div class="sale-detail-book">

          <div>

            <strong>
              ${escapeHtml(item.bookId)}
            </strong>

            <span>
              ${escapeHtml(item.typeName||item.type)}
            </span>

          </div>

          <div>

            <span>
              ${item.startNo} – ${item.endNo}
            </span>

            <small>
              ${escapeHtml(item.status||"-")}
            </small>

          </div>

        </div>

      `).join("")}

    </div>

    <div class="sale-detail-total">

      <div>
        <span>Total Books</span>
        <strong>${sale.totalBooks}</strong>
      </div>

      <div>
        <span>Total Tickets</span>
        <strong>${sale.totalTickets}</strong>
      </div>

      <div>
        <span>Total Amount</span>
        <strong>
          RM${Number(sale.totalAmount||0).toLocaleString()}
        </strong>
      </div>

      <div>
        <span>Paid</span>
        <strong>
          RM${Number(sale.paidAmount||0).toLocaleString()}
        </strong>
      </div>

      <div>
        <span>Balance</span>
        <strong>
          RM${Number(sale.balance||0).toLocaleString()}
        </strong>
      </div>

      <div>
        <span>Payment Status</span>

        <strong>
          <span class="status-badge status-${paymentStatus.toLowerCase()}">
            ${escapeHtml(paymentStatus||"-")}
          </span>
        </strong>

      </div>

    </div>

    <div class="sale-detail-payments">

      <h3>Payment History</h3>

      ${
        payments.length
        ?payments.map(payment=>`

          <div class="payment-row">

            <div>

              <strong>
                RM${Number(payment.amount||0).toLocaleString()}
              </strong>

              <span>
                ${escapeHtml(payment.paymentMethod||"-")}
              </span>

              <small>
                ${formatPaymentDate(payment.paymentTime)}
              </small>

            </div>

            <small>
              ${escapeHtml(payment.reference||"")}
            </small>

          </div>

        `).join("")
        :'<div class="status">No payment recorded.</div>'
      }

    </div>
  `;

  document.getElementById("paymentSection")
    .classList.toggle(
      "hidden",
      Number(sale.balance||0)<=0
    );

  [
    "paymentAmount",
    "salePaymentMethod",
    "paymentReference",
    "paymentRemark"
  ].forEach(id=>{
    document.getElementById(id).value="";
  });
}

function formatPaymentDate(value){

  if(!value){
    return "-";
  }

  const date=new Date(value);

  if(isNaN(date.getTime())){
    return escapeHtml(value);
  }

  return date.toLocaleString("en-MY",{
    day:"numeric",
    month:"short",
    year:"numeric",
    hour:"numeric",
    minute:"2-digit",
    hour12:true
  });
}

async function recordSalePayment(){

  const saleId=window.salesState.currentSaleId;

  const amount=Number(
    document.getElementById("paymentAmount").value||0
  );

  const paymentMethod=
    document.getElementById("salePaymentMethod").value;

  const reference=
    document.getElementById("paymentReference")
      .value.trim();

  const remark=
    document.getElementById("paymentRemark")
      .value.trim();

  if(!saleId){
    alert("Sale not selected.");
    return;
  }

  if(amount<=0){
    alert("Payment amount must be greater than 0.");
    return;
  }

  if(!paymentMethod){
    alert("Payment method is required.");
    return;
  }

  const btn=
    document.getElementById("recordPaymentBtn");

  try{

    btn.disabled=true;
    btn.textContent="Recording...";

    await apiPost("recordPayment",{
      saleId,
      amount,
      paymentMethod,
      reference,
      remark
    });

    await openSaleDetail(saleId);

    alert("Payment recorded successfully.");

  }catch(error){

    alert(error.message);

  }finally{

    btn.disabled=false;
    btn.textContent="Record Payment";
  }
}

function backToSaleSearch(){

  document.getElementById("saleDetailSection")
    .classList.add("hidden");

  window.salesState.currentSaleId="";

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

function initSales(){

  document.getElementById("saleSearchBtn").onclick=
    searchSales;

  document.getElementById("recordPaymentBtn").onclick=
    recordSalePayment;

  document.getElementById("backToSaleSearchBtn").onclick=
    backToSaleSearch;

  document.getElementById("saleSearchInput").onkeydown=e=>{

    if(e.key==="Enter"){
      searchSales();
    }

  };
}
