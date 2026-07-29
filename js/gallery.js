// ======================================
// WAC Member Gallery
// Version 1.0
// ======================================

(async function initializeGalleryPage() {

    const openUploadButton =
        document.getElementById(
            "openGalleryUpload"
        );

    const closeUploadButton =
        document.getElementById(
            "closeGalleryUpload"
        );

    const uploadPanel =
        document.getElementById(
            "galleryUploadPanel"
        );

    const uploadForm =
        document.getElementById(
            "galleryUploadForm"
        );

    const photoInput =
        document.getElementById(
            "galleryPhotoInput"
        );

    const previewWrap =
        document.getElementById(
            "galleryPhotoPreviewWrap"
        );

    const previewImage =
        document.getElementById(
            "galleryPhotoPreview"
        );

    const captionInput =
        document.getElementById(
            "galleryCaption"
        );

    const captionCount =
        document.getElementById(
            "galleryCaptionCount"
        );

    const dateTakenInput =
        document.getElementById(
            "galleryDateTaken"
        );

    const relatedTypeInput =
        document.getElementById(
            "galleryRelatedType"
        );

    const relatedIdField =
        document.getElementById(
            "galleryRelatedIdField"
        );

    const relatedIdInput =
        document.getElementById(
            "galleryRelatedId"
        );

    const uploadMessage =
        document.getElementById(
            "galleryUploadMessage"
        );

    const submitButton =
        document.getElementById(
            "submitGalleryPhoto"
        );

    const galleryLoading =
        document.getElementById(
            "galleryLoading"
        );

    const galleryEmpty =
        document.getElementById(
            "galleryEmpty"
        );

    const galleryGrid =
        document.getElementById(
            "galleryGrid"
        );

    const lightbox =
        document.getElementById(
            "galleryLightbox"
        );

    const lightboxImage =
        document.getElementById(
            "galleryLightboxImage"
        );

    const lightboxCaption =
        document.getElementById(
            "galleryLightboxCaption"
        );

    const lightboxMeta =
        document.getElementById(
            "galleryLightboxMeta"
        );

    const closeLightboxButton =
        document.getElementById(
            "closeGalleryLightbox"
        );

    let selectedPhotoFile =
        null;

    let previewObjectUrl =
        "";

    //--------------------------------------------------
    // Upload Panel
    //--------------------------------------------------

    if (openUploadButton) {

        openUploadButton.addEventListener(
            "click",
            () => {

                if (
                    typeof AuthService === "undefined" ||
                    !AuthService.isSignedIn()
                ) {

                    alert(
                        "Please sign in before uploading a gallery photo."
                    );

                    return;

                }

                uploadPanel.hidden =
                    false;

                uploadPanel.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    }

    if (closeUploadButton) {

        closeUploadButton.addEventListener(
            "click",
            () => {

                resetUploadForm();

                uploadPanel.hidden =
                    true;

            }
        );

    }

    //--------------------------------------------------
    // Photo Selection and Preview
    //--------------------------------------------------

    if (photoInput) {

        photoInput.addEventListener(
            "change",
            () => {

                clearUploadMessage();

                selectedPhotoFile =
                    photoInput.files &&
                    photoInput.files.length
                        ? photoInput.files[0]
                        : null;

                if (!selectedPhotoFile) {

                    clearPhotoPreview();

                    return;

                }

                const allowedTypes = [

                    "image/jpeg",
                    "image/png",
                    "image/webp"

                ];

                if (
                    !allowedTypes.includes(
                        selectedPhotoFile.type
                    )
                ) {

                    selectedPhotoFile =
                        null;

                    photoInput.value =
                        "";

                    clearPhotoPreview();

                    showUploadMessage(
                        "Only JPEG, PNG, and WebP photos may be uploaded.",
                        "error"
                    );

                    return;

                }

                if (previewObjectUrl) {

                    URL.revokeObjectURL(
                        previewObjectUrl
                    );

                }

                previewObjectUrl =
                    URL.createObjectURL(
                        selectedPhotoFile
                    );

                previewImage.src =
                    previewObjectUrl;

                previewWrap.hidden =
                    false;

            }
        );

    }

    //--------------------------------------------------
    // Caption Counter
    //--------------------------------------------------

    if (captionInput) {

        captionInput.addEventListener(
            "input",
            () => {

                captionCount.textContent =
                    String(
                        captionInput.value.length
                    );

            }
        );

    }

    //--------------------------------------------------
    // Related Adventure or Event
    //--------------------------------------------------

    if (relatedTypeInput) {

        relatedTypeInput.addEventListener(
            "change",
            () => {

                const hasRelatedType =
                    Boolean(
                        relatedTypeInput.value
                    );

                relatedIdField.hidden =
                    !hasRelatedType;

                if (!hasRelatedType) {

                    relatedIdInput.value =
                        "";

                }

            }
        );

    }

    //--------------------------------------------------
    // Upload Submission
    //--------------------------------------------------

    if (uploadForm) {

        uploadForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                clearUploadMessage();

                if (
                    typeof AuthService === "undefined" ||
                    !AuthService.isSignedIn()
                ) {

                    showUploadMessage(
                        "Please sign in before uploading a gallery photo.",
                        "error"
                    );

                    return;

                }

                if (!selectedPhotoFile) {

                    showUploadMessage(
                        "Please select a photo.",
                        "error"
                    );

                    return;

                }

                const caption =
                    String(
                        captionInput.value || ""
                    ).trim();

                if (caption.length < 10) {

                    showUploadMessage(
                        "Please provide a slightly more detailed photo caption.",
                        "error"
                    );

                    captionInput.focus();

                    return;

                }

                if (caption.length > 1000) {

                    showUploadMessage(
                        "Photo captions cannot exceed 1,000 characters.",
                        "error"
                    );

                    captionInput.focus();

                    return;

                }

                setUploadLoading(
                    true
                );

                try {

                    showUploadMessage(
                        "Preparing and compressing your photo...",
                        "working"
                    );

                    const preparedPhoto =
                        await prepareGalleryPhoto(
                            selectedPhotoFile
                        );

                    showUploadMessage(
                        "Uploading your photo to the WAC gallery...",
                        "working"
                    );

                    const result =
    await API
        .uploadGalleryPhoto({

            fileName:
                preparedPhoto.fileName,

            mimeType:
                preparedPhoto.mimeType,

            base64Data:
                preparedPhoto.base64Data,

            caption,

            relatedType:
                relatedTypeInput.value,

            relatedId:
                relatedIdInput.value,

            dateTaken:
                dateTakenInput.value

        });

showUploadMessage(
    result.message ||
    "Your photo was submitted for administrator approval.",
    "success"
);

uploadForm.reset();

selectedPhotoFile =
    null;

captionCount.textContent =
    "0";

relatedIdField.hidden =
    true;

clearPhotoPreview();

}

catch (error) {

    console.error(
        "Gallery upload error:",
        error
    );

    showUploadMessage(
        error &&
        error.message
            ? error.message
            : "The photo could not be uploaded.",
        "error"
    );

}

finally {

    setUploadLoading(
        false
    );

}

}
);

}

    //--------------------------------------------------
    // Lightbox
    //--------------------------------------------------

    if (closeLightboxButton) {

        closeLightboxButton.addEventListener(
            "click",
            closeGalleryLightbox
        );

    }

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    lightbox
                ) {

                    closeGalleryLightbox();

                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                lightbox &&
                !lightbox.hidden
            ) {

                closeGalleryLightbox();

            }

        }
    );

    //--------------------------------------------------
    // Load Approved Gallery
    //--------------------------------------------------

    await loadApprovedGallery();

    //--------------------------------------------------
    // Load Gallery Photos
    //--------------------------------------------------

    async function loadApprovedGallery() {

        galleryLoading.hidden =
            false;

        galleryEmpty.hidden =
            true;

        galleryGrid.hidden =
            true;

        try {

            if (
                !Database ||
                typeof Database.getGalleryPhotos !==
                    "function"
            ) {

                galleryLoading.textContent =
                    "The gallery service is being prepared.";

                return;

            }

            const photos =
                await Database
                    .getGalleryPhotos();

            renderGalleryPhotos(
                Array.isArray(photos)
                    ? photos
                    : []
            );

        }

        catch (error) {

            console.error(
                "Gallery loading error:",
                error
            );

            galleryLoading.textContent =
                "The gallery photos could not be loaded.";

        }

    }

    //--------------------------------------------------
    // Render Gallery
    //--------------------------------------------------

    function renderGalleryPhotos(
        photos
    ) {

        galleryLoading.hidden =
            true;

        galleryGrid.innerHTML =
            "";

        if (!photos.length) {

            galleryEmpty.hidden =
                false;

            galleryGrid.hidden =
                true;

            return;

        }

        galleryEmpty.hidden =
            true;

        photos.forEach(
            (photo) => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "gallery-card";

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "gallery-card-button";

                const image =
                    document.createElement(
                        "img"
                    );

                image.className =
                    "gallery-card-image";

                image.src =
                    photo.thumbnailUrl ||
                    photo.imageUrl ||
                    "";

                image.alt =
                    photo.caption ||
                    "WAC gallery photo";

                image.loading =
                    "lazy";

                const details =
                    document.createElement(
                        "div"
                    );

                details.className =
                    "gallery-card-details";

                const caption =
                    document.createElement(
                        "p"
                    );

                caption.className =
                    "gallery-card-caption";

                caption.textContent =
                    photo.caption ||
                    "";

                const meta =
                    document.createElement(
                        "p"
                    );

                meta.className =
                    "gallery-card-meta";

                meta.textContent =
                    buildPhotoMeta(
                        photo
                    );

                details.append(
                    caption,
                    meta
                );

                button.append(
                    image,
                    details
                );

                button.addEventListener(
                    "click",
                    () => {

                        openGalleryLightbox(
                            photo
                        );

                    }
                );

                card.appendChild(
                    button
                );

                galleryGrid.appendChild(
                    card
                );

            }
        );

        galleryGrid.hidden =
            false;

    }

    //--------------------------------------------------
// Open Lightbox
//--------------------------------------------------

function openGalleryLightbox(
    photo
) {

    const thumbnailUrl =
        String(
            photo.thumbnailUrl || ""
        ).trim();

    const largeThumbnailUrl =
        thumbnailUrl
            ? thumbnailUrl.replace(
                /([?&])sz=w\d+/i,
                "$1sz=w2000"
            )
            : "";

    lightboxImage.src =
        largeThumbnailUrl ||
        thumbnailUrl ||
        photo.imageUrl ||
        "";

    lightboxImage.alt =
        photo.caption ||
        "WAC gallery photo";

    lightboxCaption.textContent =
        photo.caption ||
        "";

    lightboxMeta.textContent =
        buildPhotoMeta(
            photo
        );

    lightbox.hidden =
        false;

    document.body.classList.add(
        "gallery-lightbox-open"
    );

}

//--------------------------------------------------
// Close Lightbox
//--------------------------------------------------

function closeGalleryLightbox() {

    if (!lightbox) return;

    lightbox.hidden =
        true;

    lightboxImage.src =
        "";

    document.body.classList.remove(
        "gallery-lightbox-open"
    );

}

//--------------------------------------------------
// Build Photo Metadata
//--------------------------------------------------

function buildPhotoMeta(
    photo
) {

    const parts =
        [];

    if (photo.memberName) {

        parts.push(
            photo.memberName
        );

    }

    if (photo.dateTaken) {

        parts.push(
            formatGalleryDate(
                photo.dateTaken
            )
        );

    }

    if (
        photo.relatedType &&
        photo.relatedId
    ) {

        parts.push(
            photo.relatedType +
            ": " +
            photo.relatedId
        );

    }

    return parts.join(
        " • "
    );

}

    //--------------------------------------------------
    // Format Gallery Date
    //--------------------------------------------------

    function formatGalleryDate(
        value
    ) {

        const cleanValue =
            String(
                value || ""
            ).trim();

        if (!cleanValue) {

            return "";

        }

        const date =
            new Date(
                cleanValue +
                (
                    /^\d{4}-\d{2}-\d{2}$/.test(
                        cleanValue
                    )
                        ? "T12:00:00"
                        : ""
                )
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return cleanValue;

        }

        return date.toLocaleDateString(
            undefined,
            {

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }
        );

    }

    //--------------------------------------------------
    // Prepare and Compress Photo
    //--------------------------------------------------

    async function prepareGalleryPhoto(
        file
    ) {

        const image =
            await loadImageFile(
                file
            );

        const maximumDimension =
            1800;

        let targetWidth =
            image.naturalWidth ||
            image.width;

        let targetHeight =
            image.naturalHeight ||
            image.height;

        if (
            targetWidth >
                maximumDimension ||
            targetHeight >
                maximumDimension
        ) {

            const scale =
                Math.min(

                    maximumDimension /
                        targetWidth,

                    maximumDimension /
                        targetHeight

                );

            targetWidth =
                Math.round(
                    targetWidth *
                    scale
                );

            targetHeight =
                Math.round(
                    targetHeight *
                    scale
                );

        }

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            targetWidth;

        canvas.height =
            targetHeight;

        const context =
            canvas.getContext(
                "2d"
            );

        if (!context) {

            throw new Error(
                "This browser could not prepare the selected photo."
            );

        }

        context.drawImage(
            image,
            0,
            0,
            targetWidth,
            targetHeight
        );

        let quality =
            0.86;

        let blob =
            await canvasToBlob(
                canvas,
                "image/jpeg",
                quality
            );

        while (
            blob.size >
                1.8 * 1024 * 1024 &&
            quality >
                0.5
        ) {

            quality -=
                0.08;

            blob =
                await canvasToBlob(
                    canvas,
                    "image/jpeg",
                    quality
                );

        }

        if (
            blob.size >
            2 * 1024 * 1024
        ) {

            throw new Error(
                "The selected photo is still too large after compression. Please choose a smaller image."
            );

        }

        const base64Data =
            await blobToBase64(
                blob
            );

        const safeBaseName =
            String(
                file.name ||
                "wac-gallery-photo"
            )
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9_-]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )
                .slice(
                    0,
                    80
                ) ||
            "wac-gallery-photo";

        return {

            fileName:
                safeBaseName +
                ".jpg",

            mimeType:
                "image/jpeg",

            base64Data

        };

    }

    //--------------------------------------------------
    // Load Selected Image
    //--------------------------------------------------

    function loadImageFile(
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
                                "The selected photo could not be opened."
                            )
                        );

                    };

                image.src =
                    objectUrl;

            }
        );

    }

    //--------------------------------------------------
    // Convert Canvas to Blob
    //--------------------------------------------------

    function canvasToBlob(
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
                    (blob) => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "The selected photo could not be compressed."
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

    }

    //--------------------------------------------------
    // Convert Blob to Base64
    //--------------------------------------------------

    function blobToBase64(
        blob
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
                                reader.result || ""
                            );

                        const commaIndex =
                            result.indexOf(
                                ","
                            );

                        if (
                            commaIndex === -1
                        ) {

                            reject(
                                new Error(
                                    "The selected photo could not be encoded."
                                )
                            );

                            return;

                        }

                        resolve(
                            result.slice(
                                commaIndex + 1
                            )
                        );

                    };

                reader.onerror =
                    () => {

                        reject(
                            new Error(
                                "The selected photo could not be read."
                            )
                        );

                    };

                reader.readAsDataURL(
                    blob
                );

            }
        );

    }

    //--------------------------------------------------
    // Upload Loading State
    //--------------------------------------------------

    function setUploadLoading(
        isLoading
    ) {

        submitButton.disabled =
            isLoading;

        photoInput.disabled =
            isLoading;

        captionInput.disabled =
            isLoading;

        dateTakenInput.disabled =
            isLoading;

        relatedTypeInput.disabled =
            isLoading;

        relatedIdInput.disabled =
            isLoading;

        closeUploadButton.disabled =
            isLoading;

        submitButton.textContent =
            isLoading
                ? "Uploading Photo..."
                : "Submit Photo for Approval";

    }

    //--------------------------------------------------
    // Upload Messages
    //--------------------------------------------------

    function showUploadMessage(
        message,
        type
    ) {

        uploadMessage.textContent =
            message;

        uploadMessage.className =
            "form-message gallery-upload-message";

        if (type) {

            uploadMessage.classList.add(
                `gallery-upload-message-${type}`
            );

        }

    }

    function clearUploadMessage() {

        uploadMessage.textContent =
            "";

        uploadMessage.className =
            "form-message";

    }

    //--------------------------------------------------
    // Reset Upload Form
    //--------------------------------------------------

    function resetUploadForm() {

        uploadForm.reset();

        selectedPhotoFile =
            null;

        captionCount.textContent =
            "0";

        relatedIdField.hidden =
            true;

        clearPhotoPreview();

        clearUploadMessage();

    }

    //--------------------------------------------------
    // Clear Photo Preview
    //--------------------------------------------------

    function clearPhotoPreview() {

        if (previewObjectUrl) {

            URL.revokeObjectURL(
                previewObjectUrl
            );

            previewObjectUrl =
                "";

        }

        previewImage.removeAttribute(
            "src"
        );

        previewWrap.hidden =
            true;

    }

})();