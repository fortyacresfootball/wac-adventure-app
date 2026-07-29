// ======================================
// WAC Events Page
// Version 1.1
// ======================================

let eventsCalendarEvents = [];

let eventsCalendarDate =
    new Date();

(async function () {

    try {

        const events =
            await Database.getEvents();

        const activeEvents =
            getActiveEvents(
                events
            );

        const upcomingEvents =
            getUpcomingEvents(
                activeEvents
            );

        const annualTraditions =
            getAnnualTraditions(
                activeEvents
            );

        renderFeaturedEvent(
            upcomingEvents[0] || null
        );

        renderUpcomingEvents(
            upcomingEvents
        );

        initializeEventsCalendar(
            upcomingEvents
        );

        renderAnnualTraditions(
            annualTraditions
        );

        bindEventPageActions();

    }

    catch (error) {

        console.error(
            "Unable to load WAC events.",
            error
        );

        showEventsError();

    }

})();

//--------------------------------------------------
// Active Events
//--------------------------------------------------

function getActiveEvents(events) {

    return events.filter((event) => {

        const status =
            String(
                event["Status"] || ""
            )
                .trim()
                .toLowerCase();

        return ![
            "inactive",
            "cancelled",
            "canceled",
            "completed",
            "deleted"
        ].includes(status);

    });

}

//--------------------------------------------------
// Upcoming Events
//--------------------------------------------------

function getUpcomingEvents(events) {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return events
        .map((event) => {

            const startDate =
                parseEventPageDate(
                    event["Start Date"]
                );

            const endDate =
                parseEventPageDate(
                    event["End Date"]
                );

            return {

                event,
                startDate,
                endDate

            };

        })
        .filter((entry) => {

            if (!entry.startDate) {

                return false;

            }

            const finalDate =
                entry.endDate
                    ? new Date(entry.endDate)
                    : new Date(entry.startDate);

            finalDate.setHours(
                23,
                59,
                59,
                999
            );

            return finalDate >= today;

        })
        .sort((firstEvent, secondEvent) => {

            return (
                firstEvent.startDate -
                secondEvent.startDate
            );

        })
        .map((entry) => entry.event);

}
//--------------------------------------------------
// Events Calendar
//--------------------------------------------------

function initializeEventsCalendar(events) {

    eventsCalendarEvents =
        Array.isArray(events)
            ? events
            : [];

    const firstEventDate =
        eventsCalendarEvents.length > 0
            ? parseEventPageDate(
                eventsCalendarEvents[0]["Start Date"]
            )
            : null;

    eventsCalendarDate =
        firstEventDate
            ? new Date(
                firstEventDate.getFullYear(),
                firstEventDate.getMonth(),
                1
            )
            : new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            );

    renderEventsCalendar();

    bindEventsCalendarControls();

}


//--------------------------------------------------
// Bind Calendar Controls
//--------------------------------------------------

function bindEventsCalendarControls() {

    const listButton =
        document.getElementById(
            "eventsListViewButton"
        );

    const calendarButton =
        document.getElementById(
            "eventsCalendarViewButton"
        );

    const previousButton =
        document.getElementById(
            "eventsPreviousMonth"
        );

    const nextButton =
        document.getElementById(
            "eventsNextMonth"
        );

    if (listButton) {

        listButton.addEventListener(
            "click",
            function () {

                setEventsView(
                    "list"
                );

            }
        );

    }

    if (calendarButton) {

        calendarButton.addEventListener(
            "click",
            function () {

                setEventsView(
                    "calendar"
                );

            }
        );

    }

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                eventsCalendarDate =
                    new Date(
                        eventsCalendarDate.getFullYear(),
                        eventsCalendarDate.getMonth() - 1,
                        1
                    );

                renderEventsCalendar();

            }
        );

    }

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                eventsCalendarDate =
                    new Date(
                        eventsCalendarDate.getFullYear(),
                        eventsCalendarDate.getMonth() + 1,
                        1
                    );

                renderEventsCalendar();

            }
        );

    }

}


//--------------------------------------------------
// Switch Events View
//--------------------------------------------------

function setEventsView(viewName) {

    const list =
        document.getElementById(
            "upcomingEventsList"
        );

    const calendar =
        document.getElementById(
            "eventsCalendarView"
        );

    const listButton =
        document.getElementById(
            "eventsListViewButton"
        );

    const calendarButton =
        document.getElementById(
            "eventsCalendarViewButton"
        );

    const showCalendar =
        viewName === "calendar";

    if (list) {

        list.hidden =
            showCalendar;

    }

    if (calendar) {

        calendar.hidden =
            !showCalendar;

    }

    if (listButton) {

        listButton.classList.toggle(
            "active",
            !showCalendar
        );

        listButton.setAttribute(
            "aria-pressed",
            String(!showCalendar)
        );

    }

    if (calendarButton) {

        calendarButton.classList.toggle(
            "active",
            showCalendar
        );

        calendarButton.setAttribute(
            "aria-pressed",
            String(showCalendar)
        );

    }

}


//--------------------------------------------------
// Render Events Calendar
//--------------------------------------------------

function renderEventsCalendar() {

    const monthLabel =
        document.getElementById(
            "eventsCalendarMonth"
        );

    const grid =
        document.getElementById(
            "eventsCalendarGrid"
        );

    if (
        !monthLabel ||
        !grid
    ) {

        return;

    }

    monthLabel.textContent =
        eventsCalendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );

    grid.innerHTML = "";

    const weekdayNames = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    weekdayNames.forEach(
        function (weekdayName) {

            const weekday =
                document.createElement("div");

            weekday.className =
                "events-calendar-weekday";

            weekday.textContent =
                weekdayName;

            grid.appendChild(
                weekday
            );

        }
    );

    const year =
        eventsCalendarDate.getFullYear();

    const month =
        eventsCalendarDate.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        );

    const finalDay =
        new Date(
            year,
            month + 1,
            0
        );

    for (
        let blankIndex = 0;
        blankIndex < firstDay.getDay();
        blankIndex += 1
    ) {

        const blankCell =
            document.createElement("div");

        blankCell.className =
            "events-calendar-day events-calendar-day-empty";

        grid.appendChild(
            blankCell
        );

    }

    for (
        let dayNumber = 1;
        dayNumber <= finalDay.getDate();
        dayNumber += 1
    ) {

        const calendarDay =
            new Date(
                year,
                month,
                dayNumber
            );

        const dayCell =
            createEventsCalendarDay(
                calendarDay
            );

        grid.appendChild(
            dayCell
        );

    }

}


//--------------------------------------------------
// Create Calendar Day
//--------------------------------------------------

function createEventsCalendarDay(date) {

    const dayCell =
        document.createElement("div");

    dayCell.className =
        "events-calendar-day";

    const dayNumber =
        document.createElement("div");

    dayNumber.className =
        "events-calendar-day-number";

    dayNumber.textContent =
        String(
            date.getDate()
        );

    const today =
        new Date();

    if (
        date.toDateString() ===
        today.toDateString()
    ) {

        dayCell.classList.add(
            "today"
        );

    }

    dayCell.appendChild(
        dayNumber
    );

    const matchingEvents =
        eventsCalendarEvents.filter(
            function (event) {

                return eventOccursOnDate(
                    event,
                    date
                );

            }
        );

    matchingEvents.forEach(
        function (event) {

            const eventButton =
                document.createElement("button");

            eventButton.type =
                "button";

            eventButton.className =
                "events-calendar-event event-details-button";

            eventButton.dataset.eventId =
                event["Event ID"] || "";

            eventButton.textContent =
                event["Event Name"] ||
                "WAC Event";

            dayCell.appendChild(
                eventButton
            );

        }
    );

    return dayCell;

}


//--------------------------------------------------
// Event Occurs on Calendar Date
//--------------------------------------------------

function eventOccursOnDate(
    event,
    calendarDate
) {

    const startDate =
        parseEventPageDate(
            event["Start Date"]
        );

    const endDate =
        parseEventPageDate(
            event["End Date"]
        ) || startDate;

    if (
        !startDate ||
        !endDate
    ) {

        return false;

    }

    const comparisonDate =
        new Date(
            calendarDate.getFullYear(),
            calendarDate.getMonth(),
            calendarDate.getDate()
        );

    const comparisonStart =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        );

    const comparisonEnd =
        new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
        );

    return (
        comparisonDate >= comparisonStart &&
        comparisonDate <= comparisonEnd
    );

}

//--------------------------------------------------
// Annual Traditions
//--------------------------------------------------

function getAnnualTraditions(events) {

    return events
        .filter((event) => {

            const category =
                String(
                    event["Category"] || ""
                )
                    .trim()
                    .toLowerCase();

            return (
                category.includes("annual") ||
                category.includes("tradition")
            );

        })
        .sort((firstEvent, secondEvent) => {

            const firstDate =
                parseEventPageDate(
                    firstEvent["Start Date"]
                );

            const secondDate =
                parseEventPageDate(
                    secondEvent["Start Date"]
                );

            if (
                !firstDate &&
                !secondDate
            ) {

                return 0;

            }

            if (!firstDate) return 1;
            if (!secondDate) return -1;

            return firstDate - secondDate;

        });

}

//--------------------------------------------------
// Featured Event
//--------------------------------------------------

function renderFeaturedEvent(event) {

    const section =
        document.getElementById(
            "featuredEventSection"
        );

    const container =
        document.getElementById(
            "featuredEventCard"
        );

    if (
        !section ||
        !container
    ) {

        return;

    }

    container.innerHTML = "";

    if (!event) {

        const emptyState =
            createEventsEmptyState(

                "No Upcoming Events",
                "New WAC gatherings will appear here when they are added to the event calendar."

            );

        container.appendChild(
            emptyState
        );

        return;

    }

    const startDate =
        parseEventPageDate(
            event["Start Date"]
        );

    const dateBlock =
        createEventDateBlock(
            startDate,
            true
        );

    const content =
        document.createElement("div");

    content.className =
        "featured-event-content";

    const category =
        document.createElement("div");

    category.className =
        "featured-event-category";

    category.textContent =
        event["Category"] ||
        "WAC Event";

    const title =
        document.createElement("h2");

    title.textContent =
        event["Event Name"] ||
        "Upcoming WAC Event";

    const dateLine =
        document.createElement("div");

    dateLine.className =
        "featured-event-date";

    dateLine.textContent =
        formatEventPageDateRange(event);

    const location =
        document.createElement("div");

    location.className =
        "featured-event-location";

    location.textContent =
        event["Location"]
            ? `📍 ${event["Location"]}`
            : "📍 Location to be announced";

    const description =
        document.createElement("p");

    description.textContent =
        event["Description"] ||
        "Additional event details will be announced.";

    const actions =
        document.createElement("div");

    actions.className =
        "featured-event-actions";

    const detailsButton =
        document.createElement("button");

    detailsButton.type =
        "button";

    detailsButton.className =
        "small-button event-details-button";

    detailsButton.textContent =
        "View Event Details";

    detailsButton.dataset.eventId =
        event["Event ID"] || "";

    actions.appendChild(
        detailsButton
    );

    content.append(
        category,
        title,
        dateLine,
        location,
        description,
        actions
    );

    container.append(
        dateBlock,
        content
    );

}

//--------------------------------------------------
// Upcoming Event List
//--------------------------------------------------

function renderUpcomingEvents(events) {

    const list =
        document.getElementById(
            "upcomingEventsList"
        );

    const count =
        document.getElementById(
            "upcomingEventCount"
        );

    if (!list) return;

    list.innerHTML = "";

    if (count) {

        count.textContent =
            events.length === 1
                ? "1 Event"
                : `${events.length} Events`;

    }

    if (events.length === 0) {

        list.appendChild(

            createEventsEmptyState(

                "No Events Scheduled",
                "Upcoming WAC events will appear here after they are added to the database."

            )

        );

        return;

    }

    events.forEach((event, index) => {

        const eventRow =
            createUpcomingEventRow(
                event,
                index === 0
            );

        list.appendChild(
            eventRow
        );

    });

}

//--------------------------------------------------
// Create Upcoming Event Row
//--------------------------------------------------

function createUpcomingEventRow(
    event,
    isNextEvent
) {

    const article =
        document.createElement("article");

    article.className =
        "event-list-card";

    if (isNextEvent) {

        article.classList.add(
            "next-event"
        );

    }

    const startDate =
        parseEventPageDate(
            event["Start Date"]
        );

    const dateBlock =
        createEventDateBlock(
            startDate,
            false
        );

    const content =
        document.createElement("div");

    content.className =
        "event-list-content";

    const headingRow =
        document.createElement("div");

    headingRow.className =
        "event-list-heading";

    const title =
        document.createElement("h3");

    title.textContent =
        event["Event Name"] ||
        "WAC Event";

    headingRow.appendChild(
        title
    );

    if (isNextEvent) {

        const nextLabel =
            document.createElement("span");

        nextLabel.className =
            "event-next-label";

        nextLabel.textContent =
            "Next Event";

        headingRow.appendChild(
            nextLabel
        );

    }

    const meta =
        document.createElement("div");

    meta.className =
        "event-list-meta";

    const dateText =
        document.createElement("span");

    dateText.textContent =
        `📅 ${formatEventPageDateRange(event)}`;

    meta.appendChild(
        dateText
    );

    const locationValue =
        String(
            event["Location"] || ""
        ).trim();

    if (locationValue) {

        const location =
            document.createElement("span");

        location.textContent =
            `📍 ${locationValue}`;

        meta.appendChild(
            location
        );

    }

    const categoryValue =
        String(
            event["Category"] || ""
        ).trim();

    if (categoryValue) {

        const category =
            document.createElement("span");

        category.textContent =
            `${getEventPageIcon(categoryValue)} ${categoryValue}`;

        meta.appendChild(
            category
        );

    }

    const description =
        document.createElement("p");

    description.textContent =
        event["Description"] ||
        "Additional details will be announced.";

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "event-row-button event-details-button";

    button.textContent =
        "Details";

    button.dataset.eventId =
        event["Event ID"] || "";

    content.append(
        headingRow,
        meta,
        description
    );

    article.append(
        dateBlock,
        content,
        button
    );

    return article;

}

//--------------------------------------------------
// Annual Traditions
//--------------------------------------------------

function renderAnnualTraditions(events) {

    const section =
        document.getElementById(
            "annualTraditionsSection"
        );

    const grid =
        document.getElementById(
            "annualTraditionsGrid"
        );

    if (
        !section ||
        !grid
    ) {

        return;

    }

    grid.innerHTML = "";

    if (events.length === 0) {

        section.hidden = true;
        return;

    }

    events.forEach((event) => {

        const card =
            document.createElement("article");

        card.className =
            "event-tradition-card";

        const icon =
            document.createElement("div");

        icon.className =
            "event-tradition-icon";

        icon.textContent =
            getEventPageIcon(
                event["Category"]
            );

        const date =
            document.createElement("div");

        date.className =
            "event-tradition-date";

        date.textContent =
            formatEventPageDateRange(event);

        const title =
            document.createElement("h3");

        title.textContent =
            event["Event Name"] ||
            "WAC Tradition";

        const description =
            document.createElement("p");

        description.textContent =
            event["Description"] ||
            "An annual WAC tradition.";

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "event-tradition-button event-details-button";

        button.textContent =
            "View Details";

        button.dataset.eventId =
            event["Event ID"] || "";

        card.append(
            icon,
            date,
            title,
            description,
            button
        );

        grid.appendChild(
            card
        );

    });

    section.hidden = false;

}

//--------------------------------------------------
// Event Date Block
//--------------------------------------------------

function createEventDateBlock(
    date,
    featured
) {

    const dateBlock =
        document.createElement("div");

    dateBlock.className =
        featured
            ? "featured-event-date-block"
            : "event-date-block";

    if (!date) {

        dateBlock.textContent =
            "TBD";

        return dateBlock;

    }

    const month =
        document.createElement("span");

    month.className =
        "event-date-month";

    month.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                month: "short"
            }
        );

    const day =
        document.createElement("strong");

    day.className =
        "event-date-day";

    day.textContent =
        String(
            date.getDate()
        );

    const year =
        document.createElement("span");

    year.className =
        "event-date-year";

    year.textContent =
        String(
            date.getFullYear()
        );

    dateBlock.append(
        month,
        day,
        year
    );

    return dateBlock;

}

//--------------------------------------------------
// Event Details
//--------------------------------------------------

function bindEventPageActions() {

    document.addEventListener(
        "click",
        handleEventPageClick
    );

}

//--------------------------------------------------
// Event Page Click
//--------------------------------------------------

async function handleEventPageClick(event) {

    const detailsButton =
        event.target.closest(
            ".event-details-button"
        );

    if (!detailsButton) return;

    const eventId =
        String(
            detailsButton.dataset.eventId || ""
        ).trim();

    if (!eventId) return;

    try {

        const events =
            await Database.getEvents();

        const selectedEvent =
            events.find((eventRow) => {

                return String(
                    eventRow["Event ID"] || ""
                ).trim() === eventId;

            });

        if (!selectedEvent) {

            return;

        }

        window.WAC.selectedEvent =
            selectedEvent;

        openEventDetails(
            selectedEvent
        );

    }

    catch (error) {

        console.error(
            "Unable to open event details.",
            error
        );

    }

}

//--------------------------------------------------
// Open Event Detail Panel
//--------------------------------------------------

function openEventDetails(event) {

    closeEventDetails();

    const overlay =
        document.createElement("div");

    overlay.className =
        "event-detail-overlay";

    overlay.id =
        "eventDetailOverlay";

    const dialog =
        document.createElement("section");

    dialog.className =
        "event-detail-dialog";

    dialog.setAttribute(
        "role",
        "dialog"
    );

    dialog.setAttribute(
        "aria-modal",
        "true"
    );

    const closeButton =
        document.createElement("button");

    closeButton.type =
        "button";

    closeButton.className =
        "event-detail-close";

    closeButton.setAttribute(
        "aria-label",
        "Close event details"
    );

    closeButton.textContent =
        "×";

    const icon =
        document.createElement("div");

    icon.className =
        "event-detail-icon";

    icon.textContent =
        getEventPageIcon(
            event["Category"]
        );

    const category =
        document.createElement("div");

    category.className =
        "panel-label";

    category.textContent =
        event["Category"] ||
        "WAC Event";

    const title =
        document.createElement("h2");

    title.textContent =
        event["Event Name"] ||
        "WAC Event";

    const date =
        createEventDetailLine(
            "📅",
            formatEventPageDateRange(event)
        );

    const location =
        createEventDetailLine(
            "📍",
            event["Location"] ||
            "Location to be announced"
        );

    const organizer =
        createEventDetailLine(
            "👤",
            event["Organizer"] ||
            "Organizer to be announced"
        );

    const status =
        createEventDetailLine(
            "●",
            event["Status"] ||
            "Active"
        );

    const description =
        document.createElement("p");

    description.className =
        "event-detail-description";

    description.textContent =
        event["Description"] ||
        "Additional event information will be announced.";

    dialog.append(
        closeButton,
        icon,
        category,
        title,
        date,
        location,
        organizer,
        status,
        description
    );

    overlay.appendChild(
        dialog
    );

    closeButton.onclick =
        closeEventDetails;

    overlay.onclick = (clickEvent) => {

        if (clickEvent.target === overlay) {

            closeEventDetails();

        }

    };

    document.body.appendChild(
        overlay
    );

    document.body.classList.add(
        "event-dialog-open"
    );

}

//--------------------------------------------------
// Detail Information Line
//--------------------------------------------------

function createEventDetailLine(
    icon,
    value
) {

    const line =
        document.createElement("div");

    line.className =
        "event-detail-line";

    const iconElement =
        document.createElement("span");

    iconElement.textContent =
        icon;

    const text =
        document.createElement("span");

    text.textContent =
        value;

    line.append(
        iconElement,
        text
    );

    return line;

}

//--------------------------------------------------
// Close Event Details
//--------------------------------------------------

function closeEventDetails() {

    const overlay =
        document.getElementById(
            "eventDetailOverlay"
        );

    if (overlay) {

        overlay.remove();

    }

    document.body.classList.remove(
        "event-dialog-open"
    );

}

//--------------------------------------------------
// Parse Event Date
//--------------------------------------------------

function parseEventPageDate(value) {

    const dateText =
        String(value || "").trim();

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
        new Date(dateText);

    return Number.isNaN(
        parsedDate.getTime()
    )
        ? null
        : parsedDate;

}

//--------------------------------------------------
// Format Event Date Range
//--------------------------------------------------

function formatEventPageDateRange(event) {

    const startDate =
        parseEventPageDate(
            event["Start Date"]
        );

    const endDate =
        parseEventPageDate(
            event["End Date"]
        );

    if (!startDate) {

        return "Date to be announced";

    }

    const options = {

        month: "long",
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
            options
        );

    }

    return (
        startDate.toLocaleDateString(
            "en-US",
            options
        ) +
        " – " +
        endDate.toLocaleDateString(
            "en-US",
            options
        )
    );

}

//--------------------------------------------------
// Event Icon
//--------------------------------------------------

function getEventPageIcon(categoryValue) {

    const category =
        String(categoryValue || "")
            .trim()
            .toLowerCase();

    if (
        category.includes("america") ||
        category.includes("patriot")
    ) {

        return "🇺🇸";

    }

    if (
        category.includes("hunt") ||
        category.includes("opening")
    ) {

        return "🦌";

    }

    if (
        category.includes("fish") ||
        category.includes("water")
    ) {

        return "🎣";

    }

    if (
        category.includes("christmas") ||
        category.includes("holiday")
    ) {

        return "🎄";

    }

    if (
        category.includes("work") ||
        category.includes("project")
    ) {

        return "🛠️";

    }

    if (
        category.includes("camp")
    ) {

        return "🏕️";

    }

    if (
        category.includes("meal") ||
        category.includes("food")
    ) {

        return "🍽️";

    }

    if (
        category.includes("competition")
    ) {

        return "🏆";

    }

    return "📅";

}

//--------------------------------------------------
// Empty State
//--------------------------------------------------

function createEventsEmptyState(
    titleText,
    messageText
) {

    const emptyState =
        document.createElement("div");

    emptyState.className =
        "events-empty-state";

    const icon =
        document.createElement("div");

    icon.className =
        "events-empty-icon";

    icon.textContent =
        "📅";

    const title =
        document.createElement("h3");

    title.textContent =
        titleText;

    const message =
        document.createElement("p");

    message.textContent =
        messageText;

    emptyState.append(
        icon,
        title,
        message
    );

    return emptyState;

}

//--------------------------------------------------
// Error State
//--------------------------------------------------

function showEventsError() {

    const featured =
        document.getElementById(
            "featuredEventCard"
        );

    const list =
        document.getElementById(
            "upcomingEventsList"
        );

    const errorState =
        createEventsEmptyState(

            "Events Unavailable",
            "The WAC event calendar could not be loaded. Please try again later."

        );

    if (featured) {

        featured.innerHTML = "";
        featured.appendChild(
            errorState.cloneNode(true)
        );

    }

    if (list) {

        list.innerHTML = "";
        list.appendChild(
            errorState
        );

    }

}