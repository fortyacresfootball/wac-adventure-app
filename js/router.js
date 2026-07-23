// ======================================
// WAC Router
// ======================================

// Global App State
window.WAC = {

    selectedMember: null,
    selectedBadge: null,
    selectedEvent: null,
    selectedLocation: null

};

const WACRouter = {

    currentPage: "home",

    async init() {

        this.bindNavigation();

        await this.loadPage("home", false);

    },

    bindNavigation() {

        document.addEventListener("click", (e) => {

            const link = e.target.closest("[data-page]");

            if (!link) return;

            e.preventDefault();

            this.loadPage(link.dataset.page);

        });

    },

    async loadPage(page, scroll = true) {

        const container =
            document.getElementById("app-content");

        try {

            const response =
                await fetch(`pages/${page}.html?${Date.now()}`);

            if (!response.ok)
                throw new Error("Unable to load page.");

            container.innerHTML =
                await response.text();

            this.currentPage = page;

            this.highlightNavigation();

            await this.loadPageScript(page);

            if (scroll) {

                window.scrollTo({

                    top: 0,
                    behavior: "smooth"

                });

            }

        }

        catch (err) {

            console.error(err);

            container.innerHTML = `

                <section class="page-section">

                    <div class="container">

                        <h2>Unable to load page.</h2>

                    </div>

                </section>

            `;

        }

    },

    async loadPageScript(page) {

        const existing =
            document.getElementById("page-script");

        if (existing)
            existing.remove();

        try {

            const response =
                await fetch(`js/${page}.js?${Date.now()}`);

            if (!response.ok)
                return;

            const code =
                await response.text();

            const script =
                document.createElement("script");

            script.id = "page-script";

            script.textContent = code;

            document.body.appendChild(script);

        }

        catch (err) {

            console.log(`No JavaScript for ${page}`);

        }

    },

    highlightNavigation() {

        document
            .querySelectorAll("[data-page]")
            .forEach(link => {

                if (link.dataset.page === this.currentPage)

                    link.classList.add("active");

                else

                    link.classList.remove("active");

            });

    }

};