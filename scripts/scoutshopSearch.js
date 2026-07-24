const https = require("https");

const badge = process.argv.slice(2).join(" ");

const url =
`https://www.scoutshop.org/catalogsearch/result/?q=${encodeURIComponent(badge)}`;

https.get(url, res => {

    let html = "";

    res.on("data", d => html += d);

    res.on("end", () => {

        const matches = html.match(/https:\/\/www\.scoutshop\.org\/media\/klevu_images\/[^"]+/g);

        console.log(matches);

    });

});