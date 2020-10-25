// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("client.js");

document.getElementById("new-url").addEventListener("click", () => {
  const input = document.querySelector("input.form-control");
  const url = input.value;

  const body = JSON.stringify({ url: url });
  console.log(body);

  fetch("/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
    .then((response) => response.json())
    .then((data) => {
      const slugUrl = data.slug;
      const a = document.createElement("a");

      a.title = "Votre lien raccourci";
      a.href = slugUrl;
      a.innerHTML = `ici`;

      document.querySelector(".short-url").innerHTML = "Votre lien raccourci ";
      document.querySelector(".short-url").appendChild(a);

      input.value = "";
    });
});
