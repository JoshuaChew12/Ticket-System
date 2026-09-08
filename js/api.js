// =====================================================
// API CONFIG
// =====================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwekrB8oFNYxApSknKPjSvkAN99tm8lg2eOKf4jKwO8GaTWswk0zltiAPq_bpeCY0M8Cg/exec";


// =====================================================
// GET API
// =====================================================

async function apiGet(
  action,
  params = {}
) {

  const query =
    new URLSearchParams();


  query.set(
    "action",
    action
  );


  Object.keys(params)
    .forEach(key => {

      const value =
        params[key];


      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {

        query.set(
          key,
          value
        );

      }

    });


  const url =
    API_URL +
    "?" +
    query.toString();


  const response =
    await fetch(url);


  if (!response.ok) {

    throw new Error(
      "API request failed: " +
      response.status
    );

  }


  const data =
    await response.json();


  if (
    data &&
    data.success === false
  ) {

    throw new Error(
      data.error ||
      "API error."
    );

  }


  return data;

}
