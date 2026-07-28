// ======================================
// WAC Participation Waiver
// Version 1.0
// ======================================

(async function () {

    const loadingSection =
        document.getElementById(
            "waiverLoadingSection"
        );

    const errorSection =
        document.getElementById(
            "waiverErrorSection"
        );

    const signedSection =
        document.getElementById(
            "waiverSignedSection"
        );

    const signingSection =
        document.getElementById(
            "waiverSigningSection"
        );

    const statusChip =
        document.getElementById(
            "waiverStatusChip"
        );

    try {

        //--------------------------------------------------
        // Require Member Sign-In
        //--------------------------------------------------

        if (
            typeof AuthService === "undefined" ||
            !AuthService.isSignedIn()
        ) {

            throw new Error(
                "You must sign in to review or sign the WAC participation waiver."
            );

        }

        //--------------------------------------------------
        // Load Current Waiver Status
        //--------------------------------------------------

        const response =
            await Database.getWaiverStatus();

        const waiver =
            response?.waiver || {};

        hideWaiverElement(
            loadingSection
        );

        if (waiver.signed === true) {

            renderSignedWaiver(
                waiver,
                signedSection,
                statusChip
            );

            return;

        }

        renderUnsignedWaiver(
            waiver,
            signingSection,
            statusChip
        );

    }

    catch (error) {

        console.error(
            "Waiver Page Error:",
            error
        );

        hideWaiverElement(
            loadingSection
        );

        hideWaiverElement(
            signedSection
        );

        hideWaiverElement(
            signingSection
        );

        showWaiverElement(
            errorSection
        );

        const errorMessage =
            document.getElementById(
                "waiverErrorMessage"
            );

        if (errorMessage) {

            errorMessage.textContent =
                error.message ||
                "The current waiver could not be loaded.";

        }

        if (statusChip) {

            statusChip.textContent =
                "Unavailable";

        }

    }

})();


//--------------------------------------------------
// Render Signed Waiver
//--------------------------------------------------

function renderSignedWaiver(
    waiver,
    signedSection,
    statusChip
) {

    showWaiverElement(
        signedSection
    );

    if (statusChip) {

        statusChip.textContent =
            "Signed";

    }

    const signedMeta =
        document.getElementById(
            "waiverSignedMeta"
        );

    const version =
        String(
            waiver.version || ""
        ).trim();

    const signedDate =
        formatWaiverDate(
            waiver.signedDateTime
        );

    if (signedMeta) {

        const details = [];

        if (version) {

            details.push(
                `Waiver Version ${version}`
            );

        }

        if (signedDate) {

            details.push(
                `Signed ${signedDate}`
            );

        }

        signedMeta.textContent =
            details.length > 0
                ? details.join(" • ")
                : "Your current waiver signature is on file.";

    }

    const documentLink =
        document.getElementById(
            "waiverSignedDocumentLink"
        );

    configureWaiverDocumentLink(
        documentLink,
        waiver
    );

}


//--------------------------------------------------
// Render Unsigned Waiver
//--------------------------------------------------

function renderUnsignedWaiver(
    waiver,
    signingSection,
    statusChip
) {

    showWaiverElement(
        signingSection
    );

    if (statusChip) {

        statusChip.textContent =
            "Not Signed";

    }

    const version =
        String(
            waiver.version || ""
        ).trim();

    const versionChip =
        document.getElementById(
            "waiverVersionChip"
        );

    if (versionChip) {

        versionChip.textContent =
            version
                ? `Version ${version}`
                : "Current Version";

    }

    const documentTitle =
        document.getElementById(
            "waiverDocumentTitle"
        );

    if (documentTitle) {

        documentTitle.textContent =
            waiver.title ||
            "WAC Participation Waiver";

    }

    const documentLink =
        document.getElementById(
            "waiverDocumentLink"
        );

    const documentPending =
        document.getElementById(
            "waiverDocumentPending"
        );

    const documentReady =
        isWaiverDocumentReady(
            waiver
        );

    if (documentReady) {

        documentLink.href =
            waiver.documentUrl;

        documentLink.hidden =
            false;

        documentLink.style.display =
            "inline-flex";

        hideWaiverElement(
            documentPending
        );

    } else {

        documentLink.removeAttribute(
            "href"
        );

        documentLink.hidden =
            true;

        documentLink.style.display =
            "none";

        showWaiverElement(
            documentPending
        );

    }

    configureWaiverSigningForm(
        waiver,
        documentReady
    );

}


//--------------------------------------------------
// Configure Signing Form
//--------------------------------------------------

function configureWaiverSigningForm(
    waiver,
    documentReady
) {

    const form =
        document.getElementById(
            "waiverSigningForm"
        );

    const signatureInput =
        document.getElementById(
            "waiverTypedSignature"
        );

    const acknowledgment =
        document.getElementById(
            "waiverAcknowledgment"
        );

    const submitButton =
        document.getElementById(
            "waiverSubmitButton"
        );

    if (
        !form ||
        !signatureInput ||
        !acknowledgment ||
        !submitButton
    ) {

        return;

    }

    signatureInput.disabled =
        !documentReady;

    acknowledgment.disabled =
        !documentReady;

    submitButton.disabled =
        true;

    const updateSubmitState = () => {

        submitButton.disabled =
            !documentReady ||
            !signatureInput.value.trim() ||
            !acknowledgment.checked;

    };

    signatureInput.addEventListener(
        "input",
        updateSubmitState
    );

    acknowledgment.addEventListener(
        "change",
        updateSubmitState
    );

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            if (!documentReady) {

                showWaiverFormMessage(
                    "The final waiver document is not yet available for electronic signature.",
                    true
                );

                return;

            }

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Recording Signature...";

            showWaiverFormMessage(
                "Submitting your electronic signature.",
                false
            );

            try {

                const response =
                    await Database.authenticatedPost(
                        "signWaiver",
                        {
                            waiverVersion:
                                String(
                                    waiver.version || ""
                                ).trim(),

                            typedSignature:
                                signatureInput.value.trim(),

                            acknowledgmentAccepted:
                                acknowledgment.checked === true,

                            userAgent:
                                navigator.userAgent
                        }
                    );

                if (!response.success) {

                    throw new Error(
                        response.error ||
                        "The waiver signature could not be recorded."
                    );

                }

                showWaiverFormMessage(
                    "Your waiver was signed and recorded successfully.",
                    false
                );

                submitButton.textContent =
                    "Waiver Signed";

                setTimeout(
                    () => {

                        WACRouter.loadPage(
                            "profile"
                        );

                    },
                    1000
                );

            }

            catch (error) {

                console.error(
                    "Waiver Signature Error:",
                    error
                );

                showWaiverFormMessage(
                    error.message ||
                    "The waiver signature could not be recorded.",
                    true
                );

                submitButton.textContent =
                    "Electronically Sign Waiver";

                updateSubmitState();

            }

        }
    );

}


//--------------------------------------------------
// Document Helpers
//--------------------------------------------------

function isWaiverDocumentReady(
    waiver
) {

    const documentUrl =
        String(
            waiver?.documentUrl || ""
        ).trim();

    const documentHash =
        String(
            waiver?.documentHash || ""
        ).trim();

    return (
        Boolean(documentUrl) &&
        Boolean(documentHash) &&
        !documentHash
            .toUpperCase()
            .includes(
                "PENDING"
            )
    );

}


function configureWaiverDocumentLink(
    link,
    waiver
) {

    if (!link) return;

    if (
        isWaiverDocumentReady(
            waiver
        )
    ) {

        link.href =
            waiver.documentUrl;

        link.hidden =
            false;

        link.style.display =
            "inline-flex";

    } else {

        link.removeAttribute(
            "href"
        );

        link.hidden =
            true;

        link.style.display =
            "none";

    }

}


//--------------------------------------------------
// Message Helper
//--------------------------------------------------

function showWaiverFormMessage(
    message,
    isError
) {

    const messageBox =
        document.getElementById(
            "waiverFormMessage"
        );

    if (!messageBox) return;

    messageBox.textContent =
        message;

    messageBox.hidden =
        false;

    messageBox.style.display =
        "block";

    messageBox.setAttribute(
        "role",
        isError
            ? "alert"
            : "status"
    );

}


//--------------------------------------------------
// Display Helpers
//--------------------------------------------------

function showWaiverElement(
    element
) {

    if (!element) return;

    element.hidden =
        false;

    element.style.display =
        "";

}


function hideWaiverElement(
    element
) {

    if (!element) return;

    element.hidden =
        true;

    element.style.display =
        "none";

}


//--------------------------------------------------
// Date Helper
//--------------------------------------------------

function formatWaiverDate(
    value
) {

    const dateText =
        String(
            value || ""
        ).trim();

    if (!dateText) {

        return "";

    }

    const date =
        new Date(
            dateText
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateText;

    }

    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}