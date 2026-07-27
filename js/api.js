// ======================================
// WAC API Service
// Version 4.0
// ======================================

const API = {

    //--------------------------------------------------
    // Submit Adventure Completion
    //--------------------------------------------------

    async submitCompletion(adventureId) {

        const cleanAdventureId =
            String(
                adventureId || ""
            ).trim();

        if (!cleanAdventureId) {

            throw new Error(
                "A valid Adventure ID is required."
            );

        }

        if (
            typeof AuthService === "undefined" ||
            !AuthService.isSignedIn()
        ) {

            throw new Error(
                "Member sign-in is required before submitting an adventure."
            );

        }

        const idToken =
            await AuthService.getIdToken(
                true
            );

        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "submitCompletion",

                            idToken,

                            adventureId:
                                cleanAdventureId

                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "The completion service could not be reached."
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.error ||
                result.message ||
                "The adventure could not be submitted."
            );

        }

        return result;

    },

    //--------------------------------------------------
    // Load Current Authorized Member
    //--------------------------------------------------

    async getCurrentMember() {

        if (
            typeof AuthService === "undefined" ||
            !AuthService.getCurrentUser()
        ) {

            throw new Error(
                "Member sign-in is required."
            );

        }

        const idToken =
            await AuthService.getIdToken(
                true
            );

        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "getCurrentMember",

                            idToken

                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "The member authorization service could not be reached."
            );

        }

        const result =
            await response.json();

        if (
            !result.success ||
            !result.member
        ) {

            throw new Error(
                result.error ||
                "The authorized member record could not be loaded."
            );

        }

        return result.member;

    }

};