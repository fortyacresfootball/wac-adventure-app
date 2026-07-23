// ======================================
// WAC Success Modal
// Version 1.0
// ======================================

const SuccessModal = {

    init() {

        const button =
            document.getElementById("successContinue");

        if (button) {

            button.onclick = () => {

                this.close();

            };

        }

        const overlay =
            document.getElementById("successOverlay");

        if (overlay) {

            overlay.onclick = (e) => {

                if (e.target === overlay) {

                    this.close();

                }

            };

        }

    },

    open(data) {

        document.getElementById("successTitle").textContent =
            data.title || "Adventure Completed";

        document.getElementById("successMessage").textContent =
            data.message || "";

        document.getElementById("successPoints").textContent =
            `+${data.points || 0}`;

        document.getElementById("successRank").textContent =
            data.rank || "";

        document
            .getElementById("successOverlay")
            .classList.add("open");

    },

    close() {

        document
            .getElementById("successOverlay")
            .classList.remove("open");

    }

};