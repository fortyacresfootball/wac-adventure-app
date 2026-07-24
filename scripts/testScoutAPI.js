const https = require("https");

const url =
"https://www.scoutshop.org/klevu/search?q=Reading%20Merit%20Badge%20Emblem";

https.get(url, res => {

    console.log("Status:", res.statusCode);

    let body = "";

    res.on("data", d => body += d);

    res.on("end", () => {

        console.log(body.substring(0,1000));

    });

});