import express from "express";
import https from "https";

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

function crawler(arr, data) {
  const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
  let match;
  while ((match = regex.exec(data))) {
    const href = match[2];
    if (!arr.includes(href)) {
      arr.push(href);
    }
  }
}

app.post("/parse", (postReq, postRes) => {
  let data = "";
  postReq.on("data", (chunk) => {
    data += chunk;
  });

  postReq.on("end", () => {
    const link = JSON.parse(data).link;
    const url = new URL(link);
    const getOptions = {
      hostname: url.hostname,
      path: url.pathname,
      method: "GET",
    };

    let responseData = "";
    const getRequest = https.request(getOptions, (getResponse) => {
      const links = [];

      getResponse.on("data", (chunk) => {
        responseData += chunk;
        crawler(links, responseData);
      });

      getResponse.on("end", () => {
        const contentType = getResponse.headers["content-type"];
        if (contentType && contentType.includes("application/json")) {
          postRes.setHeader("Content-Type", "application/json");
        }

        postRes.send(links);
      });
    });

    getRequest.on("error", (error) => {
      console.error(error);
    });

    getRequest.end();
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
