// ==========================================
// WAC Database Export Tool
// Version 1.1
// ==========================================

const fs = require("fs");
const path = require("path");

const API_URL =
"https://script.google.com/macros/s/AKfycbz164ckVufAyrZag1ZlIh0z6m1cfrEc0USYOyl5k8ZpgLlEL9uvpZmdhrH6iWtPZONi/exec";

const SHEETS = [
    "Badges",
    "Members",
    "Events",
    "Resources",
    "News",
    "Locations"
];

async function exportSheet(sheetName) {

    console.log("");
    console.log(`Exporting ${sheetName}...`);

    const response = await fetch(
        `${API_URL}?sheet=${sheetName}`
    );

    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status} while reading ${sheetName}`
        );

    }

    const json = await response.json();

    console.log("API Response:");
    console.log(json);

    const outputFolder = path.join(
        __dirname,
        "../data"
    );

    if (!fs.existsSync(outputFolder)) {

        fs.mkdirSync(outputFolder, { recursive: true });

    }

    const fileName = path.join(
        outputFolder,
        `${sheetName.toLowerCase()}.json`
    );

    fs.writeFileSync(
        fileName,
        JSON.stringify(json, null, 2),
        "utf8"
    );

    console.log(`✔ Saved ${fileName}`);

}

(async () => {

    console.log("");
    console.log("===============================");
    console.log(" WAC DATABASE EXPORT TOOL");
    console.log("===============================");

    try {

        for (const sheet of SHEETS) {

            await exportSheet(sheet);

        }

        console.log("");
        console.log("Export Complete!");

    }

    catch (err) {

        console.error("");
        console.error("EXPORT FAILED");
        console.error(err);

    }

})();