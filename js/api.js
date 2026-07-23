// ======================================
// WAC API Service
// Version 3.0
// ======================================

const API = {

    //--------------------------------------------------
    // Complete Adventure
    //--------------------------------------------------

    async completeAdventure(memberId, adventureId) {

        const formData = new FormData();

        formData.append("memberId", memberId);
        formData.append("adventureId", adventureId);
        formData.append("completedBy", memberId);

        const response = await fetch(API_URL, {

            method: "POST",

            body: formData

        });

        return await response.json();

    }

};