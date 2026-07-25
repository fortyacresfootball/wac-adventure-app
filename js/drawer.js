// ======================================
// WAC Adventure Drawer
// Version 6.1
// ======================================

const Drawer = {

    currentAdventure: null,

    MAX_GALLERY_IMAGES: 6,

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
        // Complete Adventure
        //--------------------------------------------------

        const completeButton =
            document.getElementById("completeAdventure");

        if (completeButton) {

            completeButton.onclick = async () => {

                const completedAdventure =
                    this.currentAdventure;

                if (!completedAdventure) return;

                const member =
                    window.WAC.selectedMember ||
                    (await Database.getMembers())[0];

                const result =
                    await API.completeAdventure(

                        member["Member ID"],
                        completedAdventure["ID"]

                    );

                if (!result.success) {

                    alert(
                        result.message ||
                        result.error ||
                        "Unable to complete adventure."
                    );

                    return;

                }

                await MemberState.load(
                    member["Member ID"]
                );

                const stats =
                    await ProgressEngine.getMemberStats(
                        member["Member ID"]
                    );

                this.close();

                SuccessModal.open({

                    title:
                        completedAdventure.Title,

                    message:
                        "Adventure successfully completed!",

                    points:
                        Number(
                            completedAdventure["Points"] || 100
                        ),

                    rank:
                        stats.rank

                });

                if (typeof WACRouter !== "undefined") {

                    await WACRouter.loadPage(

                        WACRouter.currentPage,

                        false

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
            window.WAC.selectedMember ||
            (await Database.getMembers())[0];

        await MemberState.load(
            member["Member ID"]
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
        // Completion Status
        //--------------------------------------------------

        const completed =
            MemberState.isCompleted(
                adventure["ID"]
            );

        const button =
            document.getElementById(
                "completeAdventure"
            );

        if (completed) {

            set(
                "drawerStatus",
                "Completed ✓"
            );

            if (button) {

                button.textContent =
                    "Completed ✓";

                button.disabled = true;

                button.classList.add(
                    "button-disabled"
                );

            }

        } else {

            set(
                "drawerStatus",
                "Available"
            );

            if (button) {

                button.textContent =
                    "Complete Adventure";

                button.disabled = false;

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
            this.currentAdventure["ID"] !== adventure["ID"]
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

        const overlay =
            document.getElementById("drawerOverlay");

        if (overlay) {

            overlay.classList.remove("open");

        }

    }

};