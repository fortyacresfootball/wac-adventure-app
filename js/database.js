// ==========================================
// WAC Database Service
// Version 3.4
// ==========================================

const API_URL =
"https://script.google.com/macros/s/AKfycbz164ckVufAyrZag1ZlIh0z6m1cfrEc0USYOyl5k8ZpgLlEL9uvpZmdhrH6iWtPZONi/exec";

const Database = {

    async load(sheet) {

        const response = await fetch(

            `${API_URL}?sheet=${encodeURIComponent(sheet)}`

        );

        const json = await response.json();

        return json.data || [];

    },

    //--------------------------------------------------
    // Authenticated API Request
    //--------------------------------------------------

    async authenticatedPost(action, data = {}) {

        if (
            typeof AuthService === "undefined" ||
            typeof AuthService.getIdToken !== "function"
        ) {

            throw new Error(
                "Authentication service is unavailable."
            );

        }

        const idToken =
            await AuthService.getIdToken();

        if (!idToken) {

            throw new Error(
                "Member sign-in is required."
            );

        }

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({
                            action,
                            idToken,
                            ...data
                        })
                }
            );

        const json =
            await response.json();

        if (!json.success) {

            throw new Error(
                json.error ||
                "The WAC request could not be completed."
            );

        }

        return json;

    },

    //--------------------------------------------------
    // Adventures
    //--------------------------------------------------

    async getAdventures() {

        return await this.load(
            "Adventures"
        );

    },

    //--------------------------------------------------
// Trophies
//--------------------------------------------------

async getTrophies() {

    return await this.load(
        "Trophies"
    );

},

async addTrophy(data) {

  return await this.authenticatedPost(
    "addTrophy",
    data
  );

},

async saveTrackingSession(data) {
    return await this.authenticatedPost(
        "saveTrackingSession",
        data
    );
},

//--------------------------------------------------
// Hunt Board
//--------------------------------------------------

async getHuntBoard() {

    return await this.authenticatedPost(
        "getHuntBoard"
    );
},

async huntCheckIn(
    locationId,
    activity = "Hunting",
    notes = ""
) {

    return await this.authenticatedPost(
        "huntCheckIn",
        {
            locationId,
            activity,
            notes
        }
    );
},

async huntCheckOut() {

    return await this.authenticatedPost(
        "huntCheckOut"
    );
},

//--------------------------------------------------
// Hunt Journal
//--------------------------------------------------

async getHuntJournal() {

    return await this.authenticatedPost(
        "getHuntJournal"
    );
},

async saveHuntJournalEntry(
    entry
) {

    return await this.authenticatedPost(
        "saveHuntJournalEntry",
        {
            entry
        }
    );
},

    //--------------------------------------------------
    // Members
    //--------------------------------------------------

    async getMembers() {

        return await this.load(
            "Members"
        );

    },

    //--------------------------------------------------
    // Adventure Log
    //--------------------------------------------------

    async getLogs() {

        return await this.load(
            "Logs"
        );

    },

    //--------------------------------------------------
    // Achievement Catalog
    //--------------------------------------------------

    async getAchievementCatalog() {

        return await this.load(
            "Achievement Catalog"
        );

    },

    //--------------------------------------------------
    // Events
    //--------------------------------------------------

    async getEvents() {

        return await this.load(
            "Events"
        );

    },

    //--------------------------------------------------
    // Gallery
    //--------------------------------------------------

    async getGalleryPhotos() {

        const rows =
            await this.load(
                "Gallery"
            );

        return rows.map(
            (row) => {

                return {

                    photoId:
                        row["Photo ID"] || "",

                    memberName:
                        row["Member Name"] || "",

                    imageUrl:
                        row["Image URL"] || "",

                    thumbnailUrl:
                        row["Thumbnail URL"] || "",

                    caption:
                        row["Caption"] || "",

                    relatedType:
                        row["Related Type"] || "",

                    relatedId:
                        row["Related ID"] || "",

                    dateTaken:
                        row["Date Taken"] || "",

                    uploadDateTime:
                        row["Upload DateTime"] || "",

                    approvedDateTime:
                        row["Approved DateTime"] || "",

                    featured:
                        row["Featured"] || false

                };

            }
        );

    },

    //--------------------------------------------------
    // Resources
    //--------------------------------------------------

    async getResources() {

        return await this.load(
            "Resources"
        );

    },

    //--------------------------------------------------
    // News
    //--------------------------------------------------

    async getNews() {

        return await this.load(
            "News"
        );

    },

    //--------------------------------------------------
    // Locations
    //--------------------------------------------------

    async getLocations() {

        return await this.load(
            "Locations"
        );

    },

    //--------------------------------------------------
    // Adventure Checklists
    //--------------------------------------------------

    async getChecklist() {

        return await this.load(
            "Checklist"
        );

    },

    //--------------------------------------------------
    // Waiver Status
    //--------------------------------------------------

    async getWaiverStatus() {

        return await this.authenticatedPost(
            "getWaiverStatus"
        );

    }

};