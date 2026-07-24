// ==========================================
// WAC Badge Image Downloader
// Downloads all badge images from the Adventures sheet
// ==========================================

const fs = require("fs");
const path = require("path");
const https = require("https");

const API_URL =
"https://script.google.com/macros/s/AKfycbz164ckVufAyrZag1ZlIh0z6m1cfrEc0USYOyl5k8ZpgLlEL9uvpZmdhrH6iWtPZONi/exec?sheet=Adventures";

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
    console.log("=========================================");
    console.log(" WAC BADGE IMAGE DOWNLOADER");
    console.log("=========================================");
    console.log("");

    const response = await fetch(API_URL);
    const json = await response.json();

    if (!json.success) {
        console.error("API Error:", json.error);
        return;
    }

    const adventures = json.data;

    console.log(`Found ${adventures.length} adventures.`);
    console.log("");

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const adventure of adventures) {

        const id = adventure.ID?.trim();

        const imageUrl = adventure["Badge Images"]?.trim();

        if (!id || !imageUrl) {
            console.log(`Skipping ${id || "Unknown"} (missing image).`);
            skipped++;
            continue;
        }

        const extension = path.extname(new URL(imageUrl).pathname) || ".png";

        const filename = `${id}${extension}`;

        const destination = path.join(outputFolder, filename);

        if (fs.existsSync(destination)) {
            console.log(`✓ ${filename} already exists`);
            skipped++;
            continue;
        }

        try {

            process.stdout.write(`Downloading ${filename}... `);

            await download(imageUrl, destination);

            console.log("Done");

            downloaded++;

        } catch (err) {

            console.log("FAILED");

            console.error(`   ${err.message}`);

            failed++;

        }

    }

    console.log("");
    console.log("=========================================");
    console.log("Download Complete");
    console.log("=========================================");
    console.log(`Downloaded : ${downloaded}`);
    console.log(`Skipped    : ${skipped}`);
    console.log(`Failed     : ${failed}`);
    console.log("");

})();