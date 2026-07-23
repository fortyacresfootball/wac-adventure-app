const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const https = require("https");

const workbook = xlsx.readFile("data/WAC Master Database.xlsx");

const sheet = workbook.Sheets["Badges"];

const badges = xlsx.utils.sheet_to_json(sheet);

const outputFolder = path.join(__dirname, "../assets/badges");

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function download(url, filename) {

    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(filename);

        https.get(url, response => {

            if (response.statusCode !== 200) {

                reject(`Failed: ${url}`);

                return;

            }

            response.pipe(file);

            file.on("finish", () => {

                file.close();

                resolve();

            });

        }).on("error", err => {

            fs.unlink(filename, () => {});

            reject(err);

        });

    });

}

(async () => {

    for (const badge of badges) {

        if (!badge["Badge Images"]) continue;

        const ext = path.extname(
            badge["Badge Images"].split("?")[0]
        ) || ".png";

        const filename = path.join(
            outputFolder,
            `${badge.ID}${ext}`
        );

        console.log(`Downloading ${badge.ID}...`);

        try {

            await download(
                badge["Badge Images"],
                filename
            );

        } catch (err) {

            console.log(err);

        }

    }

    console.log("Finished!");

})();