// ==========================================
// WAC Database Service
// Version 3.2
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
    // Events
    //--------------------------------------------------

    async getEvents() {

        return await this.load(
            "Events"
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