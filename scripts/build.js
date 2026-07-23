// ==========================================
// WAC Offline Build System
// ==========================================

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const API_URL =
    "https://script.google.com/macros/s/AKfycbz164ckVufAyrZag1ZlIh0z6m1cfrEc0USYOyl5k8ZpgLlEL9uvpZmdhrH6iWtPZONi/exec";

const SHEETS = [
    "Badges",
    "Members",
    "Achievements",
    "Events",
    "News",
    "Locations",
    "Photos",
    "Categories"
];

const dataFolder = path.join(__dirname, "../data");
const badgeFolder = path.join(__dirname, "../assets/badges");

fs.mkdirSync(dataFolder, { recursive: true });
fs.mkdirSync(badgeFolder, { recursive: true });

function safeFileName(value) {
    return String(value)
        .trim()
        .replace(/[<>:"/\\|?*]/g, "-");
}

function getExtension(url) {
    try {
        const extension = path.extname(new URL(url).pathname);

        if (extension && extension.length <= 6) {
            return extension.toLowerCase();
        }
    } catch (error) {
        // Use PNG when the URL cannot be parsed.
    }

    return ".png";
}

function downloadFile(url, destination, redirects = 0) {
    return new Promise((resolve, reject) => {
        if (redirects > 5) {
            reject(new Error("Too many redirects"));
            return;
        }

        const client = url.startsWith("https:") ? https : http;

        const request = client.get(
            url,
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 WAC-Adventure-App/1.0",
                    Accept: "image/*,*/*;q=0.8"
                }
            },
            response => {
                if (
                    response.statusCode >= 300 &&
                    response.statusCode < 400 &&
                    response.headers.location
                ) {
                    response.resume();

                    const redirectedUrl = new URL(
                        response.headers.location,
                        url
                    ).toString();

                    downloadFile(
                        redirectedUrl,
                        destination,
                        redirects + 1
                    )
                        .then(resolve)
                        .catch(reject);

                    return;
                }

                if (response.statusCode !== 200) {
                    response.resume();

                    reject(
                        new Error(
                            `HTTP ${response.statusCode}`
                        )
                    );

                    return;
                }

                const file = fs.createWriteStream(destination);

                response.pipe(file);

                file.on("finish", () => {
                    file.close(resolve);
                });

                file.on("error", error => {
                    file.close();

                    fs.rmSync(destination, {
                        force: true
                    });

                    reject(error);
                });
            }
        );

        request.on("error", reject);
    });
}

async function fetchSheet(sheetName) {
    console.log(`Exporting ${sheetName}...`);

    const response = await fetch(
        `${API_URL}?sheet=${encodeURIComponent(sheetName)}`
    );

    if (!response.ok) {
        throw new Error(
            `${sheetName}: HTTP ${response.status}`
        );
    }

    const json = await response.json();

    const rows = Array.isArray(json)
        ? json
        : json.data;

    if (!Array.isArray(rows)) {
        throw new Error(
            `${sheetName}: API did not return a data array`
        );
    }

    const outputPath = path.join(
        dataFolder,
        `${sheetName.toLowerCase()}.json`
    );

    fs.writeFileSync(
        outputPath,
        JSON.stringify(rows, null, 2),
        "utf8"
    );

    console.log(
        `  Saved ${rows.length} records to data/${sheetName.toLowerCase()}.json`
    );

    return rows;
}

async function downloadBadgeImages(badges) {
    console.log("");
    console.log("Downloading badge images...");

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const badge of badges) {
        const id = safeFileName(badge.ID || "");
        const imageUrl = String(
            badge["Badge Images"] || ""
        ).trim();

        if (!id || !imageUrl) {
            skipped++;
            continue;
        }

        const extension = getExtension(imageUrl);

        const destination = path.join(
            badgeFolder,
            `${id}${extension}`
        );

        try {
            await downloadFile(imageUrl, destination);

            downloaded++;

            console.log(`  ✓ ${id}${extension}`);
        } catch (error) {
            failed++;

            console.log(
                `  ✗ ${id}: ${error.message}`
            );
        }
    }

    console.log("");
    console.log(`Downloaded: ${downloaded}`);
    console.log(`Skipped:    ${skipped}`);
    console.log(`Failed:     ${failed}`);
}

async function build() {
    console.log("");
    console.log("================================");
    console.log(" WAC OFFLINE BUILD");
    console.log("================================");
    console.log("");

    const exportedData = {};

    for (const sheetName of SHEETS) {
        exportedData[sheetName] =
            await fetchSheet(sheetName);
    }

    await downloadBadgeImages(
        exportedData.Badges
    );

    console.log("");
    console.log("================================");
    console.log(" BUILD COMPLETE");
    console.log("================================");
    console.log("");
}

build().catch(error => {
    console.error("");
    console.error("BUILD FAILED");
    console.error(error);
    process.exitCode = 1;
});