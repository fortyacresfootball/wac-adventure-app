// ======================================
// WAC Family Directory
// Version 2.0
// ======================================

(async function () {

    try {

        const members = await Database.getMembers();

        if (!members || members.length === 0) {

            console.error("No members found.");

            return;

        }

        //--------------------------------------------------
        // Statistics
        //--------------------------------------------------

        document.getElementById("familyMembers").textContent =
            members.length;

        //--------------------------------------------------
        // Build Family Cards
        //--------------------------------------------------

        const grid =
            document.getElementById("familyGrid");

        grid.innerHTML = "";

        members.forEach(member => {

            const card =
                document.createElement("div");

            card.className = "card family-card";

            const photo =

                member["Profile Photo"] &&
                member["Profile Photo"].trim() !== ""

                    ? member["Profile Photo"]

                    : "assets/members/default.png";

            const name =

                member["Display Name"] ||

                `${member["First Name"]} ${member["Last Name"]}`;

            card.innerHTML = `

                <img
                    class="family-photo"
                    src="${photo}"
                    alt="${name}">

                <h3>${name}</h3>

                <p>${member["Role"] || "Member"}</p>

            `;

            //--------------------------------------------------
            // Open Adventure Record
            //--------------------------------------------------

            card.addEventListener("click", async () => {

                window.WAC.selectedMember = member;

                await WACRouter.loadPage("profile");

            });

            grid.appendChild(card);

        });

    }

    catch (err) {

        console.error(err);

    }

})();