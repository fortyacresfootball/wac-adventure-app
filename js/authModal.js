// ======================================
// WAC Member Authentication Interface
// Version 1.0
// ======================================

(function () {

    "use strict";

    //--------------------------------------------------
    // Page Elements
    //--------------------------------------------------

    const signInButton =
        document.getElementById(
            "memberSignInButton"
        );

    const signedInMenu =
        document.getElementById(
            "signedInMemberMenu"
        );

    const memberMenuButton =
        document.getElementById(
            "signedInMemberButton"
        );

    const memberDropdown =
        document.getElementById(
            "signedInMemberDropdown"
        );

    const memberName =
        document.getElementById(
            "signedInMemberName"
        );

    const dropdownName =
        document.getElementById(
            "signedInMemberDropdownName"
        );

    const memberEmail =
        document.getElementById(
            "signedInMemberEmail"
        );

    const memberInitials =
        document.getElementById(
            "signedInMemberInitials"
        );

    const profileButton =
        document.getElementById(
            "openMyProfileButton"
        );

    const signOutButton =
        document.getElementById(
            "memberSignOutButton"
        );

    //--------------------------------------------------
    // Create Authentication Modal
    //--------------------------------------------------

    const modal =
        createAuthenticationModal();

    document.body.appendChild(
        modal
    );

    const modalPanel =
        modal.querySelector(
            ".auth-modal-panel"
        );

    const closeButton =
        modal.querySelector(
            "#authModalClose"
        );

    const signInForm =
        modal.querySelector(
            "#memberSignInForm"
        );

    const emailInput =
        modal.querySelector(
            "#memberEmailInput"
        );

    const passwordInput =
        modal.querySelector(
            "#memberPasswordInput"
        );

    const submitButton =
        modal.querySelector(
            "#memberSignInSubmit"
        );

    const resetButton =
        modal.querySelector(
            "#memberPasswordReset"
        );

    const messageBox =
        modal.querySelector(
            "#authModalMessage"
        );

    //--------------------------------------------------
    // Open Sign-In Modal
    //--------------------------------------------------

    if (signInButton) {

        signInButton.addEventListener(
            "click",
            () => {

                openAuthenticationModal();

            }
        );

    }

    //--------------------------------------------------
    // Close Sign-In Modal
    //--------------------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAuthenticationModal
        );

    }

    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                modal
            ) {

                closeAuthenticationModal();

            }

        }
    );

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                closeAuthenticationModal();

            }

        }
    );

    //--------------------------------------------------
    // Submit Sign-In Form
    //--------------------------------------------------

    if (signInForm) {

        signInForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                clearAuthenticationMessage();

                setAuthenticationLoading(
                    true
                );

                try {

                    await AuthService.signIn(

                        emailInput.value,
                        passwordInput.value

                    );

                    showAuthenticationMessage(

                        "Sign-in successful. Loading your WAC member account.",

                        "success"

                    );

                    passwordInput.value =
                        "";

                }

                catch (error) {

                    showAuthenticationMessage(

                        getFriendlyAuthenticationError(
                            error
                        ),

                        "error"

                    );

                }

                finally {

                    setAuthenticationLoading(
                        false
                    );

                }

            }
        );

    }

    //--------------------------------------------------
    // Password Reset
    //--------------------------------------------------

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            async () => {

                clearAuthenticationMessage();

                const email =
                    String(
                        emailInput?.value || ""
                    ).trim();

                if (!email) {

                    showAuthenticationMessage(

                        "Enter your email address first, then select Reset Password.",

                        "error"

                    );

                    emailInput?.focus();

                    return;

                }

                resetButton.disabled =
                    true;

                try {

                    await AuthService
                        .sendPasswordReset(
                            email
                        );

                    showAuthenticationMessage(

                        "Password reset instructions were sent to the email address, if an account exists.",

                        "success"

                    );

                }

                catch (error) {

                    showAuthenticationMessage(

                        getFriendlyAuthenticationError(
                            error
                        ),

                        "error"

                    );

                }

                finally {

                    resetButton.disabled =
                        false;

                }

            }
        );

    }

    //--------------------------------------------------
    // Signed-In Member Menu
    //--------------------------------------------------

    if (
        memberMenuButton &&
        memberDropdown
    ) {

        memberMenuButton.addEventListener(
            "click",
            () => {

                const willOpen =
                    memberDropdown.hidden;

                memberDropdown.hidden =
                    !willOpen;

                memberMenuButton.setAttribute(

                    "aria-expanded",

                    String(willOpen)

                );

            }
        );

    }

    //--------------------------------------------------
    // Close Dropdown When Clicking Elsewhere
    //--------------------------------------------------

    document.addEventListener(
        "click",
        (event) => {

            if (
                !signedInMenu ||
                !memberDropdown ||
                memberDropdown.hidden
            ) {

                return;

            }

            if (
                signedInMenu.contains(
                    event.target
                )
            ) {

                return;

            }

            closeMemberDropdown();

        }
    );

    //--------------------------------------------------
    // Open Authenticated Member Profile
    //--------------------------------------------------

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                const authenticatedMember =
                    AuthService
                        .getCurrentMember();

                if (!authenticatedMember) {

                    return;

                }

                window.WAC.selectedMember =
                    authenticatedMember;

                closeMemberDropdown();

                navigateToAuthenticationPage(
                    "profile"
                );

            }
        );

    }

    //--------------------------------------------------
    // Sign Out
    //--------------------------------------------------

    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            async () => {

                signOutButton.disabled =
                    true;

                try {

                    await AuthService.signOut();

                    closeMemberDropdown();

                    navigateToAuthenticationPage(
                        "home"
                    );

                }

                catch (error) {

                    console.error(
                        "Unable to sign out:",
                        error
                    );

                }

                finally {

                    signOutButton.disabled =
                        false;

                }

            }
        );

    }

    //--------------------------------------------------
    // Authentication State Events
    //--------------------------------------------------

    window.addEventListener(
        "wac-auth-ready",
        () => {

            updateAuthenticationNavigation();

        }
    );

    window.addEventListener(
        "wac-auth-changed",
        (event) => {

            updateAuthenticationNavigation();

            if (
                event.detail?.signedIn
            ) {

                closeAuthenticationModal();

            }

        }
    );

    window.addEventListener(
        "wac-auth-error",
        (event) => {

            updateAuthenticationNavigation();

            openAuthenticationModal();

            showAuthenticationMessage(

                event.detail?.message ||
                "This account is not authorized to access member features.",

                "error"

            );

        }
    );

    //--------------------------------------------------
    // Initial Navigation State
    //--------------------------------------------------

    updateAuthenticationNavigation();

    //--------------------------------------------------
    // Modal Markup
    //--------------------------------------------------

    function createAuthenticationModal() {

        const overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "authModal";

        overlay.className =
            "auth-modal-overlay";

        overlay.hidden =
            true;

        overlay.innerHTML = `

            <section
                class="auth-modal-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="authModalTitle"
            >

                <button
                    id="authModalClose"
                    class="auth-modal-close"
                    type="button"
                    aria-label="Close member sign-in"
                >
                    ×
                </button>

                <div class="auth-modal-brand">

                    <img
                        src="assets/icons/wac-icon.png"
                        alt="WAC Logo"
                    >

                </div>

                <div class="eyebrow">
                    Member Access
                </div>

                <h2 id="authModalTitle">
                    Sign In to the WAC
                </h2>

                <p class="auth-modal-intro">
                    Sign in using the email address connected
                    to your approved WAC member account.
                </p>

                <form id="memberSignInForm">

                    <label for="memberEmailInput">
                        Email Address
                    </label>

                    <input
                        id="memberEmailInput"
                        type="email"
                        autocomplete="email"
                        required
                    >

                    <label for="memberPasswordInput">
                        Password
                    </label>

                    <input
                        id="memberPasswordInput"
                        type="password"
                        autocomplete="current-password"
                        required
                    >

                    <div
                        id="authModalMessage"
                        class="auth-modal-message"
                        hidden
                        role="status"
                    ></div>

                    <button
                        id="memberSignInSubmit"
                        class="auth-modal-submit"
                        type="submit"
                    >
                        Member Sign In
                    </button>

                    <button
                        id="memberPasswordReset"
                        class="auth-password-reset"
                        type="button"
                    >
                        Reset Password
                    </button>

                </form>

                <p class="auth-modal-help">
                    Member accounts are created by the WAC administrator.
                    Public account registration is not available.
                </p>

            </section>

        `;

        return overlay;

    }

    //--------------------------------------------------
    // Open Modal
    //--------------------------------------------------

    function openAuthenticationModal() {

        modal.hidden =
            false;

        document.body.classList.add(
            "auth-modal-open"
        );

        clearAuthenticationMessage();

        setTimeout(
            () => {

                emailInput?.focus();

            },
            50
        );

    }

    //--------------------------------------------------
    // Close Modal
    //--------------------------------------------------

    function closeAuthenticationModal() {

        modal.hidden =
            true;

        document.body.classList.remove(
            "auth-modal-open"
        );

        clearAuthenticationMessage();

    }

    //--------------------------------------------------
    // Update Navigation
    //--------------------------------------------------

    function updateAuthenticationNavigation() {

        const authenticatedMember =
            AuthService?.getCurrentMember();

        const firebaseUser =
            AuthService?.getCurrentUser();

        const signedIn =
            Boolean(
                authenticatedMember &&
                firebaseUser
            );

        if (signInButton) {

            signInButton.hidden =
                signedIn;

        }

        if (signedInMenu) {

            signedInMenu.hidden =
                !signedIn;

        }

        if (!signedIn) {

            closeMemberDropdown();

            return;

        }

        const displayName =
            getAuthenticationMemberName(
                authenticatedMember
            );

        const initials =
            getAuthenticationInitials(
                displayName
            );

        if (memberName) {

            memberName.textContent =
                displayName;

        }

        if (dropdownName) {

            dropdownName.textContent =
                displayName;

        }

        if (memberInitials) {

            memberInitials.textContent =
                initials;

        }

        if (memberEmail) {

            memberEmail.textContent =
                firebaseUser.email ||
                "Member account";

        }

    }

    //--------------------------------------------------
    // Loading State
    //--------------------------------------------------

    function setAuthenticationLoading(
        loading
    ) {

        if (submitButton) {

            submitButton.disabled =
                loading;

            submitButton.textContent =
                loading
                    ? "Signing In..."
                    : "Member Sign In";

        }

        if (emailInput) {

            emailInput.disabled =
                loading;

        }

        if (passwordInput) {

            passwordInput.disabled =
                loading;

        }

        if (resetButton) {

            resetButton.disabled =
                loading;

        }

    }

    //--------------------------------------------------
    // Message Display
    //--------------------------------------------------

    function showAuthenticationMessage(
        message,
        type
    ) {

        if (!messageBox) return;

        messageBox.textContent =
            message;

        messageBox.className =
            `auth-modal-message auth-modal-message-${type}`;

        messageBox.hidden =
            false;

    }

    function clearAuthenticationMessage() {

        if (!messageBox) return;

        messageBox.textContent =
            "";

        messageBox.className =
            "auth-modal-message";

        messageBox.hidden =
            true;

    }

    //--------------------------------------------------
    // Close Member Dropdown
    //--------------------------------------------------

    function closeMemberDropdown() {

        if (memberDropdown) {

            memberDropdown.hidden =
                true;

        }

        if (memberMenuButton) {

            memberMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }

    //--------------------------------------------------
    // Member Name
    //--------------------------------------------------

    function getAuthenticationMemberName(
        member
    ) {

        const displayName =
            String(
                member?.["Display Name"] ||
                ""
            ).trim();

        if (displayName) {

            return displayName;

        }

        const fullName =
            `${

                String(
                    member?.["First Name"] ||
                    ""
                ).trim()

            } ${

                String(
                    member?.["Last Name"] ||
                    ""
                ).trim()

            }`.trim();

        return (
            fullName ||
            "WAC Member"
        );

    }

    //--------------------------------------------------
    // Initials
    //--------------------------------------------------

    function getAuthenticationInitials(
        name
    ) {

        return (
            String(name || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    (part) =>
                        part
                            .charAt(0)
                            .toUpperCase()
                )
                .join("") ||
            "W"
        );

    }

    //--------------------------------------------------
    // Navigation
    //--------------------------------------------------

    function navigateToAuthenticationPage(
        page
    ) {

        const link =
            document.querySelector(
                `[data-page="${page}"]`
            );

        if (link) {

            link.click();

            return;

        }

        if (
            typeof Router !== "undefined" &&
            typeof Router.navigate === "function"
        ) {

            Router.navigate(
                page
            );

            return;

        }

        window.location.hash =
            page;

    }

    //--------------------------------------------------
    // Friendly Errors
    //--------------------------------------------------

    function getFriendlyAuthenticationError(
        error
    ) {

        const code =
            String(
                error?.code ||
                ""
            );

        switch (code) {

            case "auth/invalid-email":

                return "Enter a valid email address.";

            case "auth/invalid-credential":

            case "auth/wrong-password":

            case "auth/user-not-found":

                return "The email address or password is incorrect.";

            case "auth/user-disabled":

                return "This member account has been disabled.";

            case "auth/too-many-requests":

                return "Too many unsuccessful attempts were made. Try again later.";

            case "auth/network-request-failed":

                return "The authentication service could not be reached. Check your internet connection.";

            default:

                return (
                    error?.message ||
                    "Member sign-in was unsuccessful."
                );

        }

    }

})();