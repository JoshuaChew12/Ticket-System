window.homeState={
  inventory:[]
};

async function loadInventory(){

  const result=await apiGet("getInventory");

  window.homeState.inventory=result.data||result||[];

  renderInventory();
}

function renderInventory(){

  const data=window.homeState.inventory;

  const map={
    H:"honorary",
    V:"vip",
    S:"student"
  };

  data.forEach(item=>{

    const key=map[item.type];
    if(!key)return;

    setInventoryValue(
      key+"Available",
      item.available
    );

    setInventoryValue(
      key+"Held",
      item.held
    );

    setInventoryValue(
      key+"Sold",
      item.sold
    );
  });

  document.getElementById("systemStatus").textContent=
    "Connected";
}

function setInventoryValue(id,value){

  const el=document.getElementById(id);

  if(el){
    el.textContent=Number(value||0).toLocaleString();
  }
}

async function initHome(){

  const status=document.getElementById("systemStatus");

  status.textContent="Loading...";

  try{

    await loadInventory();

  }catch(error){

    status.textContent=error.message;

  }
}
