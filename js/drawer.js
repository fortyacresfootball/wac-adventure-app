// ======================================
// WAC Adventure Drawer
// Version 6.0
// ======================================

const Drawer = {

    currentAdventure: null,

    async init() {

        const closeButton =
            document.getElementById("drawerClose");

        const overlay =
            document.getElementById("drawerOverlay");

        if (closeButton) {

            closeButton.onclick = () => this.close();

        }

        if (overlay) {

            overlay.onclick = (e) => {

                if (e.target === overlay) {

                    this.close();

                }

            };

        }

        //--------------------------------------------------
        // Complete Adventure
        //--------------------------------------------------

        const completeButton =
            document.getElementById("completeAdventure");

        if (completeButton) {

            completeButton.onclick = async () => {

                if (!this.currentAdventure) return;

                const member =
                    window.WAC.selectedMember ||
                    (await Database.getMembers())[0];

                const result =
                    await API.completeAdventure(

                        member["Member ID"],
                        this.currentAdventure["ID"]

                    );

                if (!result.success) {

                    alert(
                        result.message ||
                        result.error ||
                        "Unable to complete adventure."
                    );

                    return;

                }

                await MemberState.load(
                    member["Member ID"]
                );

                this.close();

                const stats =
                    await ProgressEngine.getMemberStats(
                        member["Member ID"]
                    );

                SuccessModal.open({

                    title:
                        this.currentAdventure.Title,

                    message:
                        "Adventure successfully completed!",

                    points:
                        Number(
                            this.currentAdventure["Points"] || 100
                        ),

                    rank:
                        stats.rank

                });

                if (typeof WACRouter !== "undefined") {

                    await WACRouter.loadPage(

                        WACRouter.currentPage,

                        false

                    );

                }

            };

        }

    },

    //--------------------------------------------------

    async open(adventure) {

        this.currentAdventure = adventure;

        if (!adventure) return;

        const overlay =
            document.getElementById("drawerOverlay");

        overlay.classList.add("open");

        const member =
            window.WAC.selectedMember ||
            (await Database.getMembers())[0];

        await MemberState.load(
            member["Member ID"]
        );

        //--------------------------------------------------
        // Helper
        //--------------------------------------------------

        const set = (id, value) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value || "";

            }

        };

        //--------------------------------------------------
        // Badge
        //--------------------------------------------------

        const badge =
            document.getElementById("drawerBadge");

        if (badge) {

            badge.onerror = null;

            badge.src =
                `assets/badges/${adventure["ID"]}.webp`;

            badge.onerror = () => {

                badge.src =
                    `assets/badges/${adventure["ID"]}.png`;

            };

        }

                //--------------------------------------------------
        // Populate
        //--------------------------------------------------

        set("drawerTitle", adventure.Title);
        set("drawerCategory", adventure.Category);
        set("drawerPoints", `${adventure["Points"] || 100} Points`);

        // Summary Banner
        set("drawerDifficultyHeader", adventure["Difficulty"]);
        set("drawerTimeHeader", adventure["Estimated Time"]);
        set("drawerLocationHeader", adventure["Location"]);
        set("drawerSeasonHeader", adventure["Season"]);

        // Detail Cards
        set("drawerDifficulty", adventure["Difficulty"]);
        set("drawerTime", adventure["Estimated Time"]);
        set("drawerSeason", adventure["Season"]);
        
        //--------------------------------------------------
// Adventure Type
//--------------------------------------------------

const category =
    (adventure.Category || "").toLowerCase();

let type = "Outdoor";

if (category.includes("hunt")) type = "Hunting";
else if (category.includes("fish")) type = "Fishing";
else if (category.includes("camp")) type = "Camping";
else if (category.includes("craft")) type = "Craft";
else if (category.includes("food")) type = "Cooking";
else if (category.includes("history")) type = "History";
else if (category.includes("shoot")) type = "Shooting";
else if (category.includes("water")) type = "Water";

set("drawerType", type);
        set("drawerAge", adventure["Minimum Age"]);

        // Content
        set("drawerMission", adventure["Mission"]);
        set("drawerWhy", adventure["Why It Matters"]);
        set("drawerVibe", adventure["Vibe"]);
        set("drawerNote", adventure["Presidents Note"]);

        // Adventure Details
        //--------------------------------------------------
// Equipment List
//--------------------------------------------------

const equipment =
    document.getElementById("drawerEquipment");

if (equipment) {

    equipment.innerHTML = "";

    const items =
        (adventure["Equipment"] || "")
            .split(/\r?\n|,/)
            .map(i => i.trim())
            .filter(i => i.length);

    if (items.length === 0) {

        equipment.innerHTML =
            "<div class='list-item'>None Required</div>";

    } else {

        items.forEach(item => {

            equipment.innerHTML += `

                <div class="list-item">

                    <span class="list-icon">🧰</span>

                    <span>${item}</span>

                </div>

            `;

        });

    }

}

//--------------------------------------------------
// Prerequisites
//--------------------------------------------------

const prereq =
    document.getElementById("drawerPrerequisite");

if (prereq) {

    prereq.innerHTML = "";

    const items =
        (adventure["Prerequisite"] || "")
            .split(/\r?\n|,/)
            .map(i => i.trim())
            .filter(i => i.length);

    if (items.length === 0) {

        prereq.innerHTML =
            "<div class='list-item'>None</div>";

    } else {

        items.forEach(item => {

            prereq.innerHTML += `

                <div class="list-item">

                    <span class="list-icon">✓</span>

                    <span>${item}</span>

                </div>

            `;

        });

    }

}
        set("drawerLocation", adventure["Location"]);
        set("drawerGPS", adventure["GPS Coordinates"]);

        //--------------------------------------------------
        // Completion Status
        //--------------------------------------------------

        const completed =
            MemberState.isCompleted(
                adventure["ID"]
            );

        const button =
            document.getElementById(
                "completeAdventure"
            );

        if (completed) {

            set(
                "drawerStatus",
                "Completed ✓"
            );

            button.textContent =
                "Completed ✓";

            button.disabled = true;

            button.classList.add(
                "button-disabled"
            );

        }

        else {

            set(
                "drawerStatus",
                "Available"
            );

            button.textContent =
                "Complete Adventure";

            button.disabled = false;

            button.classList.remove(
                "button-disabled"
            );

        }

    },

    //--------------------------------------------------

    close() {

        this.currentAdventure = null;

        document
            .getElementById("drawerOverlay")
            .classList.remove("open");

    }

};