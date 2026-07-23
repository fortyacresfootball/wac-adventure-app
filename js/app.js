// ======================================
// Workman Adventure Compound
// Application Startup
// Version 2.0
// ======================================

document.addEventListener("DOMContentLoaded", async () => {

    //--------------------------------------------------
    // Mobile Navigation
    //--------------------------------------------------

    const menuButton =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");

    if (menuButton && navLinks) {

        menuButton.addEventListener("click", () => {

            navLinks.classList.toggle("open");

        });

    }

    //--------------------------------------------------
    // Global Namespace
    //--------------------------------------------------

    window.WAC = {

        selectedMember: null

    };

    //--------------------------------------------------
    // Load Components
    //--------------------------------------------------

    await ComponentLoader.init();

    //--------------------------------------------------
    // Start Application
    //--------------------------------------------------

    WACRouter.init();

});