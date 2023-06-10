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

app.post("/hello", (postReq, postRes) => {
  let data = "";
  postReq.on("data", (chunk) => {
    data += chunk;
  });

  postReq.on("end", () => {
    // GET METHOD START
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
        const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
        let match;
        while ((match = regex.exec(responseData))) {
          const href = match[2];
          links.push(href);
        }
      });

      getResponse.on("end", () => {
        const contentType = getResponse.headers["content-type"];
        if (contentType && contentType.includes("application/json")) {
          postRes.setHeader("Content-Type", "application/json");
        }

        postRes.send(responseData);
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
