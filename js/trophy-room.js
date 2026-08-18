window.TrophyRoom = {

    trophies: [],
    activeCategory: "All",
    isAdmin: false,

    categoryOrder: [
        "All",
        "Big Game",
        "Small Game",
        "Waterfowl",
        "Fishing",
        "Turkey",
        "Upland",
        "Other"
    ],


    /* ==========================================
       INITIALIZE
    ========================================== */

    async init() {

        await this.setupAdminControls();

        try {

            await this.reloadTrophies();

        } catch (error) {

            console.error(
                "Trophy Room load error:",
                error
            );

            this.showError();
        }
    },


    async reloadTrophies() {

        //-------------------------------------------------
        // Load Trophies from Google Spreadsheet
        //-------------------------------------------------

        const data =
            await Database.getTrophies();

        this.trophies =
    Array.isArray(data)
        ? data
            .filter(
                item => {

                    const activeValue =
                        String(
                            item["Active"] ?? ""
                        )
                            .trim()
                            .toLowerCase();

                    if (activeValue === "") {

                        return true;
                    }

                    return ![
                        "false",
                        "no",
                        "n",
                        "0",
                        "inactive"
                    ].includes(
                        activeValue
                    );

                }
            )
            .sort(
                (first, second) => {

                    const firstDate =
                        new Date(
                            first["Date"] || 0
                        );

                    const secondDate =
                        new Date(
                            second["Date"] || 0
                        );

                    return (
                        secondDate.getTime() -
                        firstDate.getTime()
                    );
                }
            )
        : [];

        this.renderFilters();
        this.render();
    },


/* ==========================================
   ADMIN TROPHY ENTRY
========================================== */

async setupAdminControls() {

    const addButton =
        document.getElementById(
            "addTrophyButton"
        );

    if (!addButton) {

        return;
    }


    //-------------------------------------------------
    // Wait for Authentication to Finish Loading
    //-------------------------------------------------

    if (
        window.WAC &&
        window.WAC.authReady === false
    ) {

        await new Promise(
            resolve => {

                window.addEventListener(
                    "wac-auth-ready",
                    resolve,
                    {
                        once: true
                    }
                );

            }
        );
    }


    //-------------------------------------------------
    // Use Existing WAC Administrator Check
    //-------------------------------------------------

    this.isAdmin =
        Boolean(
            typeof AuthService !==
                "undefined" &&
            typeof AuthService.isAdmin ===
                "function" &&
            AuthService.isAdmin()
        );


    //-------------------------------------------------
    // Only Administrators See Add Trophy
    //-------------------------------------------------

    addButton.hidden =
        !this.isAdmin;


    if (!this.isAdmin) {

        return;
    }


    //-------------------------------------------------
    // Activate Administrator Controls
    //-------------------------------------------------

    this.bindAdminControls();
},


bindAdminControls() {

    const addButton =
        document.getElementById(
            "addTrophyButton"
        );

    const closeButton =
        document.getElementById(
            "closeTrophyFormButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelTrophyButton"
        );

    const form =
        document.getElementById(
            "trophyAdminForm"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                this.openAdminPanel();
            }
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                this.closeAdminPanel();
            }
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                this.closeAdminPanel();
            }
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                this.submitTrophy(
                    event
                );
            }
        );
    }
},


openAdminPanel() {

    if (!this.isAdmin) {

        return;
    }


    const panel =
        document.getElementById(
            "trophyAdminPanel"
        );


    if (!panel) {

        return;
    }


    this.setFormStatus(
        "",
        ""
    );


    panel.classList.add(
        "open"
    );


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    panel.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });
},


closeAdminPanel() {

    const panel =
        document.getElementById(
            "trophyAdminPanel"
        );


    if (!panel) {

        return;
    }


    panel.classList.remove(
        "open"
    );


    panel.setAttribute(
        "aria-hidden",
        "true"
    );


    this.setFormStatus(
        "",
        ""
    );
},


async submitTrophy(
    event
) {

    event.preventDefault();


    //-------------------------------------------------
    // Front-End Administrator Check
    //
    // Apps Script also independently verifies admin.
    //-------------------------------------------------

    if (!this.isAdmin) {

        this.setFormStatus(
            "Administrator access is required.",
            "error"
        );

        return;
    }


    //-------------------------------------------------
    // Confirm Trophy Database Method Exists
    //-------------------------------------------------

    if (
        typeof Database === "undefined" ||
        typeof Database.addTrophy !==
            "function"
    ) {

        this.setFormStatus(
            "The Trophy Room database service is not available.",
            "error"
        );

        return;
    }


    const form =
        event.currentTarget;


    const saveButton =
        document.getElementById(
            "saveTrophyButton"
        );


    const photoInput =
        document.getElementById(
            "trophyPhoto"
        );


    const photoFile =
        photoInput &&
        photoInput.files
            ? photoInput.files[0]
            : null;


    //-------------------------------------------------
    // Trophy Photograph Required
    //-------------------------------------------------

    if (!photoFile) {

        this.setFormStatus(
            "Please select a trophy photograph.",
            "error"
        );

        return;
    }


    //-------------------------------------------------
    // Prevent Double Submission
    //-------------------------------------------------

    if (saveButton) {

        saveButton.disabled =
            true;
    }


    this.setFormStatus(
        "Preparing photograph...",
        ""
    );


    try {

        //-------------------------------------------------
        // Prepare / Compress Photograph
        //-------------------------------------------------

        const image =
            await this.prepareTrophyImage(
                photoFile
            );


        //-------------------------------------------------
        // Read Trophy Form
        //-------------------------------------------------

        const formData =
            new FormData(
                form
            );


        const payload = {

            title:
                String(
                    formData.get(
                        "title"
                    ) || ""
                ).trim(),

            category:
                String(
                    formData.get(
                        "category"
                    ) || ""
                ).trim(),

            species:
                String(
                    formData.get(
                        "species"
                    ) || ""
                ).trim(),

            date:
                String(
                    formData.get(
                        "date"
                    ) || ""
                ).trim(),

            location:
                String(
                    formData.get(
                        "location"
                    ) || ""
                ).trim(),

            hunter:
                String(
                    formData.get(
                        "hunter"
                    ) || ""
                ).trim(),

            story:
                String(
                    formData.get(
                        "story"
                    ) || ""
                ).trim(),

            details:
                String(
                    formData.get(
                        "details"
                    ) || ""
                ).trim(),

            adventureId:
                String(
                    formData.get(
                        "adventureId"
                    ) || ""
                ).trim(),

            fileName:
                image.fileName,

            mimeType:
                image.mimeType,

            base64Data:
                image.base64Data

        };


        //-------------------------------------------------
        // Send to Authenticated Apps Script API
        //-------------------------------------------------

        this.setFormStatus(
            "Saving trophy...",
            ""
        );


        await Database.addTrophy(
            payload
        );


        //-------------------------------------------------
        // Reset Trophy Form
        //-------------------------------------------------

        form.reset();


        //-------------------------------------------------
        // Return Trophy Room to All Category
        //-------------------------------------------------

        this.activeCategory =
            "All";


        //-------------------------------------------------
        // Reload Spreadsheet Trophy Data
        //-------------------------------------------------

        await this.reloadTrophies();


        //-------------------------------------------------
        // Success Message
        //-------------------------------------------------

        this.setFormStatus(
            "Trophy added successfully.",
            "success"
        );


        //-------------------------------------------------
        // Briefly Show Success Then Close Form
        //-------------------------------------------------

        setTimeout(
            () => {

                this.closeAdminPanel();

            },
            800
        );


    } catch (error) {

        console.error(
            "Unable to add trophy:",
            error
        );


        this.setFormStatus(
            error &&
            error.message
                ? error.message
                : "The trophy could not be saved.",
            "error"
        );


    } finally {

        //-------------------------------------------------
        // Re-enable Save Button
        //-------------------------------------------------

        if (saveButton) {

            saveButton.disabled =
                false;
        }
    }
},

    /* ==========================================
       IMAGE PREPARATION
    ========================================== */

    async prepareTrophyImage(
        file
    ) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        //-------------------------------------------------
        // Validate File Type
        //-------------------------------------------------

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            throw new Error(
                "Only JPEG, PNG, and WebP images may be uploaded."
            );
        }


        //-------------------------------------------------
        // Apps Script maximum is 2 MB.
        //
        // We target 1.8 MB to leave a little safety room.
        //-------------------------------------------------

        const targetBytes =
            1.8 * 1024 * 1024;


        //-------------------------------------------------
        // Small File — No Compression Needed
        //-------------------------------------------------

        if (
            file.size <=
            targetBytes
        ) {

            return {

                fileName:
                    file.name,

                mimeType:
                    file.type,

                base64Data:
                    await this.fileToBase64(
                        file
                    )

            };
        }


        //-------------------------------------------------
        // Load Large Photograph
        //-------------------------------------------------

        const image =
            await this.loadImageFile(
                file
            );


        //-------------------------------------------------
        // Resize Large Dimensions
        //-------------------------------------------------

        const maxDimension =
            1800;

        let width =
            image.naturalWidth;

        let height =
            image.naturalHeight;

        const scale =
            Math.min(
                1,
                maxDimension /
                    Math.max(
                        width,
                        height
                    )
            );

        width =
            Math.max(
                1,
                Math.round(
                    width * scale
                )
            );

        height =
            Math.max(
                1,
                Math.round(
                    height * scale
                )
            );


        //-------------------------------------------------
        // Draw to Canvas
        //-------------------------------------------------

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            width;

        canvas.height =
            height;

        const context =
            canvas.getContext(
                "2d"
            );

        if (!context) {

            throw new Error(
                "The photograph could not be processed by this browser."
            );
        }

        context.drawImage(
            image,
            0,
            0,
            width,
            height
        );


        //-------------------------------------------------
        // Convert to JPEG and Reduce Quality as Needed
        //-------------------------------------------------

        let quality =
            0.88;

        let blob =
            await this.canvasToBlob(
                canvas,
                "image/jpeg",
                quality
            );


        while (
            blob.size >
                targetBytes &&
            quality > 0.5
        ) {

            quality -=
                0.08;

            blob =
                await this.canvasToBlob(
                    canvas,
                    "image/jpeg",
                    quality
                );
        }


        //-------------------------------------------------
        // Final Size Check
        //-------------------------------------------------

        if (
            blob.size >
            2 * 1024 * 1024
        ) {

            throw new Error(
                "This image is still too large after compression. Please select a smaller photograph."
            );
        }


        //-------------------------------------------------
        // Build New JPEG Filename
        //-------------------------------------------------

        const originalName =
            String(
                file.name ||
                "trophy"
            )
                .replace(
                    /\.[^.]+$/,
                    ""
                );


        return {

            fileName:
                originalName +
                ".jpg",

            mimeType:
                "image/jpeg",

            base64Data:
                await this.fileToBase64(
                    blob
                )

        };
    },


    fileToBase64(
        fileOrBlob
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const reader =
                    new FileReader();


                reader.onload =
                    () => {

                        const result =
                            String(
                                reader.result ||
                                ""
                            );

                        const commaIndex =
                            result.indexOf(
                                ","
                            );

                        resolve(
                            commaIndex >= 0
                                ? result.slice(
                                    commaIndex + 1
                                )
                                : result
                        );
                    };


                reader.onerror =
                    () => {

                        reject(
                            new Error(
                                "The selected photograph could not be read."
                            )
                        );
                    };


                reader.readAsDataURL(
                    fileOrBlob
                );

            }
        );
    },


    loadImageFile(
        file
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const image =
                    new Image();

                const objectUrl =
                    URL.createObjectURL(
                        file
                    );


                image.onload =
                    () => {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                        resolve(
                            image
                        );
                    };


                image.onerror =
                    () => {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                        reject(
                            new Error(
                                "The selected photograph could not be opened."
                            )
                        );
                    };


                image.src =
                    objectUrl;

            }
        );
    },


    canvasToBlob(
        canvas,
        mimeType,
        quality
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                canvas.toBlob(
                    blob => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "The selected photograph could not be compressed."
                                )
                            );

                            return;
                        }

                        resolve(
                            blob
                        );

                    },
                    mimeType,
                    quality
                );

            }
        );
    },


    setFormStatus(
        message,
        type
    ) {

        const status =
            document.getElementById(
                "trophyFormStatus"
            );

        if (!status) {

            return;
        }

        status.textContent =
            message || "";

        status.className =
            "trophy-form-status" +
            (
                type
                    ? " " + type
                    : ""
            );
    },


    /* ==========================================
       FILTERS
    ========================================== */

    renderFilters() {

        const container =
            document.getElementById(
                "trophyFilters"
            );

        if (!container) {

            return;
        }


        const categories =
            new Set(
                this.trophies
                    .map(
                        item =>
                            String(
                                item["Category"] || ""
                            ).trim()
                    )
                    .filter(
                        Boolean
                    )
            );


        const availableCategories =
            this.categoryOrder.filter(
                category =>
                    category === "All" ||
                    categories.has(
                        category
                    )
            );


        categories.forEach(
            category => {

                if (
                    category &&
                    !availableCategories.includes(
                        category
                    )
                ) {

                    availableCategories.push(
                        category
                    );
                }

            }
        );


        container.innerHTML =
            availableCategories
                .map(
                    category => {

                        const active =
                            category ===
                            this.activeCategory
                                ? "active"
                                : "";

                        return `
                            <button
                                type="button"
                                class="trophy-filter ${active}"
                                data-trophy-category="${this.escapeAttribute(category)}"
                            >
                                ${this.escapeHTML(category)}
                            </button>
                        `;

                    }
                )
                .join("");


        container
            .querySelectorAll(
                "[data-trophy-category]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.activeCategory =
                                button.dataset
                                    .trophyCategory;

                            this.renderFilters();
                            this.render();

                        }
                    );

                }
            );
    },


    /* ==========================================
       MAIN RENDER
    ========================================== */

    render() {

        const list =
            document.getElementById(
                "trophyList"
            );

        const count =
            document.getElementById(
                "trophyCount"
            );

        if (!list) {

            return;
        }


        const filtered =
            this.activeCategory === "All"
                ? this.trophies
                : this.trophies.filter(
                    item =>
                        String(
                            item["Category"] || ""
                        ).trim() ===
                        this.activeCategory
                );


        if (count) {

            const word =
                filtered.length === 1
                    ? "Trophy"
                    : "Trophies";

            count.textContent =
                `${filtered.length} ${word}`;
        }


        if (
            filtered.length === 0
        ) {

            list.innerHTML =
                this.emptyState();

            return;
        }


        list.innerHTML =
            filtered
                .map(
                    item =>
                        this.createTrophyCard(
                            item
                        )
                )
                .join("");


        this.bindAdventureButtons();
    },


    /* ==========================================
       TROPHY CARD
    ========================================== */

    createTrophyCard(
        item
    ) {

        const title =
            this.escapeHTML(
                item["Title"] ||
                "WAC Trophy"
            );

        const category =
            this.escapeHTML(
                item["Category"] ||
                "Other"
            );

        const species =
            this.escapeHTML(
                item["Species"] ||
                ""
            );

        const date =
            this.escapeHTML(
                item["Date"] ||
                ""
            );

        const location =
            this.escapeHTML(
                item["Location"] ||
                ""
            );

        const hunter =
            this.escapeHTML(
                item["Hunter"] ||
                ""
            );

        const story =
            this.escapeHTML(
                item["Story"] ||
                ""
            );

        const image =
            this.escapeAttribute(
                item["Image"] ||
                "assets/icons/wac-icon.png"
            );

        const adventureId =
            String(
                item["AdventureID"] ||
                ""
            ).trim();


        //-------------------------------------------------
        // Metadata
        //-------------------------------------------------

        let metadata =
            "";


        if (location) {

            metadata += `
                <span class="trophy-meta-item">
                    <strong>Location:</strong>
                    ${location}
                </span>
            `;
        }


        if (hunter) {

            metadata += `
                <span class="trophy-meta-item">
                    <strong>Hunter:</strong>
                    ${hunter}
                </span>
            `;
        }


        //-------------------------------------------------
        // Trophy Details
        //-------------------------------------------------

        let details =
            "";

        const rawDetails =
            String(
                item["Details"] ||
                ""
            ).trim();


        if (rawDetails) {

            const detailItems =
                rawDetails
                    .split(
                        "|"
                    )
                    .map(
                        detail =>
                            detail.trim()
                    )
                    .filter(
                        Boolean
                    );


            if (
                detailItems.length
            ) {

                details = `
                    <div class="trophy-details">

                        ${detailItems
                            .map(
                                detail => `
                                    <span class="trophy-detail">
                                        ${this.escapeHTML(detail)}
                                    </span>
                                `
                            )
                            .join("")}

                    </div>
                `;
            }
        }


        //-------------------------------------------------
        // Related Adventure Button
        //-------------------------------------------------

        let adventureButton =
            "";


        if (adventureId) {

            adventureButton = `
                <div class="trophy-adventure">

                    <button
                        type="button"
                        data-trophy-adventure="${this.escapeAttribute(adventureId)}"
                    >
                        View Related Adventure
                    </button>

                </div>
            `;
        }


        //-------------------------------------------------
        // Build Card
        //-------------------------------------------------

        return `
            <article class="trophy-card">

                <div class="trophy-photo-wrap">

                    <img
                        class="trophy-photo"
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='assets/icons/wac-icon.png';
                        "
                    >

                    <span class="trophy-category-badge">
                        ${category}
                    </span>

                </div>


                <div class="trophy-story">

                    ${
                        date
                            ? `
                                <div class="trophy-date">
                                    ${date}
                                </div>
                            `
                            : ""
                    }

                    <h2 class="trophy-title">
                        ${title}
                    </h2>

                    ${
                        species
                            ? `
                                <div class="trophy-species">
                                    ${species}
                                </div>
                            `
                            : ""
                    }

                    ${
                        metadata
                            ? `
                                <div class="trophy-meta">
                                    ${metadata}
                                </div>
                            `
                            : ""
                    }

                    <p class="trophy-story-text">
                        ${story}
                    </p>

                    ${details}

                    ${adventureButton}

                </div>

            </article>
        `;
    },


    /* ==========================================
       RELATED ADVENTURE BUTTONS
    ========================================== */

    bindAdventureButtons() {

        document
            .querySelectorAll(
                "[data-trophy-adventure]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const adventureId =
                                String(
                                    button.dataset
                                        .trophyAdventure ||
                                    ""
                                ).trim();


                            if (!adventureId) {

                                return;
                            }


                            if (
                                typeof Database ===
                                    "undefined" ||
                                typeof Database
                                    .getAdventures !==
                                    "function"
                            ) {

                                return;
                            }


                            try {

                                const adventures =
                                    await Database
                                        .getAdventures();


                                const adventure =
                                    adventures.find(
                                        item =>
                                            String(
                                                item["ID"] ||
                                                ""
                                            ).trim() ===
                                            adventureId
                                    );


                                if (
                                    adventure &&
                                    typeof Drawer !==
                                        "undefined" &&
                                    typeof Drawer.open ===
                                        "function"
                                ) {

                                    Drawer.open(
                                        adventure
                                    );
                                }


                            } catch (error) {

                                console.error(
                                    "Unable to open related adventure:",
                                    error
                                );
                            }

                        }
                    );

                }
            );
    },


    /* ==========================================
       EMPTY STATE
    ========================================== */

    emptyState() {

        return `
            <div class="trophy-empty">

                <div class="trophy-empty-icon">
                    🦌
                </div>

                <h2>
                    The Trophy Room Is Ready
                </h2>

                <p>
                    No trophies have been added yet.
                    Hunting successes, memorable catches,
                    photographs, and their stories will
                    appear here.
                </p>

            </div>
        `;
    },


    /* ==========================================
       ERROR STATE
    ========================================== */

    showError() {

        const list =
            document.getElementById(
                "trophyList"
            );

        const count =
            document.getElementById(
                "trophyCount"
            );


        if (count) {

            count.textContent =
                "Unable to load";
        }


        if (!list) {

            return;
        }


        list.innerHTML = `
            <div class="trophy-empty">

                <div class="trophy-empty-icon">
                    ⚠️
                </div>

                <h2>
                    Trophy Room Could Not Load
                </h2>

                <p>
                    The Trophy Room could not retrieve
                    information from the WAC database.
                </p>

            </div>
        `;
    },


    /* ==========================================
       SECURITY / DISPLAY HELPERS
    ========================================== */

    escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    },


    escapeAttribute(
        value
    ) {

        return this.escapeHTML(
            value
        );
    }

};


/* ==========================================
   START PAGE
========================================== */

TrophyRoom.init();