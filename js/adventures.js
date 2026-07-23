// ======================================
// WAC Adventure Explorer
// Version 5.0
// ======================================

(async function () {

    //-------------------------------------------------
    // Load Current Member
    //-------------------------------------------------

    const members =
        await Database.getMembers();

    const member =
        window.WAC?.selectedMember ||
        members[0];

    await MemberState.load(
        member["Member ID"]
    );

    //-------------------------------------------------
    // Load Adventures
    //-------------------------------------------------

    const adventures =
        await Database.getAdventures();

    const grid =
        document.getElementById("adventureGrid");

    const count =
        document.getElementById("adventureCount");

    const search =
        document.getElementById("adventureSearch");

    const category =
        document.getElementById("categoryFilter");

    const empty =
        document.getElementById("adventureEmpty");

    //-------------------------------------------------
    // Load Drawer
    //-------------------------------------------------

    const drawerHTML =
        await fetch("components/drawer.html")
            .then(r => r.text());

    if (!document.getElementById("drawerOverlay")) {

        document.body.insertAdjacentHTML(
            "beforeend",
            drawerHTML
        );

    }

    Drawer.init();

    //-------------------------------------------------
    // Build Category List
    //-------------------------------------------------

    category.innerHTML =
        `<option value="">All Categories</option>`;

    [...new Set(adventures.map(a => a.Category))]
        .sort()
        .forEach(cat => {

            if (!cat) return;

            category.innerHTML +=
                `<option value="${cat}">${cat}</option>`;

        });

    //-------------------------------------------------
    // Render Adventures
    //-------------------------------------------------

    function render() {

        const text =
            search.value.toLowerCase();

        const selected =
            category.value;

        const filtered =
            adventures.filter(a => {

                const title =
                    (a.Title || "").toLowerCase();

                const cat =
                    (a.Category || "").toLowerCase();

                return (

                    (title.includes(text) ||
                     cat.includes(text))

                    &&

                    (selected === "" ||
                     a.Category === selected)

                );

            });

        count.textContent =
            `${filtered.length} Adventures`;

        grid.innerHTML = "";

        empty.classList.toggle(
            "hidden",
            filtered.length !== 0
        );

        //-------------------------------------------------
        // Cards
        //-------------------------------------------------

        filtered.forEach(adventure => {

            const completed =
                MemberState.isCompleted(
                    adventure["ID"]
                );

            grid.innerHTML += `

                <div class="card dark-card ${completed ? "completed-card" : ""}">

                    <div class="card-icon">

                        ${completed ? "✅" : "🏕️"}

                    </div>

                    <span class="badge">

                        ${adventure["ID"]}

                    </span>

                    <h3>

                        ${adventure.Title}

                    </h3>

                    <p>

                        ${adventure.Category || ""}

                    </p>

                    <button
                        class="small-button viewAdventure"
                        data-id="${adventure["ID"]}">

                        ${completed
                            ? "Completed ✓"
                            : "Open Adventure"}

                    </button>

                </div>

            `;

        });

        //-------------------------------------------------
        // Button Events
        //-------------------------------------------------

        document
            .querySelectorAll(".viewAdventure")
            .forEach(button => {

                button.onclick = () => {

                    const adventure =
                        adventures.find(a =>

                            a["ID"] ===
                            button.dataset.id

                        );

                    Drawer.open(adventure);

                };

            });

    }

    //-------------------------------------------------

    search.addEventListener(
        "input",
        render
    );

    category.addEventListener(
        "change",
        render
    );

    render();

})();