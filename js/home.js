// ======================================
// WAC Home Page
// Version 2.1
// ======================================

(async function () {

    try {

        await Promise.all([

            loadAdventureCount(),
            loadNextEvent(),
            loadCompoundBadgeCount(),
            loadCabinWeather(),
            loadLatestNews()

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
// Compound Badge Count
//--------------------------------------------------

async function loadCompoundBadgeCount() {

    const count =
        document.getElementById(
            "homeCompoundBadgeCount"
        );

    const description =
        document.getElementById(
            "homeCompoundBadgeDescription"
        );

    if (!count) return;

    try {

        const logs =
            await Database.getLogs();

        const completedBadges =
            new Set();

        logs.forEach((log) => {

            const status =
                String(
                    log["Status"] || ""
                )
                    .trim()
                    .toLowerCase();

            const memberId =
                String(
                    log["Member ID"] || ""
                ).trim();

            const badgeId =
                String(
                    log["Badge ID"] || ""
                ).trim();

            if (
                status !== "completed" ||
                !memberId ||
                !badgeId
            ) {

                return;

            }

            completedBadges.add(
                `${memberId}::${badgeId}`
            );

        });

        const total =
            completedBadges.size;

        count.textContent =
            String(total);

        if (description) {

            description.textContent =
                total === 1
                    ? "Combined total across all WAC members."
                    : "Combined total across all WAC member profiles.";

        }

    }

    catch (error) {

        console.error(
            "Unable to load compound badge count.",
            error
        );

        count.textContent =
            "0";

        if (description) {

            description.textContent =
                "Badge totals are temporarily unavailable.";

        }

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
                entry.endDate
                    ? new Date(entry.endDate)
                    : new Date(entry.startDate);

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

    return (
        parts.join(" • ") ||
        "Upcoming WAC event."
    );

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
//--------------------------------------------------
// Cabin Weather
//--------------------------------------------------

async function loadCabinWeather() {

    const forecastContainer =
        document.getElementById(
            "homeWeatherForecast"
        );

    const updatedText =
        document.getElementById(
            "homeWeatherUpdated"
        );

    if (!forecastContainer) {

        return;

    }

    //--------------------------------------------------
    // Cabin Area Coordinates
    // W Eight Point Lake Road, Lake, Michigan
    //--------------------------------------------------

    const latitude =
        43.8400;

    const longitude =
        -85.0800;

    const weatherUrl =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
        "&temperature_unit=fahrenheit" +
        "&timezone=America%2FDetroit" +
        "&forecast_days=3";

    try {

        const response =
            await fetch(weatherUrl);

        if (!response.ok) {

            throw new Error(
                `Weather request failed: ${response.status}`
            );

        }

        const weatherData =
            await response.json();

        if (
            !weatherData.daily ||
            !Array.isArray(
                weatherData.daily.time
            )
        ) {

            throw new Error(
                "Weather forecast data was incomplete."
            );

        }

        renderCabinWeather(
            weatherData.daily,
            forecastContainer
        );

        if (updatedText) {

            updatedText.textContent =
                "Today and the next two days";

        }

    }

    catch (error) {

        console.error(
            "Unable to load cabin weather.",
            error
        );

        forecastContainer.innerHTML = "";

        const errorMessage =
            document.createElement("div");

        errorMessage.className =
            "weather-error";

        errorMessage.textContent =
            "Cabin weather is temporarily unavailable.";

        forecastContainer.appendChild(
            errorMessage
        );

        if (updatedText) {

            updatedText.textContent =
                "Forecast unavailable";

        }

    }

}

//--------------------------------------------------
// Render Three-Day Forecast
//--------------------------------------------------

function renderCabinWeather(
    dailyWeather,
    forecastContainer
) {

    forecastContainer.innerHTML = "";

    const forecastDates =
        dailyWeather.time || [];

    const highTemperatures =
        dailyWeather.temperature_2m_max || [];

    const lowTemperatures =
        dailyWeather.temperature_2m_min || [];

    const weatherCodes =
        dailyWeather.weather_code || [];

    const precipitationChances =
        dailyWeather.precipitation_probability_max || [];

    forecastDates
        .slice(0, 3)
        .forEach((dateValue, index) => {

            const weatherCode =
                Number(
                    weatherCodes[index]
                );

            const weatherDetails =
                getWeatherDetails(
                    weatherCode
                );

            const forecastDay =
                document.createElement("div");

            forecastDay.className =
                "weather-day";

            const dayName =
                document.createElement("div");

            dayName.className =
                "weather-day-name";

            dayName.textContent =
                formatWeatherDay(
                    dateValue,
                    index
                );

            const icon =
                document.createElement("div");

            icon.className =
                "weather-icon";

            icon.textContent =
                weatherDetails.icon;

            icon.setAttribute(
                "aria-label",
                weatherDetails.condition
            );

            const temperatures =
                document.createElement("div");

            temperatures.className =
                "weather-temperatures";

            const high =
                Math.round(
                    Number(
                        highTemperatures[index]
                    )
                );

            const low =
                Math.round(
                    Number(
                        lowTemperatures[index]
                    )
                );

            temperatures.innerHTML =
                `<strong>${high}°</strong>` +
                `<span>${low}°</span>`;

            const condition =
                document.createElement("div");

            condition.className =
                "weather-condition";

            condition.textContent =
                weatherDetails.condition;

            const precipitation =
                document.createElement("div");

            precipitation.className =
                "weather-precipitation";

            const rainChance =
                Number(
                    precipitationChances[index]
                );

            precipitation.textContent =
                Number.isFinite(rainChance)
                    ? `💧 ${Math.round(rainChance)}%`
                    : "💧 0%";

            forecastDay.append(
                dayName,
                icon,
                temperatures,
                condition,
                precipitation
            );

            forecastContainer.appendChild(
                forecastDay
            );

        });

}

//--------------------------------------------------
// Weather Day Label
//--------------------------------------------------

function formatWeatherDay(
    dateValue,
    index
) {

    if (index === 0) {

        return "Today";

    }

    if (index === 1) {

        return "Tomorrow";

    }

    const date =
        new Date(
            `${dateValue}T12:00:00`
        );

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );

}

//--------------------------------------------------
// Weather Code Translation
//--------------------------------------------------

function getWeatherDetails(code) {

    if (code === 0) {

        return {
            icon: "☀️",
            condition: "Clear"
        };

    }

    if (
        code === 1 ||
        code === 2
    ) {

        return {
            icon: "🌤️",
            condition: "Partly Cloudy"
        };

    }

    if (code === 3) {

        return {
            icon: "☁️",
            condition: "Cloudy"
        };

    }

    if (
        code === 45 ||
        code === 48
    ) {

        return {
            icon: "🌫️",
            condition: "Fog"
        };

    }

    if (
        code === 51 ||
        code === 53 ||
        code === 55 ||
        code === 56 ||
        code === 57
    ) {

        return {
            icon: "🌦️",
            condition: "Drizzle"
        };

    }

    if (
        code === 61 ||
        code === 63 ||
        code === 65 ||
        code === 66 ||
        code === 67 ||
        code === 80 ||
        code === 81 ||
        code === 82
    ) {

        return {
            icon: "🌧️",
            condition: "Rain"
        };

    }

    if (
        code === 71 ||
        code === 73 ||
        code === 75 ||
        code === 77 ||
        code === 85 ||
        code === 86
    ) {

        return {
            icon: "❄️",
            condition: "Snow"
        };

    }

    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {

        return {
            icon: "⛈️",
            condition: "Thunderstorms"
        };

    }

    return {
        icon: "🌤️",
        condition: "Mixed Conditions"
    };

}
//--------------------------------------------------
// Latest Active News
//--------------------------------------------------

async function loadLatestNews() {

    const icon =
        document.getElementById(
            "homeNewsIcon"
        );

    const title =
        document.getElementById(
            "homeNewsTitle"
        );

    const message =
        document.getElementById(
            "homeNewsMessage"
        );

    const meta =
        document.getElementById(
            "homeNewsMeta"
        );

    if (
        !icon ||
        !title ||
        !message
    ) {

        return;

    }

    try {

        const newsItems =
            await Database.getNews();

        const latestNews =
            findLatestActiveNews(
                newsItems
            );

        if (!latestNews) {

            showNoActiveNews(
                icon,
                title,
                message,
                meta
            );

            return;

        }

        icon.textContent =
            "📣";

        title.textContent =
            latestNews["Title"] ||
            "WAC Announcement";

        message.textContent =
            latestNews["Message"] ||
            "A new WAC announcement has been posted.";

        if (meta) {

            const metaParts = [];

            const date =
                parseNewsDate(
                    latestNews["Date"]
                );

            if (date) {

                metaParts.push(
                    date.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        }
                    )
                );

            }

            const postedBy =
                String(
                    latestNews["Posted By"] || ""
                ).trim();

            if (postedBy) {

                metaParts.push(
                    `Posted by ${postedBy}`
                );

            }

            if (metaParts.length > 0) {

                meta.textContent =
                    metaParts.join(" • ");

                meta.hidden = false;

            } else {

                meta.hidden = true;

            }

        }

    }

    catch (error) {

        console.error(
            "Unable to load latest news.",
            error
        );

        showNoActiveNews(
            icon,
            title,
            message,
            meta
        );

    }

}

//--------------------------------------------------
// Find Most Recent Active News Item
//--------------------------------------------------

function findLatestActiveNews(newsItems) {

    return newsItems
        .map((newsItem) => {

            return {

                newsItem,

                date:
                    parseNewsDate(
                        newsItem["Date"]
                    )

            };

        })
        .filter((entry) => {

            const status =
                String(
                    entry.newsItem["Status"] || ""
                )
                    .trim()
                    .toLowerCase();

            return (
                status === "active" &&
                entry.date
            );

        })
        .sort((firstItem, secondItem) => {

            return (
                secondItem.date -
                firstItem.date
            );

        })[0]?.newsItem || null;

}

//--------------------------------------------------
// Parse News Date
//--------------------------------------------------

function parseNewsDate(value) {

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
// Empty News State
//--------------------------------------------------

function showNoActiveNews(
    icon,
    title,
    message,
    meta
) {

    icon.textContent =
        "📣";

    title.textContent =
        "Welcome to the WAC";

    message.textContent =
        "The official Workman Adventure Compound application is now online.";

    if (meta) {

        meta.hidden = true;

    }

}