// ======================================
// WAC API Service
// Version 4.0
// ======================================

const API = {

    //--------------------------------------------------
// Submit Adventure Completion
//--------------------------------------------------

async submitCompletion(adventureId, story) {

    const cleanAdventureId =
        String(
            adventureId || ""
        ).trim();

    const cleanStory =
        String(
            story || ""
        ).trim();

    if (!cleanAdventureId) {

        throw new Error(
            "A valid Adventure ID is required."
        );

    }

    if (!cleanStory) {

        throw new Error(
            "Please tell the story of how you completed this adventure."
        );

    }

    if (cleanStory.length < 25) {

        throw new Error(
            "Please provide a little more detail about how you completed the adventure."
        );

    }

    if (cleanStory.length > 2500) {

        throw new Error(
            "Adventure stories cannot exceed 2,500 characters."
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
                            cleanAdventureId,

                        story:
                            cleanStory

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