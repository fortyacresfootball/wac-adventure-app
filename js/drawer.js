// ======================================
// WAC Adventure Drawer
// Version 5.0
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

                //--------------------------------------------------
                // Refresh Member State
                //--------------------------------------------------

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

        //--------------------------------------------------
        // Current Member
        //--------------------------------------------------

        const member =
            window.WAC.selectedMember ||
            (await Database.getMembers())[0];

        await MemberState.load(
            member["Member ID"]
        );

        //--------------------------------------------------
        // Helper
        //--------------------------------------------------

        const set = (id,value)=>{

            const e =
                document.getElementById(id);

            if(e){

                e.textContent =
                    value || "";

            }

        };

        //--------------------------------------------------
        // Badge
        //--------------------------------------------------

        const badge =
            document.getElementById("drawerBadge");

        if (badge) {

            badge.src =
                adventure["Badge Images"] ||
                "assets/icons/wac-icon.png";

        }

        //--------------------------------------------------
        // Populate
        //--------------------------------------------------

        set("drawerTitle",
            adventure.Title);

        set("drawerCategory",
            adventure.Category);

        set("drawerPoints",
            `${adventure["Points"] || 100} Points`);

        set("drawerDifficulty",
            adventure["Difficulty"]);

        set("drawerTime",
            adventure["Estimated Time"]);

        set("drawerMission",
            adventure["Mission"]);

        set("drawerWhy",
            adventure["Why It Matters"]);

        set("drawerVibe",
            adventure["Vibe"]);

        set("drawerNote",
            adventure["Presidents Note"]);

        set("drawerLocation",
            adventure["Location"]);

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

        if(completed){

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

        else{

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

    close(){

        this.currentAdventure = null;

        document
            .getElementById("drawerOverlay")
            .classList.remove("open");

    }

};