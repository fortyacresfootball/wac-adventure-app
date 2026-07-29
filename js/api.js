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
// Upload Gallery Photo
//--------------------------------------------------

async uploadGalleryPhoto(photoData) {

    const upload =
        photoData &&
        typeof photoData === "object"
            ? photoData
            : {};

    const fileName =
        String(
            upload.fileName || ""
        ).trim();

    const mimeType =
        String(
            upload.mimeType || ""
        ).trim().toLowerCase();

    const base64Data =
        String(
            upload.base64Data || ""
        ).trim();

    const caption =
        String(
            upload.caption || ""
        ).trim();

    const relatedType =
        String(
            upload.relatedType || ""
        ).trim();

    const relatedId =
        String(
            upload.relatedId || ""
        ).trim();

    const dateTaken =
        String(
            upload.dateTaken || ""
        ).trim();

    if (!fileName) {

        throw new Error(
            "A valid photo file is required."
        );

    }

    if (
        ![
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(
            mimeType
        )
    ) {

        throw new Error(
            "Only JPEG, PNG, and WebP photos may be uploaded."
        );

    }

    if (!base64Data) {

        throw new Error(
            "The selected photo could not be prepared for upload."
        );

    }

    if (!caption) {

        throw new Error(
            "Please provide a caption for this photo."
        );

    }

    if (caption.length < 10) {

        throw new Error(
            "Please provide a slightly more detailed photo caption."
        );

    }

    if (caption.length > 1000) {

        throw new Error(
            "Photo captions cannot exceed 1,000 characters."
        );

    }

    if (
        typeof AuthService === "undefined" ||
        !AuthService.isSignedIn()
    ) {

        throw new Error(
            "Member sign-in is required before uploading a gallery photo."
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
                            "uploadGalleryPhoto",

                        idToken,

                        fileName,

                        mimeType,

                        base64Data,

                        caption,

                        relatedType,

                        relatedId,

                        dateTaken

                    })
            }
        );

    if (!response.ok) {

        throw new Error(
            "The gallery upload service could not be reached."
        );

    }

    const result =
        await response.json();

    if (!result.success) {

        throw new Error(
            result.error ||
            result.message ||
            "The photo could not be uploaded."
        );

    }

    return result;

},

//--------------------------------------------------
// Gallery Administrator Decision
//--------------------------------------------------

async galleryAdminDecision(
    photoId,
    decision,
    note = ""
) {

    const cleanPhotoId =
        String(
            photoId || ""
        ).trim();

    const cleanDecision =
        String(
            decision || ""
        ).trim().toLowerCase();

    const cleanNote =
        String(
            note || ""
        ).trim();

    if (!cleanPhotoId) {

        throw new Error(
            "A valid Photo ID is required."
        );

    }

    if (
        ![
            "approved",
            "returned",
            "denied"
        ].includes(
            cleanDecision
        )
    ) {

        throw new Error(
            "A valid gallery decision is required."
        );

    }

    if (
        cleanDecision ===
            "returned" &&
        !cleanNote
    ) {

        throw new Error(
            "An administrator comment is required when returning a photo."
        );

    }

    if (
        typeof AuthService === "undefined" ||
        !AuthService.isSignedIn() ||
        !AuthService.isAdmin()
    ) {

        throw new Error(
            "Administrator access is required."
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
                            "galleryAdminDecision",

                        idToken,

                        photoId:
                            cleanPhotoId,

                        decision:
                            cleanDecision,

                        note:
                            cleanNote

                    })
            }
        );

    if (!response.ok) {

        throw new Error(
            "The gallery approval service could not be reached."
        );

    }

    const result =
        await response.json();

    if (!result.success) {

        throw new Error(
            result.error ||
            result.message ||
            "The gallery decision could not be saved."
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