// ======================================
// WAC Adventure Drawer
// Version 6.2
// ======================================

const Drawer = {

    currentAdventure: null,

    currentMemberId: null,

    checklistRows: null,

    MAX_GALLERY_IMAGES: 6,

    CHECKLIST_STORAGE_KEY:
        "wacAdventureChecklistProgress",

    DEFAULT_HERO_IMAGE:
        "assets/images/adventures/default-hero.jpg",

    async init() {

        const closeButton =
            document.getElementById("drawerClose");

        const overlay =
            document.getElementById("drawerOverlay");

        if (closeButton) {

            closeButton.onclick = () => this.close();

        }

        if (overlay) {

            overlay.onclick = (event) => {

                if (event.target === overlay) {

                    this.close();

                }

            };

        }

                //--------------------------------------------------
// Submit Adventure Completion
//--------------------------------------------------

const completeButton =
    document.getElementById(
        "completeAdventure"
    );

const storyInput =
    document.getElementById(
        "adventureSubmissionStory"
    );

const storyCount =
    document.getElementById(
        "adventureStoryCount"
    );

//--------------------------------------------------
// Adventure Story Character Counter
//--------------------------------------------------

if (storyInput) {

    const updateStoryCount = () => {

        const characterCount =
            storyInput.value.length;

        if (storyCount) {

            storyCount.textContent =
                `${characterCount} / 2500`;

        }

    };

    storyInput.addEventListener(
        "input",
        updateStoryCount
    );

    updateStoryCount();

}

//--------------------------------------------------
// Submit Adventure Completion
//--------------------------------------------------

if (completeButton) {

    completeButton.onclick = async () => {

        const submittedAdventure =
            this.currentAdventure;

        if (!submittedAdventure) {

            return;

        }

        //--------------------------------------------------
        // Require Authorized Member Sign-In
        //--------------------------------------------------

        if (
            typeof AuthService === "undefined" ||
            !AuthService.isSignedIn()
        ) {

            const signInButton =
                document.getElementById(
                    "memberSignInButton"
                );

            if (signInButton) {

                signInButton.click();

            } else {

                alert(
                    "Member sign-in is required before submitting an adventure."
                );

            }

            return;

        }

        //--------------------------------------------------
        // Verify Submission Permission
        //--------------------------------------------------

        if (
            !AuthService.canSubmitCompletions()
        ) {

            alert(
                "Your WAC member account is not authorized to submit adventure completions."
            );

            return;

        }

        //--------------------------------------------------
        // Validate Adventure Story
        //--------------------------------------------------

        const submissionStory =
            String(
                storyInput?.value || ""
            ).trim();

        if (!submissionStory) {

            alert(
                "Please tell the story of how you completed this adventure."
            );

            if (storyInput) {

                storyInput.focus();

            }

            return;

        }

        if (submissionStory.length < 25) {

            alert(
                "Please provide a little more detail about how you completed the adventure."
            );

            if (storyInput) {

                storyInput.focus();

            }

            return;

        }

        if (submissionStory.length > 2500) {

            alert(
                "Adventure stories cannot exceed 2,500 characters."
            );

            if (storyInput) {

                storyInput.focus();

            }

            return;

        }

        //--------------------------------------------------
        // Prepare Submission
        //--------------------------------------------------

        const originalButtonText =
            completeButton.textContent;

        completeButton.disabled =
            true;

        completeButton.textContent =
            "Submitting...";

        completeButton.classList.add(
            "button-disabled"
        );

        if (storyInput) {

            storyInput.disabled =
                true;

        }

        try {

            const result =
                await API.submitCompletion(
                    submittedAdventure["ID"],
                    submissionStory
                );

            completeButton.textContent =
                "Submitted — Pending Approval";

            completeButton.disabled =
                true;

            completeButton.classList.add(
                "button-disabled"
            );

            const status =
                document.getElementById(
                    "drawerStatus"
                );

            if (status) {

                status.textContent =
                    "Pending Approval";

            }

            alert(
                result.message ||
                "Adventure submitted for administrator approval."
            );

        }

        catch (error) {

            console.error(
                "Unable to submit adventure completion.",
                error
            );

            completeButton.disabled =
                false;

            completeButton.textContent =
                originalButtonText ||
                "Submit Adventure for Approval";

            completeButton.classList.remove(
                "button-disabled"
            );

            if (storyInput) {

                storyInput.disabled =
                    false;

                storyInput.focus();

            }

            alert(
                error?.message ||
                "Unable to submit the adventure."
            );

        }

    };

}

},
    //--------------------------------------------------
    // Open Drawer
    //--------------------------------------------------

    async open(adventure) {

        this.currentAdventure = adventure;

        if (!adventure) return;

        const overlay =
            document.getElementById("drawerOverlay");

        if (!overlay) return;

        overlay.classList.add("open");

               const member =
            typeof AuthService !== "undefined"
                ? AuthService.getCurrentMember()
                : null;

        this.currentMemberId =
            String(
                member?.["Member ID"] || ""
            ).trim();

        await MemberState.load(
            this.currentMemberId
        );

        //--------------------------------------------------
        // Text Helper
        //--------------------------------------------------

        const set = (id, value) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value || "";

            }

        };

        //--------------------------------------------------
        // Badge
        //--------------------------------------------------

        const badge =
            document.getElementById("drawerBadge");

        if (badge) {

            badge.onerror = null;

            badge.src =
                `assets/badges/${adventure["ID"]}.webp`;

            badge.onerror = () => {

                badge.onerror = null;

                badge.src =
                    `assets/badges/${adventure["ID"]}.png`;

            };

        }

        //--------------------------------------------------
        // Populate Header
        //--------------------------------------------------

        set("drawerTitle", adventure.Title);
        set("drawerCategory", adventure.Category);

        set(
            "drawerPoints",
            `${adventure["Points"] || 100} Points`
        );

        //--------------------------------------------------
        // Summary Banner
        //--------------------------------------------------

        set(
            "drawerDifficultyHeader",
            adventure["Difficulty"]
        );

        set(
            "drawerTimeHeader",
            adventure["Estimated Time"]
        );

        set(
            "drawerLocationHeader",
            adventure["Location"]
        );

        set(
            "drawerSeasonHeader",
            adventure["Season"]
        );

        //--------------------------------------------------
        // Adventure Type
        //--------------------------------------------------

        const category =
            (adventure.Category || "").toLowerCase();

        let type = "Outdoor";

        if (category.includes("hunt")) {

            type = "Hunting";

        } else if (category.includes("fish")) {

            type = "Fishing";

        } else if (category.includes("camp")) {

            type = "Camping";

        } else if (category.includes("craft")) {

            type = "Craft";

        } else if (category.includes("food")) {

            type = "Cooking";

        } else if (category.includes("history")) {

            type = "History";

        } else if (category.includes("shoot")) {

            type = "Shooting";

        } else if (category.includes("water")) {

            type = "Water";

        }

        set("drawerType", type);

        set(
            "drawerAge",
            adventure["Minimum Age"] || "All Ages"
        );

        //--------------------------------------------------
        // Content
        //--------------------------------------------------

        set("drawerMission", adventure["Mission"]);
        set("drawerWhy", adventure["Why It Matters"]);
        set("drawerVibe", adventure["Vibe"]);
        set("drawerNote", adventure["Presidents Note"]);

        //--------------------------------------------------
        // Adventure Checklist
        //--------------------------------------------------

        await this.loadAdventureChecklist(
            adventure,
            this.currentMemberId
        );

        //--------------------------------------------------
        // Equipment List
        //--------------------------------------------------

        const equipment =
            document.getElementById("drawerEquipment");

        if (equipment) {

            equipment.innerHTML = "";

            const equipmentItems =
                this.parseList(adventure["Equipment"]);

            if (equipmentItems.length === 0) {

                equipment.innerHTML =
                    "<div class='list-item'>None Required</div>";

            } else {

                equipmentItems.forEach((item) => {

                    const listItem =
                        document.createElement("div");

                    listItem.className =
                        "list-item";

                    const icon =
                        document.createElement("span");

                    icon.className =
                        "list-icon";

                    icon.textContent =
                        "🧰";

                    const text =
                        document.createElement("span");

                    text.textContent =
                        item;

                    listItem.append(
                        icon,
                        text
                    );

                    equipment.appendChild(
                        listItem
                    );

                });

            }

        }

        //--------------------------------------------------
        // Prerequisites
        //--------------------------------------------------

        const prerequisite =
            document.getElementById(
                "drawerPrerequisite"
            );

        if (prerequisite) {

            prerequisite.innerHTML = "";

            const prerequisiteItems =
                this.parseList(
                    adventure["Prerequisite"]
                );

            if (prerequisiteItems.length === 0) {

                prerequisite.innerHTML =
                    "<div class='list-item'>None</div>";

            } else {

                prerequisiteItems.forEach((item) => {

                    const listItem =
                        document.createElement("div");

                    listItem.className =
                        "list-item";

                    const icon =
                        document.createElement("span");

                    icon.className =
                        "list-icon";

                    icon.textContent =
                        "✓";

                    const text =
                        document.createElement("span");

                    text.textContent =
                        item;

                    listItem.append(
                        icon,
                        text
                    );

                    prerequisite.appendChild(
                        listItem
                    );

                });

            }

        }

        //--------------------------------------------------
        // Adventure Photos
        //--------------------------------------------------

        await this.loadAdventurePhotos(
            adventure
        );

               //--------------------------------------------------
        // Completion and Submission Status
        //--------------------------------------------------

        const completed =
            MemberState.isCompleted(
                adventure["ID"]
            );

        const button =
            document.getElementById(
                "completeAdventure"
            );

        let pending =
            false;

        const authenticatedMember =
            typeof AuthService !== "undefined"
                ? AuthService.getCurrentMember()
                : null;

        const authenticatedMemberId =
            String(
                authenticatedMember?.["Member ID"] ||
                ""
            ).trim();

        //--------------------------------------------------
        // Check for Existing Pending Submission
        //--------------------------------------------------

        if (
            !completed &&
            authenticatedMemberId &&
            authenticatedMemberId ===
                this.currentMemberId
        ) {

            try {

                const logs =
                    await Database.getLogs();

                pending =
                    logs.some((log) => {

                        return (

                            String(
                                log["Member ID"] || ""
                            ).trim() ===
                                authenticatedMemberId &&

                            String(
                                log["Badge ID"] || ""
                            ).trim() ===
                                String(
                                    adventure["ID"] || ""
                                ).trim() &&

                            String(
                                log.Status || ""
                            ).trim().toLowerCase() ===
                                "pending"

                        );

                    });

            }

            catch (error) {

                console.error(
                    "Unable to check pending adventure submissions.",
                    error
                );

            }

        }

        //--------------------------------------------------
        // Completed
        //--------------------------------------------------

        if (completed) {

            set(
                "drawerStatus",
                "Completed ✓"
            );

            if (button) {

                button.textContent =
                    "Completed ✓";

                button.disabled =
                    true;

                button.classList.add(
                    "button-disabled"
                );

            }

        }

        //--------------------------------------------------
        // Pending Approval
        //--------------------------------------------------

        else if (pending) {

            set(
                "drawerStatus",
                "Pending Approval"
            );

            if (button) {

                button.textContent =
                    "Submitted — Pending Approval";

                button.disabled =
                    true;

                button.classList.add(
                    "button-disabled"
                );

            }

        }

        //--------------------------------------------------
        // Available to Submit
        //--------------------------------------------------

        else {

            set(
                "drawerStatus",
                "Available"
            );

            if (button) {

                button.textContent =
                    "Complete Adventure";

                button.disabled =
                    false;

                button.classList.remove(
                    "button-disabled"
                );

            }

        }

    },

    //--------------------------------------------------
    // Parse Text List
    //--------------------------------------------------

    parseList(value) {

        return String(value || "")
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);

    },

    //--------------------------------------------------
    // Adventure Checklist
    //--------------------------------------------------
        async loadAdventureChecklist(
        adventure,
        memberId
    ) {

        const checklistSection =
            document.getElementById(
                "drawerChecklistSection"
            );

        const checklistContainer =
            document.getElementById(
                "drawerChecklist"
            );

        if (
            !checklistSection ||
            !checklistContainer
        ) {

            return;

        }

        //--------------------------------------------------
        // Reset Previous Checklist
        //--------------------------------------------------

        checklistSection.hidden = true;
        checklistContainer.innerHTML = "";

        this.updateChecklistDisplay(
            0,
            0
        );

        const adventureId =
            String(adventure["ID"] || "").trim();

        if (!adventureId) return;

        //--------------------------------------------------
        // Load Checklist Sheet
        //--------------------------------------------------

        const checklistRows =
            await this.getChecklistRows();

        //--------------------------------------------------
        // Prevent Stale Drawer Updates
        //--------------------------------------------------

        if (
            !this.currentAdventure ||
            this.currentAdventure["ID"] !==
                adventure["ID"]
        ) {

            return;

        }

        const adventureItems =
            checklistRows
                .filter((row) => {

                    return String(
                        row["Adventure ID"] || ""
                    ).trim() === adventureId;

                })
                .sort((firstItem, secondItem) => {

                    return (
                        Number(
                            firstItem["Item Order"] || 0
                        ) -
                        Number(
                            secondItem["Item Order"] || 0
                        )
                    );

                });

        if (adventureItems.length === 0) {

            return;

        }

        //--------------------------------------------------
        // Load Saved Member Progress
        //--------------------------------------------------

        const savedProgress =
            this.getSavedChecklistProgress(

                memberId,
                adventureId

            );

        //--------------------------------------------------
        // Build Checklist Items
        //--------------------------------------------------

        adventureItems.forEach(
            (row, index) => {

                const itemText =
                    String(
                        row["Checklist Item"] || ""
                    ).trim();

                if (!itemText) return;

                const itemOrder =
                    String(
                        row["Item Order"] ||
                        index + 1
                    ).trim();

                const itemKey =
                    this.createChecklistItemKey(

                        itemOrder,
                        itemText

                    );

                const checklistItem =
                    document.createElement("label");

                checklistItem.className =
                    "drawer-checklist-item";

                const checkbox =
                    document.createElement("input");

                checkbox.type =
                    "checkbox";

                checkbox.className =
                    "drawer-checklist-checkbox";

                checkbox.checked =
                    Boolean(savedProgress[itemKey]);

                const customCheckbox =
                    document.createElement("span");

                customCheckbox.className =
                    "drawer-checklist-control";

                const itemContent =
                    document.createElement("span");

                itemContent.className =
                    "drawer-checklist-content";

                const itemNumber =
                    document.createElement("span");

                itemNumber.className =
                    "drawer-checklist-number";

                itemNumber.textContent =
                    itemOrder;

                const itemLabel =
                    document.createElement("span");

                itemLabel.className =
                    "drawer-checklist-label";

                itemLabel.textContent =
                    itemText;

                itemContent.append(
                    itemNumber,
                    itemLabel
                );

                checklistItem.append(
                    checkbox,
                    customCheckbox,
                    itemContent
                );

                checkbox.addEventListener(
                    "change",
                    () => {

                        this.saveChecklistItemProgress(

                            memberId,
                            adventureId,
                            itemKey,
                            checkbox.checked

                        );

                        checklistItem.classList.toggle(
                            "completed",
                            checkbox.checked
                        );

                        this.refreshChecklistProgress();

                    }
                );

                checklistItem.classList.toggle(
                    "completed",
                    checkbox.checked
                );

                checklistContainer.appendChild(
                    checklistItem
                );

            }
        );

        const renderedItems =
            checklistContainer.querySelectorAll(
                ".drawer-checklist-item"
            );

        if (renderedItems.length === 0) {

            return;

        }

        checklistSection.hidden = false;

        this.refreshChecklistProgress();

    },

    //--------------------------------------------------
    // Load and Cache Checklist Rows
    //--------------------------------------------------

    async getChecklistRows() {

        if (Array.isArray(this.checklistRows)) {

            return this.checklistRows;

        }

        try {

            const rows =
                await Database.getChecklist();

            this.checklistRows =
                Array.isArray(rows)
                    ? rows
                    : [];

        }

        catch (error) {

            console.error(
                "Unable to load adventure checklist.",
                error
            );

            this.checklistRows = [];

        }

        return this.checklistRows;

    },

    //--------------------------------------------------
    // Create Stable Checklist Item Key
    //--------------------------------------------------

    createChecklistItemKey(
        itemOrder,
        itemText
    ) {

        return `${itemOrder}:${itemText}`;

    },

    //--------------------------------------------------
    // Read All Checklist Progress
    //--------------------------------------------------

    getChecklistStorage() {

        try {

            const storedValue =
                localStorage.getItem(
                    this.CHECKLIST_STORAGE_KEY
                );

            if (!storedValue) {

                return {};

            }

            const parsedValue =
                JSON.parse(storedValue);

            return (
                parsedValue &&
                typeof parsedValue === "object"
            )
                ? parsedValue
                : {};

        }

        catch (error) {

            console.error(
                "Unable to read checklist progress.",
                error
            );

            return {};

        }

    },

    //--------------------------------------------------
    // Save All Checklist Progress
    //--------------------------------------------------

    saveChecklistStorage(storage) {

        try {

            localStorage.setItem(

                this.CHECKLIST_STORAGE_KEY,
                JSON.stringify(storage)

            );

        }

        catch (error) {

            console.error(
                "Unable to save checklist progress.",
                error
            );

        }

    },

    //--------------------------------------------------
    // Get Progress for Member and Adventure
    //--------------------------------------------------

    getSavedChecklistProgress(
        memberId,
        adventureId
    ) {

        const storage =
            this.getChecklistStorage();

        return (
            storage[memberId] &&
            storage[memberId][adventureId]
        )
            ? storage[memberId][adventureId]
            : {};

    },

    //--------------------------------------------------
    // Save One Checklist Item
    //--------------------------------------------------

    saveChecklistItemProgress(
        memberId,
        adventureId,
        itemKey,
        isCompleted
    ) {

        if (
            !memberId ||
            !adventureId ||
            !itemKey
        ) {

            return;

        }

        const storage =
            this.getChecklistStorage();

        if (!storage[memberId]) {

            storage[memberId] = {};

        }

        if (!storage[memberId][adventureId]) {

            storage[memberId][adventureId] = {};

        }

        if (isCompleted) {

            storage[memberId][adventureId][itemKey] =
                true;

        } else {

            delete storage[memberId][adventureId][itemKey];

        }

        this.saveChecklistStorage(storage);

    },

    //--------------------------------------------------
    // Refresh Checklist Count and Progress Bar
    //--------------------------------------------------

    refreshChecklistProgress() {

        const checklistContainer =
            document.getElementById(
                "drawerChecklist"
            );

        if (!checklistContainer) return;

        const checkboxes =
            Array.from(
                checklistContainer.querySelectorAll(
                    ".drawer-checklist-checkbox"
                )
            );

        const completedCount =
            checkboxes.filter(
                (checkbox) => checkbox.checked
            ).length;

        this.updateChecklistDisplay(

            completedCount,
            checkboxes.length

        );

    },

    //--------------------------------------------------
    // Update Checklist Count and Progress Bar
    //--------------------------------------------------

    updateChecklistDisplay(
        completedCount,
        totalCount
    ) {

        const count =
            document.getElementById(
                "drawerChecklistCount"
            );

        const progressFill =
            document.getElementById(
                "drawerChecklistProgress"
            );

        const progressBar =
            progressFill
                ? progressFill.parentElement
                : null;

        const percentage =
            totalCount > 0
                ? Math.round(
                    (
                        completedCount /
                        totalCount
                    ) * 100
                )
                : 0;

        if (count) {

            count.textContent =
                `${completedCount} of ${totalCount}`;

        }

        if (progressFill) {

            progressFill.style.width =
                `${percentage}%`;

        }

        if (progressBar) {

            progressBar.setAttribute(
                "aria-valuenow",
                String(percentage)
            );

        }

    },

    //--------------------------------------------------
    // Adventure Photos
    //--------------------------------------------------
        async loadAdventurePhotos(adventure) {

        const photoSection =
            document.getElementById("drawerPhotos");

        const heroButton =
            document.getElementById("drawerHeroButton");

        const heroImage =
            document.getElementById("drawerHeroImage");

        const galleryHeader =
            document.getElementById("drawerGalleryHeader");

        const gallery =
            document.getElementById("drawerGallery");

        const photoCount =
            document.getElementById("drawerPhotoCount");

        if (
            !photoSection ||
            !heroButton ||
            !heroImage ||
            !galleryHeader ||
            !gallery ||
            !photoCount
        ) {

            return;

        }

        //--------------------------------------------------
        // Reset Previous Adventure
        //--------------------------------------------------

        photoSection.hidden = true;
        galleryHeader.hidden = true;
        gallery.hidden = true;

        heroImage.src = "";
        heroImage.alt = "";

        heroButton.onclick = null;

        gallery.innerHTML = "";

        photoCount.textContent = "";

        const adventureID =
            String(adventure["ID"] || "").trim();

        if (!adventureID) return;

        //--------------------------------------------------
        // Find Available Photos
        //--------------------------------------------------

        const photoCandidates =
            this.getPhotoCandidates(adventure);

        const validPhotos = [];

        for (const candidateGroup of photoCandidates) {

            const validPhoto =
                await this.findFirstValidImage(
                    candidateGroup
                );

            if (validPhoto) {

                validPhotos.push(validPhoto);

            }

        }

        //--------------------------------------------------
        // Prevent Stale Drawer Updates
        //--------------------------------------------------

        if (
            !this.currentAdventure ||
            this.currentAdventure["ID"] !==
                adventure["ID"]
        ) {

            return;

        }

        const uniquePhotos =
            [...new Set(validPhotos)];

        //--------------------------------------------------
        // Default Hero Fallback
        //--------------------------------------------------

        if (uniquePhotos.length === 0) {

            const defaultHeroExists =
                await this.imageExists(
                    this.DEFAULT_HERO_IMAGE
                );

            if (!defaultHeroExists) {

                return;

            }

            uniquePhotos.push(
                this.DEFAULT_HERO_IMAGE
            );

        }

        //--------------------------------------------------
        // Hero Image
        //--------------------------------------------------

        const heroPhoto =
            uniquePhotos[0];

        heroImage.src =
            heroPhoto;

        heroImage.alt =
            `${adventure.Title || "Adventure"} photo`;

        heroButton.onclick = () => {

            window.open(
                heroImage.src,
                "_blank",
                "noopener,noreferrer"
            );

        };

        photoSection.hidden = false;

        //--------------------------------------------------
        // Gallery
        //--------------------------------------------------

        if (uniquePhotos.length > 1) {

            galleryHeader.hidden = false;
            gallery.hidden = false;

            photoCount.textContent =
                `${uniquePhotos.length} Photos`;

            uniquePhotos.forEach(
                (photoSource, index) => {

                    const thumbnailButton =
                        document.createElement("button");

                    thumbnailButton.type =
                        "button";

                    thumbnailButton.className =
                        "drawer-gallery-item";

                    thumbnailButton.setAttribute(
                        "aria-label",
                        `View adventure photo ${index + 1}`
                    );

                    const thumbnail =
                        document.createElement("img");

                    thumbnail.src =
                        photoSource;

                    thumbnail.alt =
                        `${adventure.Title || "Adventure"} photo ${index + 1}`;

                    thumbnail.loading =
                        "lazy";

                    thumbnailButton.appendChild(
                        thumbnail
                    );

                    thumbnailButton.onclick = () => {

                        heroImage.src =
                            photoSource;

                        heroImage.alt =
                            thumbnail.alt;

                        heroImage.scrollIntoView({

                            behavior: "smooth",
                            block: "nearest"

                        });

                    };

                    gallery.appendChild(
                        thumbnailButton
                    );

                }
            );

        } else {

            photoCount.textContent =
                "1 Photo";

        }

    },

    //--------------------------------------------------
    // Build Photo Candidate Paths
    //--------------------------------------------------

    getPhotoCandidates(adventure) {

        const adventureID =
            String(adventure["ID"] || "").trim();

        const heroField =
            adventure["Hero Image"] ||
            adventure["HeroImage"] ||
            adventure["Adventure Hero"] ||
            "";

        const galleryField =
            adventure["Gallery"] ||
            adventure["Adventure Photos"] ||
            adventure["Photos"] ||
            "";

        const candidateGroups = [];

        //--------------------------------------------------
        // Explicit Hero Image
        //--------------------------------------------------

        const explicitHeroImages =
            this.parsePhotoField(heroField);

        if (explicitHeroImages.length > 0) {

            candidateGroups.push(
                explicitHeroImages
            );

        }

        //--------------------------------------------------
        // Conventional Hero Image
        //--------------------------------------------------

        candidateGroups.push([

            `assets/images/adventures/${adventureID}/hero.webp`,
            `assets/images/adventures/${adventureID}/hero.png`,
            `assets/images/adventures/${adventureID}/hero.jpg`,
            `assets/images/adventures/${adventureID}/hero.jpeg`,

            `assets/images/adventures/${adventureID}-hero.webp`,
            `assets/images/adventures/${adventureID}-hero.png`,
            `assets/images/adventures/${adventureID}-hero.jpg`,
            `assets/images/adventures/${adventureID}-hero.jpeg`

        ]);

        //--------------------------------------------------
        // Explicit Gallery Images
        //--------------------------------------------------

        const explicitGalleryImages =
            this.parsePhotoField(galleryField);

        explicitGalleryImages.forEach(
            (photoSource) => {

                candidateGroups.push([
                    photoSource
                ]);

            }
        );

        //--------------------------------------------------
        // Conventional Gallery Images
        //--------------------------------------------------

        for (
            let imageNumber = 1;
            imageNumber <= this.MAX_GALLERY_IMAGES;
            imageNumber += 1
        ) {

            const paddedNumber =
                String(imageNumber).padStart(2, "0");

            candidateGroups.push([

                `assets/images/adventures/${adventureID}/${paddedNumber}.webp`,
                `assets/images/adventures/${adventureID}/${paddedNumber}.png`,
                `assets/images/adventures/${adventureID}/${paddedNumber}.jpg`,
                `assets/images/adventures/${adventureID}/${paddedNumber}.jpeg`,

                `assets/images/adventures/${adventureID}-${paddedNumber}.webp`,
                `assets/images/adventures/${adventureID}-${paddedNumber}.png`,
                `assets/images/adventures/${adventureID}-${paddedNumber}.jpg`,
                `assets/images/adventures/${adventureID}-${paddedNumber}.jpeg`

            ]);

        }

        return candidateGroups;

    },
        //--------------------------------------------------
    // Parse Photo Field
    //--------------------------------------------------

    parsePhotoField(value) {

        return String(value || "")
            .split(/\r?\n|,|;|\|/)
            .map((item) => item.trim())
            .filter(Boolean);

    },

    //--------------------------------------------------
    // Find First Existing Image
    //--------------------------------------------------

    async findFirstValidImage(candidates) {

        for (const source of candidates) {

            const exists =
                await this.imageExists(source);

            if (exists) {

                return source;

            }

        }

        return null;

    },

    //--------------------------------------------------
    // Test Image Path
    //--------------------------------------------------

    imageExists(source) {

        return new Promise((resolve) => {

            if (!source) {

                resolve(false);
                return;

            }

            const image =
                new Image();

            image.onload = () => {

                resolve(true);

            };

            image.onerror = () => {

                resolve(false);

            };

            image.src =
                source;

        });

    },

    //--------------------------------------------------
    // Close Drawer
    //--------------------------------------------------

    close() {

        this.currentAdventure = null;
        this.currentMemberId = null;

        const overlay =
            document.getElementById("drawerOverlay");

        if (overlay) {

            overlay.classList.remove("open");

        }

    }

};