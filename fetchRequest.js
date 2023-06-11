const randomLink = "https://example.github.io/";

const url = "http://localhost:3000/parse";
const data = { domainName: "https://www.youtube.com/" };

function isJsonString(response) {
  const contentType = response.headers.get("content-type");
  console.log(contentType);
  if (contentType && contentType.includes("application/json")) {
    console.log("IS JSON");
    return response.json();
  } else {
    console.log("ISN'T JSON");
    return response.text();
  }
}

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then((response) => isJsonString(response))
  .then((result) => {
    const rootDiv = document.getElementById("root-div");
    result.forEach((href, idx) => {
      if (href !== "/") {
        const linkTag = document.createElement("a");
        linkTag.innerText = href;
        linkTag.href = href;
        linkTag.target = "_blank";
        rootDiv.appendChild(linkTag);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });
