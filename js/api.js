const API_URL="https://script.google.com/macros/s/AKfycbwekrB8oFNYxApSknKPjSvkAN99tm8lg2eOKf4jKwO8GaTWswk0zltiAPq_bpeCY0M8Cg/exec";

async function apiGet(action,params={}){

  const query=new URLSearchParams({action});

  Object.keys(params).forEach(key=>{
    const value=params[key];
    if(value!==undefined&&value!==null&&value!==""){
      query.set(key,value);
    }
  });

  const response=await fetch(API_URL+"?"+query);

  if(!response.ok){
    throw new Error("API request failed: "+response.status);
  }

  const data=await response.json();

  if(data?.success===false){
    throw new Error(data.error||"API error.");
  }

  return data;
}

async function apiPost(action,data={}){

  const response=await fetch(API_URL,{
    method:"POST",
    headers:{
      "Content-Type":"text/plain;charset=utf-8"
    },
    body:JSON.stringify({action,...data})
  });

  if(!response.ok){
    throw new Error("API request failed: "+response.status);
  }

  const result=await response.json();

  if(result?.success===false){
    throw new Error(result.error||"API error.");
  }

  return result;
}
