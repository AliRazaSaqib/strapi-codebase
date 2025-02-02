const revalidateStaticSite = () => {
  console.log("i am runing a static site");
  const BASE_URL = "http://localhost:3000";
  fetch(`${BASE_URL}/api/revalidate`, {
    method: "GET",
  });
};
module.exports = {
  revalidateStaticSite,
};
