// ==========================================
// WAC Badge Image Downloader
// ==========================================

const fs = require("fs");
const path = require("path");
const https = require("https");

const API_URL =
"https://script.google.com/macros/s/AKfycbz164ckVufAyrZag1ZlIh0z6m1cfrEc0USYOyl5k8ZpgLlEL9uvpZmdhrH6iWtPZONi/exec?sheet=Badges";

const outputFolder = path.join(__dirname, "../assets/badges");

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function download(url, destination) {

    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(destination);

        https.get(url, response => {

            if (response.statusCode !== 200) {

                reject(new Error(`HTTP ${response.statusCode}`));
                return;

            }

            response.pipe(file);

            file.on("finish", () => {

                file.close(resolve);

            });

        }).on("error", reject);

    });

}

(async () => {

    console.log("");
    console.log("==============================");
    console.log("DOWNLOADING BADGE IMAGES");
    console.log("==============================");

    const response = await fetch(API_URL);

    const json = await response.json();

    console.log("API Response:");
    console.log(json);

})();