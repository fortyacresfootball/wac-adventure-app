// ======================================
// WAC Home Page
// ======================================

(async function () {

    try {

        const adventures = await Database.getAdventures();

        const count = document.getElementById("homeAdventureCount");

        if (count) {

            count.textContent =
                `Browse all ${adventures.length} adventures.`;

        }

    }

    catch (err) {

        console.error(err);

    }

})();