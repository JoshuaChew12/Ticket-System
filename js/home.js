window.homeState={inventory:[]};

async function loadInventory(){

  const result=await apiGet("getInventory");

  window.homeState.inventory=result.data||result||[];

  const map={
    H:"honorary",
    V:"vip",
    S:"student"
  };

  window.homeState.inventory.forEach(item=>{

    const key=map[item.type];

    if(!key)return;

    ["available","held","sold"].forEach(status=>{
      const el=document.getElementById(
        key+status.charAt(0).toUpperCase()+status.slice(1)
      );

      if(el){
        el.textContent=
          Number(item[status]||0).toLocaleString();
      }
    });
  });

  document.getElementById("systemStatus").textContent=
    "Connected";
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
