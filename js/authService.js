// ======================================
// WAC Authentication Service
// Version 1.0
// ======================================

(function () {

    "use strict";

    //--------------------------------------------------
    // Global WAC State
    //--------------------------------------------------

    window.WAC =
        window.WAC ||
        {};

    window.WAC.authUser =
        null;

    window.WAC.authMember =
        null;

    window.WAC.authReady =
        false;

    //--------------------------------------------------
    // Firebase Authentication
    //--------------------------------------------------

    const firebaseAuth =
        window.WACFirebase?.auth;

    if (!firebaseAuth) {

        console.error(
            "Firebase Authentication is unavailable."
        );

        window.WAC.authReady =
            true;

        dispatchAuthEvent(
            "wac-auth-ready"
        );

        return;

    }

    //--------------------------------------------------
    // Authentication Service
    //--------------------------------------------------

    const AuthService = {

        //--------------------------------------------------
        // Sign In
        //--------------------------------------------------

        async signIn(
            email,
            password
        ) {

            const cleanEmail =
                cleanAuthText(
                    email
                ).toLowerCase();

            const cleanPassword =
                String(
                    password || ""
                );

            if (
                !cleanEmail ||
                !cleanPassword
            ) {

                throw new Error(
                    "Enter your email address and password."
                );

            }

            const credential =
                await firebaseAuth
                    .signInWithEmailAndPassword(
                        cleanEmail,
                        cleanPassword
                    );

            return credential.user;

        },

        //--------------------------------------------------
        // Sign Out
        //--------------------------------------------------

        async signOut() {

            await firebaseAuth.signOut();

        },

        //--------------------------------------------------
        // Password Reset
        //--------------------------------------------------

        async sendPasswordReset(
            email
        ) {

            const cleanEmail =
                cleanAuthText(
                    email
                ).toLowerCase();

            if (!cleanEmail) {

                throw new Error(
                    "Enter your email address first."
                );

            }

            await firebaseAuth
                .sendPasswordResetEmail(
                    cleanEmail
                );

        },

        //--------------------------------------------------
        // Current Firebase User
        //--------------------------------------------------

        getCurrentUser() {

            return firebaseAuth.currentUser;

        },

        //--------------------------------------------------
        // Current Authorized Member
        //--------------------------------------------------

        getCurrentMember() {

            return (
                window.WAC.authMember ||
                null
            );

        },

        //--------------------------------------------------
        // Login Status
        //--------------------------------------------------

        isSignedIn() {

            return Boolean(
                firebaseAuth.currentUser &&
                window.WAC.authMember
            );

        },

        //--------------------------------------------------
        // Administrator Status
        //--------------------------------------------------

        isAdmin() {

            const accessLevel =
                cleanAuthText(
                    window.WAC
                        .authMember?.[
                            "Access Level"
                        ]
                ).toLowerCase();

            return (
                accessLevel ===
                "admin"
            );

        },

        //--------------------------------------------------
        // Completion Permission
        //--------------------------------------------------

        canSubmitCompletions() {

            return Boolean(
                window.WAC
                    .authMember?.[
                        "Can Submit Completions"
                    ]
            );

        },

        //--------------------------------------------------
        // Firebase ID Token
        //--------------------------------------------------

        async getIdToken(
            forceRefresh = false
        ) {

            const user =
                firebaseAuth.currentUser;

            if (!user) {

                throw new Error(
                    "Member sign-in is required."
                );

            }

            return await user.getIdToken(
                forceRefresh
            );

        },

        //--------------------------------------------------
        // Refresh Authorized Member Session
        //--------------------------------------------------

        async refreshMemberSession() {

            const user =
                firebaseAuth.currentUser;

            if (!user) {

                clearAuthorizedSession();

                return null;

            }

            const member =
                await requestAuthorizedMember(
                    user
                );

            establishAuthorizedSession(
                user,
                member
            );

            return member;

        }

    };

    window.AuthService =
        AuthService;

    //--------------------------------------------------
    // Firebase Authentication Listener
    //--------------------------------------------------

    firebaseAuth.onAuthStateChanged(
        async (user) => {

            window.WAC.authReady =
                false;

            if (!user) {

                clearAuthorizedSession();

                window.WAC.authReady =
                    true;

                dispatchAuthEvent(
                    "wac-auth-ready"
                );

                dispatchAuthEvent(
                    "wac-auth-changed",
                    {
                        signedIn:
                            false,

                        user:
                            null,

                        member:
                            null
                    }
                );

                return;

            }

            window.WAC.authUser =
                user;

            try {

                const member =
                    await requestAuthorizedMember(
                        user
                    );

                establishAuthorizedSession(
                    user,
                    member
                );

                window.WAC.authReady =
                    true;

                dispatchAuthEvent(
                    "wac-auth-ready"
                );

                dispatchAuthEvent(
                    "wac-auth-changed",
                    {
                        signedIn:
                            true,

                        user:
                            createSafeFirebaseUser(
                                user
                            ),

                        member
                    }
                );

            }

            catch (error) {

                console.error(
                    "WAC member authorization failed:",
                    error
                );

                clearAuthorizedSession();

                try {

                    await firebaseAuth.signOut();

                }

                catch (signOutError) {

                    console.error(
                        "Unable to sign out unauthorized account:",
                        signOutError
                    );

                }

                window.WAC.authReady =
                    true;

                dispatchAuthEvent(
                    "wac-auth-ready"
                );

                dispatchAuthEvent(
                    "wac-auth-error",
                    {
                        message:
                            getAuthErrorMessage(
                                error
                            )
                    }
                );

            }

        }
    );

    //--------------------------------------------------
    // Request Authorized Member from Apps Script
    //--------------------------------------------------

    async function requestAuthorizedMember(
        user
    ) {

        const idToken =
            await user.getIdToken(
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
                "This account is not connected to an approved WAC member."
            );

        }

        return result.member;

    }

    //--------------------------------------------------
    // Establish Authorized Session
    //--------------------------------------------------

    function establishAuthorizedSession(
        user,
        member
    ) {

        window.WAC.authUser =
            user;

        window.WAC.authMember =
            member;

        //--------------------------------------------------
        // Authenticated identity becomes selected identity
        //--------------------------------------------------

        window.WAC.selectedMember =
            member;

        try {

            sessionStorage.setItem(
                "wacAuthenticatedMemberId",
                cleanAuthText(
                    member[
                        "Member ID"
                    ]
                )
            );

        }

        catch (error) {

            console.warn(
                "Unable to save authenticated member session.",
                error
            );

        }

    }

    //--------------------------------------------------
    // Clear Authorized Session
    //--------------------------------------------------

    function clearAuthorizedSession() {

        window.WAC.authUser =
            null;

        window.WAC.authMember =
            null;

        try {

            sessionStorage.removeItem(
                "wacAuthenticatedMemberId"
            );

        }

        catch (error) {

            console.warn(
                "Unable to clear authenticated member session.",
                error
            );

        }

    }

    //--------------------------------------------------
    // Safe Firebase User
    //--------------------------------------------------

    function createSafeFirebaseUser(
        user
    ) {

        return {

            uid:
                user.uid,

            email:
                user.email || "",

            emailVerified:
                user.emailVerified === true

        };

    }

    //--------------------------------------------------
    // Authentication Event
    //--------------------------------------------------

    function dispatchAuthEvent(
        eventName,
        detail = {}
    ) {

        window.dispatchEvent(
            new CustomEvent(
                eventName,
                {
                    detail
                }
            )
        );

    }

    //--------------------------------------------------
    // Authentication Error Messages
    //--------------------------------------------------

    function getAuthErrorMessage(
        error
    ) {

        const errorCode =
            cleanAuthText(
                error?.code
            );

        switch (errorCode) {

            case "auth/invalid-email":

                return "Enter a valid email address.";

            case "auth/invalid-credential":

                return "The email address or password is incorrect.";

            case "auth/user-disabled":

                return "This member account has been disabled.";

            case "auth/too-many-requests":

                return "Too many sign-in attempts were made. Try again later.";

            case "auth/network-request-failed":

                return "The sign-in service could not be reached. Check your connection.";

            default:

                return (
                    error?.message ||
                    "Member authentication was unsuccessful."
                );

        }

    }

    //--------------------------------------------------
    // Text Helper
    //--------------------------------------------------

    function cleanAuthText(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }

})();