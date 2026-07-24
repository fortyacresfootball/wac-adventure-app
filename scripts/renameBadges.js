const fs = require("fs");
const path = require("path");

const badges = require("../data/badges.json");

const rawFolder = path.join(__dirname, "../assets/badges_raw");
const outputFolder = path.join(__dirname, "../assets/badges");

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function clean(str) {
    return String(str)
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

const files = fs.readdirSync(rawFolder);

let matched = 0;
let missing = [];

for (const badge of badges) {

    const id = badge.ID;

    const url = badge["Badge Images"];

    if (!url) continue;

    const scoutName = path
        .basename(url)
        .replace(/\.(png|jpg|jpeg|webp)$/i, "");

    let wanted = clean(scoutName);

// Fix known Scouting.org filename differences
const aliases = {
    "watersportspatch": "watersports",
    "fishwildlifemgmt": "fishwildlifemanagement",
    "fishing1": "fishing",
    "americanbusiness1": "americanbusiness",
    "animationrevacopy": "animation",
    "healthcareprofessionspatch": "healthcareprofessions",
    "explorationmeritbadge": "exploration"
};

wanted = aliases[wanted] || wanted;

    const file = files.find(f =>
        clean(path.parse(f).name) === wanted
    );

    if (!file) {
        missing.push({
            id,
            scoutName
        });
        continue;
    }

    fs.copyFileSync(
        path.join(rawFolder, file),
        path.join(outputFolder, `${id}.webp`)
    );

    console.log(`✓ ${id}  <-  ${file}`);

    matched++;
}

console.log("");
console.log("================================");
console.log("Finished");
console.log("================================");
console.log(`Matched : ${matched}`);
console.log(`Missing : ${missing.length}`);

if (missing.length) {
    console.log("");
    console.log("Missing:");

    for (const m of missing) {
        console.log(`${m.id} : ${m.scoutName}`);
    }
}