// ======================================
// WAC Firebase Configuration
// Version 1.0
// ======================================

(function () {

    "use strict";

    const firebaseConfig = {

        apiKey:
            "AIzaSyCdVaf3vQxveA0Co8S2EvOZHSx2vUz-5GQ",

        authDomain:
            "wac-adventure-app.firebaseapp.com",

        projectId:
            "wac-adventure-app",

        storageBucket:
            "wac-adventure-app.firebasestorage.app",

        messagingSenderId:
            "728408216446",

        appId:
            "1:728408216446:web:a788b0299d72ccfbbc592f"

    };

    //--------------------------------------------------
    // Initialize Firebase Once
    //--------------------------------------------------

    if (
        typeof firebase === "undefined"
    ) {

        console.error(
            "Firebase SDK did not load."
        );

        return;

    }

    if (
        firebase.apps.length === 0
    ) {

        firebase.initializeApp(
            firebaseConfig
        );

    }

    //--------------------------------------------------
    // Expose Authentication Service
    //--------------------------------------------------

    window.WACFirebase = {

        app:
            firebase.app(),

        auth:
            firebase.auth()

    };

    console.log(
        "WAC Firebase initialized."
    );

})();