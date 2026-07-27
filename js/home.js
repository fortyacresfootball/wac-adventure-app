// ======================================
// WAC Home Page
// Version 2.0
// ======================================

(async function () {

    try {

        await Promise.all([

            loadAdventureCount(),
            loadNextEvent()

        ]);

    }

    catch (error) {

        console.error(
            "Unable to load WAC dashboard.",
            error
        );

    }

})();

//--------------------------------------------------
// Adventure Count
//--------------------------------------------------

async function loadAdventureCount() {

    const count =
        document.getElementById(
            "homeAdventureCount"
        );

    if (!count) return;

    try {

        const adventures =
            await Database.getAdventures();

        count.textContent =
            `Browse all ${adventures.length} adventures.`;

    }

    catch (error) {

        console.error(
            "Unable to load adventure count.",
            error
        );

        count.textContent =
            "Browse WAC adventures.";

    }

}

//--------------------------------------------------
// Next Event
//--------------------------------------------------

async function loadNextEvent() {

    const icon =
        document.getElementById(
            "homeEventIcon"
        );

    const name =
        document.getElementById(
            "homeEventName"
        );

    const details =
        document.getElementById(
            "homeEventDetails"
        );

    const button =
        document.getElementById(
            "homeEventButton"
        );

    if (
        !icon ||
        !name ||
        !details
    ) {

        return;

    }

    try {

        const events =
            await Database.getEvents();

        const nextEvent =
            findNextEvent(events);

        if (!nextEvent) {

            showNoUpcomingEvent(
                icon,
                name,
                details,
                button
            );

            return;

        }

        icon.textContent =
            getEventIcon(
                nextEvent["Category"]
            );

        name.textContent =
            nextEvent["Event Name"] ||
            "Upcoming WAC Event";

        details.textContent =
            buildEventDetails(nextEvent);

        if (button) {

            button.hidden = false;

        }

    }

    catch (error) {

        console.error(
            "Unable to load the next event.",
            error
        );

        showNoUpcomingEvent(
            icon,
            name,
            details,
            button
        );

    }

}

//--------------------------------------------------
// Find Nearest Upcoming Event
//--------------------------------------------------

function findNextEvent(events) {

    const now =
        new Date();

    now.setHours(0, 0, 0, 0);

    return events
        .map((event) => {

            return {

                event,
                startDate:
                    parseEventDate(
                        event["Start Date"]
                    ),
                endDate:
                    parseEventDate(
                        event["End Date"]
                    )

            };

        })
        .filter((entry) => {

            if (!entry.startDate) {

                return false;

            }

            const status =
                String(
                    entry.event["Status"] || ""
                )
                    .trim()
                    .toLowerCase();

            if (
                status === "cancelled" ||
                status === "canceled" ||
                status === "inactive"
            ) {

                return false;

            }

            const eventEndDate =
                entry.endDate ||
                entry.startDate;

            eventEndDate.setHours(
                23,
                59,
                59,
                999
            );

            return eventEndDate >= now;

        })
        .sort((firstEvent, secondEvent) => {

            return (
                firstEvent.startDate -
                secondEvent.startDate
            );

        })[0]?.event || null;

}

//--------------------------------------------------
// Parse Google Sheet Date
//--------------------------------------------------

function parseEventDate(value) {

    const dateText =
        String(value || "").trim();

    if (!dateText) {

        return null;

    }

    //--------------------------------------------------
    // MM/DD/YYYY
    //--------------------------------------------------

    const slashDate =
        dateText.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (slashDate) {

        const month =
            Number(slashDate[1]) - 1;

        const day =
            Number(slashDate[2]);

        const year =
            Number(slashDate[3]);

        return new Date(
            year,
            month,
            day
        );

    }

    //--------------------------------------------------
    // YYYY-MM-DD
    //--------------------------------------------------

    const dashDate =
        dateText.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

    if (dashDate) {

        const year =
            Number(dashDate[1]);

        const month =
            Number(dashDate[2]) - 1;

        const day =
            Number(dashDate[3]);

        return new Date(
            year,
            month,
            day
        );

    }

    //--------------------------------------------------
    // Other Recognized Date Formats
    //--------------------------------------------------

    const parsedDate =
        new Date(dateText);

    return Number.isNaN(
        parsedDate.getTime()
    )
        ? null
        : parsedDate;

}

//--------------------------------------------------
// Build Event Display Text
//--------------------------------------------------

function buildEventDetails(event) {

    const parts = [];

    const startDate =
        parseEventDate(
            event["Start Date"]
        );

    const endDate =
        parseEventDate(
            event["End Date"]
        );

    if (startDate) {

        parts.push(
            formatEventDateRange(
                startDate,
                endDate
            )
        );

    }

    const location =
        String(
            event["Location"] || ""
        ).trim();

    if (location) {

        parts.push(location);

    }

    const description =
        String(
            event["Description"] || ""
        ).trim();

    if (description) {

        parts.push(description);

    }

    return parts.join(" • ") ||
        "Upcoming WAC event.";

}

//--------------------------------------------------
// Format Event Date Range
//--------------------------------------------------

function formatEventDateRange(
    startDate,
    endDate
) {

    const dateOptions = {

        month: "short",
        day: "numeric",
        year: "numeric"

    };

    if (
        !endDate ||
        startDate.toDateString() ===
            endDate.toDateString()
    ) {

        return startDate.toLocaleDateString(
            "en-US",
            dateOptions
        );

    }

    return (
        startDate.toLocaleDateString(
            "en-US",
            dateOptions
        ) +
        " – " +
        endDate.toLocaleDateString(
            "en-US",
            dateOptions
        )
    );

}

//--------------------------------------------------
// Event Category Icon
//--------------------------------------------------

function getEventIcon(categoryValue) {

    const category =
        String(categoryValue || "")
            .trim()
            .toLowerCase();

    if (category.includes("camp")) {

        return "🏕️";

    }

    if (
        category.includes("holiday") ||
        category.includes("celebration")
    ) {

        return "🎉";

    }

    if (
        category.includes("meal") ||
        category.includes("food") ||
        category.includes("cook")
    ) {

        return "🍽️";

    }

    if (
        category.includes("hunt") ||
        category.includes("shoot")
    ) {

        return "🎯";

    }

    if (
        category.includes("fish") ||
        category.includes("water")
    ) {

        return "🎣";

    }

    if (
        category.includes("work") ||
        category.includes("project")
    ) {

        return "🛠️";

    }

    return "📅";

}

//--------------------------------------------------
// Empty Event State
//--------------------------------------------------

function showNoUpcomingEvent(
    icon,
    name,
    details,
    button
) {

    icon.textContent =
        "📅";

    name.textContent =
        "No Event Scheduled";

    details.textContent =
        "Upcoming WAC gatherings will appear here.";

    if (button) {

        button.hidden = true;

    }

}