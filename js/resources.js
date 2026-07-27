// ======================================
// WAC Resource Center
// Version 1.0
// ======================================

(async function () {

    const state = {

        resources: [],

        activeCategory: "all",

        searchTerm: ""

    };

    try {

        //--------------------------------------------------
        // Load Resources
        //--------------------------------------------------

        const resourceData =
            await Database.getResources();

        state.resources =
            normalizeResources(
                Array.isArray(resourceData)
                    ? resourceData
                    : []
            )
                .filter(
                    (resource) =>
                        resource.active
                )
                .sort(
                    sortResources
                );

        //--------------------------------------------------
        // Initialize Page
        //--------------------------------------------------

        renderResourceStatistics(
            state.resources
        );

        renderResourceFilters(
            state
        );

        renderFeaturedResources(
            state.resources
        );

        renderResourceLibrary(
            state
        );

        initializeResourceControls(
            state
        );

    }

    catch (error) {

        console.error(
            "Resources Page Error:",
            error
        );

        showResourceLoadError();

    }

})();

//--------------------------------------------------
// Normalize Resource Records
//--------------------------------------------------

function normalizeResources(
    resources
) {

    return resources.map(
        (resource) => {

            return {

                id:
                    cleanResourceText(
                        resource["Resource ID"]
                    ),

                title:
                    cleanResourceText(
                        resource["Title"]
                    ) ||
                    "Untitled Resource",

                description:
                    cleanResourceText(
                        resource["Description"]
                    ),

                category:
                    cleanResourceText(
                        resource["Category"]
                    ) ||
                    "Other",

                type:
                    cleanResourceText(
                        resource["Resource Type"]
                    ) ||
                    "Resource",

                fileUrl:
                    cleanResourceText(
                        resource["File URL"]
                    ),

                thumbnail:
                    cleanResourceText(
                        resource["Thumbnail"]
                    ),

                tags:
                    cleanResourceText(
                        resource["Tags"]
                    ),

                featured:
                    parseResourceBoolean(
                        resource["Featured"]
                    ),

                active:
                    parseResourceBoolean(
                        resource["Active"],
                        true
                    ),

                sortOrder:
                    parseResourceNumber(
                        resource["Sort Order"],
                        9999
                    ),

                updatedDate:
                    parseResourceDate(
                        resource["Updated Date"]
                    ),

                version:
                    cleanResourceText(
                        resource["Version"]
                    ),

                accessLevel:
                    cleanResourceText(
                        resource["Access Level"]
                    ) ||
                    "Member",

                original:
                    resource

            };

        }
    );

}

//--------------------------------------------------
// Resource Statistics
//--------------------------------------------------

function renderResourceStatistics(
    resources
) {

    setResourceText(
        "resourceTotal",
        resources.length
    );

    const categories =
        new Set(
            resources.map(
                (resource) =>
                    resource.category
                        .toLowerCase()
            )
        );

    setResourceText(
        "resourceCategoryTotal",
        categories.size
    );

    const datedResources =
        resources
            .filter(
                (resource) =>
                    resource.updatedDate
            )
            .sort(
                (firstResource, secondResource) =>
                    secondResource.updatedDate -
                    firstResource.updatedDate
            );

    const latestUpdate =
        datedResources.length > 0
            ? formatResourceDate(
                datedResources[0].updatedDate,
                {
                    month: "short",
                    year: "numeric"
                }
            )
            : "Not Set";

    setResourceText(
        "resourceLatestUpdate",
        latestUpdate
    );

}

//--------------------------------------------------
// Category Filters
//--------------------------------------------------

function renderResourceFilters(
    state
) {

    const container =
        document.getElementById(
            "resourceFilters"
        );

    if (!container) return;

    const categories =
        [...new Set(

            state.resources.map(
                (resource) =>
                    resource.category
            )

        )]
            .sort(
                (firstCategory, secondCategory) =>
                    firstCategory.localeCompare(
                        secondCategory
                    )
            );

    container.innerHTML = "";

    container.appendChild(
        createResourceFilterButton(
            "All",
            "all",
            state
        )
    );

    categories.forEach(
        (category) => {

            container.appendChild(
                createResourceFilterButton(
                    category,
                    category,
                    state
                )
            );

        }
    );

}

//--------------------------------------------------
// Create Filter Button
//--------------------------------------------------

function createResourceFilterButton(
    label,
    category,
    state
) {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "resources-filter";

    button.dataset.resourceCategory =
        category;

    button.textContent =
        label;

    if (
        category.toLowerCase() ===
        state.activeCategory.toLowerCase()
    ) {

        button.classList.add(
            "active"
        );

    }

    button.addEventListener(
        "click",
        () => {

            state.activeCategory =
                category;

            updateActiveResourceFilter(
                category
            );

            renderResourceLibrary(
                state
            );

        }
    );

    return button;

}

//--------------------------------------------------
// Active Filter Display
//--------------------------------------------------

function updateActiveResourceFilter(
    category
) {

    document
        .querySelectorAll(
            ".resources-filter"
        )
        .forEach(
            (button) => {

                const buttonCategory =
                    button.dataset
                        .resourceCategory ||
                    "";

                button.classList.toggle(

                    "active",

                    buttonCategory
                        .toLowerCase() ===
                    category
                        .toLowerCase()

                );

            }
        );

}

//--------------------------------------------------
// Featured Resources
//--------------------------------------------------

function renderFeaturedResources(
    resources
) {

    const section =
        document.getElementById(
            "featuredResourcesSection"
        );

    const container =
        document.getElementById(
            "featuredResources"
        );

    const countElement =
        document.getElementById(
            "featuredResourceCount"
        );

    if (
        !section ||
        !container
    ) {

        return;

    }

    const featuredResources =
        resources
            .filter(
                (resource) =>
                    resource.featured
            )
            .slice(0, 4);

    if (
        featuredResources.length === 0
    ) {

        section.hidden = true;
        return;

    }

    if (countElement) {

        countElement.textContent =
            featuredResources.length === 1
                ? "1 Featured"
                : `${featuredResources.length} Featured`;

    }

    container.innerHTML = "";

    featuredResources.forEach(
        (resource) => {

            container.appendChild(
                createFeaturedResourceCard(
                    resource
                )
            );

        }
    );

    section.hidden = false;

}

//--------------------------------------------------
// Featured Resource Card
//--------------------------------------------------

function createFeaturedResourceCard(
    resource
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "resources-featured-card";

    if (
        resource.category
            .toLowerCase() ===
        "safety"
    ) {

        card.classList.add(
            "resources-featured-card-safety"
        );

    }

    const icon =
        document.createElement(
            "div"
        );

    icon.className =
        "resources-featured-icon";

    icon.textContent =
        getResourceIcon(
            resource
        );

    const category =
        document.createElement(
            "div"
        );

    category.className =
        "resources-card-category";

    category.textContent =
        resource.category;

    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        resource.title;

    const description =
        document.createElement(
            "p"
        );

    description.textContent =
        resource.description ||
        "Open this WAC resource for more information.";

    const action =
        createResourceAction(
            resource,
            true
        );

    card.append(
        icon,
        category,
        title,
        description,
        action
    );

    return card;

}

//--------------------------------------------------
// Complete Resource Library
//--------------------------------------------------

function renderResourceLibrary(
    state
) {

    const container =
        document.getElementById(
            "resourceGrid"
        );

    const emptyState =
        document.getElementById(
            "resourceEmptyState"
        );

    const countElement =
        document.getElementById(
            "visibleResourceCount"
        );

    if (
        !container ||
        !emptyState
    ) {

        return;

    }

    const visibleResources =
        filterResources(
            state.resources,
            state.activeCategory,
            state.searchTerm
        );

    if (countElement) {

        countElement.textContent =
            visibleResources.length === 1
                ? "1 Resource"
                : `${visibleResources.length} Resources`;

    }

    container.innerHTML = "";

    if (
        visibleResources.length === 0
    ) {

        container.hidden = true;
        emptyState.hidden = false;
        return;

    }

    visibleResources.forEach(
        (resource) => {

            container.appendChild(
                createResourceLibraryCard(
                    resource
                )
            );

        }
    );

    container.hidden = false;
    emptyState.hidden = true;

}

//--------------------------------------------------
// Filter Resources
//--------------------------------------------------

function filterResources(
    resources,
    activeCategory,
    searchTerm
) {

    const normalizedCategory =
        cleanResourceText(
            activeCategory
        ).toLowerCase();

    const normalizedSearch =
        cleanResourceText(
            searchTerm
        ).toLowerCase();

    return resources.filter(
        (resource) => {

            const matchesCategory =
                normalizedCategory === "all" ||
                resource.category
                    .toLowerCase() ===
                normalizedCategory;

            if (!matchesCategory) {

                return false;

            }

            if (!normalizedSearch) {

                return true;

            }

            const searchableText = [

                resource.title,
                resource.description,
                resource.category,
                resource.type,
                resource.tags,
                resource.version,
                resource.accessLevel

            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch
            );

        }
    );

}

//--------------------------------------------------
// Resource Library Card
//--------------------------------------------------

function createResourceLibraryCard(
    resource
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "resources-library-card";

    const top =
        document.createElement(
            "div"
        );

    top.className =
        "resources-library-card-top";

    const icon =
        document.createElement(
            "div"
        );

    icon.className =
        "resources-library-icon";

    icon.textContent =
        getResourceIcon(
            resource
        );

    const heading =
        document.createElement(
            "div"
        );

    heading.className =
        "resources-library-heading";

    const category =
        document.createElement(
            "div"
        );

    category.className =
        "resources-card-category";

    category.textContent =
        resource.category;

    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        resource.title;

    heading.append(
        category,
        title
    );

    top.append(
        icon,
        heading
    );

    const description =
        document.createElement(
            "p"
        );

    description.className =
        "resources-library-description";

    description.textContent =
        resource.description ||
        "No resource description is currently available.";

    const meta =
        createResourceMetadata(
            resource
        );

    const footer =
        document.createElement(
            "div"
        );

    footer.className =
        "resources-library-footer";

    const access =
        document.createElement(
            "span"
        );

    access.className =
        "resources-access-label";

    access.textContent =
        resource.accessLevel;

    footer.append(
        access,
        createResourceAction(
            resource,
            false
        )
    );

    card.append(
        top,
        description,
        meta,
        footer
    );

    return card;

}

//--------------------------------------------------
// Resource Metadata
//--------------------------------------------------

function createResourceMetadata(
    resource
) {

    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "resources-card-meta";

    const type =
        document.createElement(
            "span"
        );

    type.textContent =
        resource.type;

    meta.appendChild(
        type
    );

    if (resource.version) {

        const version =
            document.createElement(
                "span"
            );

        version.textContent =
            `Version ${resource.version}`;

        meta.appendChild(
            version
        );

    }

    if (resource.updatedDate) {

        const updated =
            document.createElement(
                "span"
            );

        updated.textContent =
            `Updated ${formatResourceDate(
                resource.updatedDate,
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            )}`;

        meta.appendChild(
            updated
        );

    } else {

        const updated =
            document.createElement(
                "span"
            );

        updated.textContent =
            "Update date not set";

        meta.appendChild(
            updated
        );

    }

    return meta;

}

//--------------------------------------------------
// Resource Action
//--------------------------------------------------

function createResourceAction(
    resource,
    featured
) {

    const hasResource =
        Boolean(
            resource.fileUrl
        );

    const element =
        document.createElement(
            hasResource
                ? "a"
                : "button"
        );

    element.className =
        featured
            ? "resources-featured-action"
            : "resources-card-action";

    if (!hasResource) {

        element.type =
            "button";

        element.disabled =
            true;

        element.textContent =
            "Coming Soon";

        element.classList.add(
            "resources-action-disabled"
        );

        return element;

    }

    element.href =
        resource.fileUrl;

    element.textContent =
        getResourceActionLabel(
            resource
        );

    if (
        isInternalResourceRoute(
            resource.fileUrl
        )
    ) {

        const page =
            getInternalResourcePage(
                resource.fileUrl
            );

        element.href =
            "#";

        element.dataset.page =
            page;

        element.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                navigateToResourcePage(
                    page
                );

            }
        );

    } else {

        element.target =
            "_blank";

        element.rel =
            "noopener noreferrer";

    }

    return element;

}

//--------------------------------------------------
// Internal Page Navigation
//--------------------------------------------------

function navigateToResourcePage(
    page
) {

    const navigationLink =
        document.querySelector(
            `[data-page="${page}"]`
        );

    if (navigationLink) {

        navigationLink.click();
        return;

    }

    if (
        typeof Router !==
        "undefined" &&
        typeof Router.navigate ===
        "function"
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
// Search Controls
//--------------------------------------------------

function initializeResourceControls(
    state
) {

    const searchInput =
        document.getElementById(
            "resourceSearch"
        );

    const clearButton =
        document.getElementById(
            "resourceSearchClear"
        );

    const resetButton =
        document.getElementById(
            "resourceResetButton"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                state.searchTerm =
                    searchInput.value;

                if (clearButton) {

                    clearButton.hidden =
                        !state.searchTerm;

                }

                renderResourceLibrary(
                    state
                );

            }
        );

    }

    if (
        clearButton &&
        searchInput
    ) {

        clearButton.addEventListener(
            "click",
            () => {

                searchInput.value =
                    "";

                state.searchTerm =
                    "";

                clearButton.hidden =
                    true;

                searchInput.focus();

                renderResourceLibrary(
                    state
                );

            }
        );

    }

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                state.activeCategory =
                    "all";

                state.searchTerm =
                    "";

                if (searchInput) {

                    searchInput.value =
                        "";

                }

                if (clearButton) {

                    clearButton.hidden =
                        true;

                }

                updateActiveResourceFilter(
                    "all"
                );

                renderResourceLibrary(
                    state
                );

            }
        );

    }

}

//--------------------------------------------------
// Resource Icon
//--------------------------------------------------

function getResourceIcon(
    resource
) {

    const category =
        resource.category
            .toLowerCase();

    const type =
        resource.type
            .toLowerCase();

    if (
        resource.title
            .toLowerCase()
            .includes("emergency")
    ) {

        return "🩺";

    }

    if (
        type.includes("map") ||
        category === "property"
    ) {

        return "🗺️";

    }

    if (
        type.includes("checklist")
    ) {

        return "✅";

    }

    if (
        type.includes("video")
    ) {

        return "🎥";

    }

    if (
        type.includes("image")
    ) {

        return "🖼️";

    }

    if (
        category === "governance"
    ) {

        return "📜";

    }

    if (
        category === "safety"
    ) {

        return "🛡️";

    }

    if (
        category === "history"
    ) {

        return "🏕️";

    }

    if (
        category === "guides"
    ) {

        return "📖";

    }

    if (
        type.includes("pdf")
    ) {

        return "📄";

    }

    if (
        type.includes("link") ||
        type.includes("web")
    ) {

        return "🔗";

    }

    return "📚";

}

//--------------------------------------------------
// Resource Action Label
//--------------------------------------------------

function getResourceActionLabel(
    resource
) {

    const type =
        resource.type
            .toLowerCase();

    if (
        isInternalResourceRoute(
            resource.fileUrl
        )
    ) {

        return "Open in App";
    }

    if (type.includes("map")) {

        return "View Map";
    }

    if (type.includes("checklist")) {

        return "Open Checklist";
    }

    if (type.includes("video")) {

        return "Watch Video";
    }

    if (type.includes("pdf")) {

        return "View PDF";
    }

    return "Open Resource";

}

//--------------------------------------------------
// Internal Resource URL
//--------------------------------------------------

function isInternalResourceRoute(
    fileUrl
) {

    return /^#[a-z0-9_-]+$/i.test(
        fileUrl
    );

}

function getInternalResourcePage(
    fileUrl
) {

    return fileUrl.replace(
        /^#/,
        ""
    );

}

//--------------------------------------------------
// Resource Sorting
//--------------------------------------------------

function sortResources(
    firstResource,
    secondResource
) {

    if (
        firstResource.sortOrder !==
        secondResource.sortOrder
    ) {

        return (
            firstResource.sortOrder -
            secondResource.sortOrder
        );

    }

    return firstResource.title.localeCompare(
        secondResource.title
    );

}

//--------------------------------------------------
// Parsing Helpers
//--------------------------------------------------

function cleanResourceText(
    value
) {

    return String(
        value ?? ""
    ).trim();

}

function parseResourceBoolean(
    value,
    defaultValue = false
) {

    if (
        value === true ||
        value === 1
    ) {

        return true;

    }

    if (
        value === false ||
        value === 0
    ) {

        return false;

    }

    const normalized =
        cleanResourceText(
            value
        ).toLowerCase();

    if (
        [
            "true",
            "yes",
            "y",
            "1",
            "active"
        ].includes(
            normalized
        )
    ) {

        return true;

    }

    if (
        [
            "false",
            "no",
            "n",
            "0",
            "inactive"
        ].includes(
            normalized
        )
    ) {

        return false;

    }

    return defaultValue;

}

function parseResourceNumber(
    value,
    defaultValue
) {

    const number =
        Number(
            value
        );

    return Number.isFinite(
        number
    )
        ? number
        : defaultValue;

}

function parseResourceDate(
    value
) {

    const dateText =
        cleanResourceText(
            value
        );

    if (!dateText) {

        return null;

    }

    const slashDate =
        dateText.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (slashDate) {

        return new Date(

            Number(slashDate[3]),
            Number(slashDate[1]) - 1,
            Number(slashDate[2])

        );

    }

    const dashDate =
        dateText.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

    if (dashDate) {

        return new Date(

            Number(dashDate[1]),
            Number(dashDate[2]) - 1,
            Number(dashDate[3])

        );

    }

    const parsedDate =
        new Date(
            dateText
        );

    return Number.isNaN(
        parsedDate.getTime()
    )
        ? null
        : parsedDate;

}

//--------------------------------------------------
// Date Formatting
//--------------------------------------------------

function formatResourceDate(
    date,
    options
) {

    return date.toLocaleDateString(
        "en-US",
        options
    );

}

//--------------------------------------------------
// Text Helper
//--------------------------------------------------

function setResourceText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            String(
                value ?? ""
            );

    }

}

//--------------------------------------------------
// Error State
//--------------------------------------------------

function showResourceLoadError() {

    const featuredContainer =
        document.getElementById(
            "featuredResources"
        );

    const resourceContainer =
        document.getElementById(
            "resourceGrid"
        );

    const errorMarkup = `

        <div class="resources-loading-state resources-error-state">

            <div class="resources-loading-icon">
                ⚠️
            </div>

            <h3>
                Resource Library Unavailable
            </h3>

            <p>
                The WAC resource catalog could not be loaded.
            </p>

        </div>

    `;

    if (featuredContainer) {

        featuredContainer.innerHTML =
            errorMarkup;

    }

    if (resourceContainer) {

        resourceContainer.innerHTML =
            errorMarkup;

    }

}