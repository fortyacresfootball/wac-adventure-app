// ==========================================
// WAC Database Service
// Version 3.0
// ==========================================

const API_URL =
"https://script.google.com/macros/s/AKfycbz164ckVufAyrZag1ZlIh0z6m1cfrEc0USYOyl5k8ZpgLlEL9uvpZmdhrH6iWtPZONi/exec";

const Database = {

    async load(sheet) {

        const response = await fetch(

            `${API_URL}?sheet=${sheet}`

        );

        const json = await response.json();

        return json.data || [];

    },

    //--------------------------------------------------
    // Adventures
    //--------------------------------------------------

    async getAdventures() {

        return await this.load("Adventures");

    },

    //--------------------------------------------------
    // Members
    //--------------------------------------------------

    async getMembers() {

        return await this.load("Members");

    },

    //--------------------------------------------------
    // Adventure Log
    //--------------------------------------------------

    async getLogs() {

        return await this.load("Logs");

    },

    //--------------------------------------------------
    // Events
    //--------------------------------------------------

    async getEvents() {

        return await this.load("Events");

    },

    //--------------------------------------------------
    // Resources
    //--------------------------------------------------

    async getResources() {

        return await this.load("Resources");

    },

    //--------------------------------------------------
    // News
    //--------------------------------------------------

    async getNews() {

        return await this.load("News");

    },

    //--------------------------------------------------
    // Locations
    //--------------------------------------------------

    async getLocations() {

        return await this.load("Locations");

    }

};