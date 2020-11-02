const validator = require("validator");

document.getElementById("new-url").addEventListener("click", () => {
  const input = document.querySelector("input.form-control");
  let url = input.value;

  if (validator.isURL(url)) {
    const body = JSON.stringify({ url: url });

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

        document.querySelector(".short-url").innerHTML =
          "Votre lien raccourci ";
        document.querySelector(".short-url").appendChild(a);

        input.value = "";
      });
  } else {
    console.log("Is not a url");
  }
});
