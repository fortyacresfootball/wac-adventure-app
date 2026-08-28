window.HuntBoard = {
        mapsApiKey: "AIzaSyD4NWa35v528iTsA-CMKfUmSoOC5ucGSkQ",

    data: null,

    selectedLocationId: "",

    async init() {

        try {

            await this.loadBoard();

            this.bindEvents();

        } catch (error) {

            console.error(
                "Hunt Board load error:",
                error
            );

            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Unable to load the Hunt Board."
            );
        }
    },


    async loadBoard() {

        const response =
            await Database.getHuntBoard();

        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.error
                    ? response.error
                    : "Unable to load Hunt Board data."
            );
        }

        this.data = response;

this.data.events =
    await Database.getEvents();

this.renderLocations();
this.renderCheckInStatus();
this.renderHunters();
this.updateHunterCount();
this.renderSeason();

await this.loadGoogleMaps();

await this.loadCurrentWeather();

this.renderMap();

    },


    bindEvents() {

        const checkInButton =
            document.getElementById(
                "huntCheckInButton"
            );

            const locationSelect =
    document.getElementById(
        "huntLocationSelect"
    );

        const checkOutButton =
            document.getElementById(
                "huntCheckOutButton"
            );


        if (checkInButton) {

            checkInButton.addEventListener(
                "click",
                () => {
                    this.checkIn();
                }
            );
        }


        if (checkOutButton) {

            checkOutButton.addEventListener(
                "click",
                () => {
                    this.checkOut();
                }
            );
        }

        if (locationSelect) {

    locationSelect.addEventListener(
        "change",
        () => {

            this.selectedLocationId =
                locationSelect.value;

            this.renderMap();
        }
    );
}

    },


    renderLocations() {

        const select =
            document.getElementById(
                "huntLocationSelect"
            );

        if (!select) {
            return;
        }

        select.innerHTML =
            `
                <option value="">
                    Select a location
                </option>
            `;


        const locations =
            Array.isArray(
                this.data.locations
            )
                ? this.data.locations
                : [];


        locations.forEach(
            function (location) {

                const locationId =
                    String(
                        location[
                            "Location ID"
                        ] || ""
                    ).trim();

                const name =
                    String(
                        location[
                            "Name"
                        ] || ""
                    ).trim();

                const type =
                    String(
                        location[
                            "Type"
                        ] || ""
                    ).trim();


                if (
                    !locationId ||
                    !name
                ) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    locationId;

                option.textContent =
                    type
                        ? name +
                          " — " +
                          type
                        : name;

                select.appendChild(
                    option
                );
            }
        );
    },


    renderCheckInStatus() {

        const statusBox =
            document.getElementById(
                "huntMyStatus"
            );

        const checkInForm =
            document.getElementById(
                "huntCheckInForm"
            );

        const checkOutArea =
            document.getElementById(
                "huntCheckOutArea"
            );


        if (
            !statusBox ||
            !checkInForm ||
            !checkOutArea
        ) {
            return;
        }


        const myCheckin =
            this.data.myCheckin;


        if (!myCheckin) {

            statusBox.textContent =
                "You are not currently checked in.";

            checkInForm.style.display =
                "block";

            checkOutArea.style.display =
                "none";

            return;
        }


        const locationName =
            this.getLocationName(
                myCheckin[
                    "Location ID"
                ]
            );

        const activity =
            String(
                myCheckin[
                    "Activity"
                ] || "Hunting"
            ).trim();


        statusBox.innerHTML =
            `
                <strong>
                    Checked In
                </strong>
                <br>
                ${this.escapeHtml(
                    locationName
                )}
                <br>
                <span
                    style="
                        font-size:0.84rem;
                        font-weight:600;
                        opacity:0.72;
                    "
                >
                    ${this.escapeHtml(
                        activity
                    )}
                </span>
            `;


        checkInForm.style.display =
            "none";

        checkOutArea.style.display =
            "block";
    },


    renderHunters() {

        const container =
            document.getElementById(
                "huntActiveHunters"
            );

        if (!container) {
            return;
        }


        const checkins =
            Array.isArray(
                this.data.activeCheckins
            )
                ? this.data.activeCheckins
                : [];


        if (
            checkins.length === 0
        ) {

            container.innerHTML =
                `
                    <div class="hunt-empty">
                        No one is currently checked in.
                    </div>
                `;

            return;
        }


        container.innerHTML =
            "";


        checkins.forEach(
            checkin => {

                const hunterName =
                    String(
                        checkin[
                            "Member Name"
                        ] || "WAC Member"
                    ).trim();

                const locationName =
                    this.getLocationName(
                        checkin[
                            "Location ID"
                        ]
                    );

                const activity =
                    String(
                        checkin[
                            "Activity"
                        ] || "Hunting"
                    ).trim();

                const checkInTime =
                    this.formatDateTime(
                        checkin[
                            "Check In DateTime"
                        ]
                    );


                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "hunt-hunter";


                card.innerHTML =
                    `
                        <div
                            class="hunt-hunter-name"
                        >
                            ${this.escapeHtml(
                                hunterName
                            )}
                        </div>

                        <div
                            class="hunt-hunter-meta"
                        >
                            ${this.escapeHtml(
                                locationName
                            )}
                            ·
                            ${this.escapeHtml(
                                activity
                            )}
                        </div>

                        <div
                            class="hunt-hunter-meta"
                        >
                            Checked in
                            ${this.escapeHtml(
                                checkInTime
                            )}
                        </div>
                    `;


                container.appendChild(
                    card
                );
            }
        );
    },


    updateHunterCount() {

        const countElement =
            document.getElementById(
                "huntHunterCount"
            );

        if (!countElement) {
            return;
        }


        const checkins =
            Array.isArray(
                this.data.activeCheckins
            )
                ? this.data.activeCheckins
                : [];


        countElement.textContent =
            String(
                checkins.length
            );
    },


    async checkIn() {

        this.clearError();


        const locationSelect =
            document.getElementById(
                "huntLocationSelect"
            );

        const activitySelect =
            document.getElementById(
                "huntActivitySelect"
            );

        const button =
            document.getElementById(
                "huntCheckInButton"
            );


        if (
            !locationSelect ||
            !activitySelect ||
            !button
        ) {
            return;
        }


        const locationId =
            locationSelect.value;

        const activity =
            activitySelect.value;


        if (!locationId) {

            this.showError(
                "Select a hunting location before checking in."
            );

            return;
        }


        try {

            button.disabled =
                true;

            button.textContent =
                "Checking In...";


            const response =
                await Database.huntCheckIn(
                    locationId,
                    activity
                );


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response &&
                    response.error
                        ? response.error
                        : "Unable to check in."
                );
            }


            await this.loadBoard();


        } catch (error) {

            console.error(
                "Hunt check-in error:",
                error
            );

            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Unable to check in."
            );

        } finally {

            button.disabled =
                false;

            button.textContent =
                "Check In";
        }
    },


    async checkOut() {

        this.clearError();


        const button =
            document.getElementById(
                "huntCheckOutButton"
            );


        if (!button) {
            return;
        }


        try {

            button.disabled =
                true;

            button.textContent =
                "Checking Out...";


            const response =
                await Database.huntCheckOut();


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response &&
                    response.error
                        ? response.error
                        : "Unable to check out."
                );
            }


            await this.loadBoard();


        } catch (error) {

            console.error(
                "Hunt check-out error:",
                error
            );

            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Unable to check out."
            );

        } finally {

            button.disabled =
                false;

            button.textContent =
                "Check Out";
        }
    },


    getLocationName(
        locationId
    ) {

        const id =
            String(
                locationId || ""
            ).trim();


        const locations =
            Array.isArray(
                this.data.locations
            )
                ? this.data.locations
                : [];


        const match =
            locations.find(
                function (location) {

                    return (
                        String(
                            location[
                                "Location ID"
                            ] || ""
                        ).trim() === id
                    );
                }
            );


        if (!match) {

            return (
                id ||
                "Unknown Location"
            );
        }


        return (
            String(
                match["Name"] || ""
            ).trim() ||
            id
        );
    },


    formatDateTime(
        value
    ) {

        if (!value) {
            return "";
        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );
        }


        return date.toLocaleString(
            [],
            {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );
    },

    renderSeason() {

    const seasonElement =
        document.getElementById(
            "huntSeason"
        );


    if (!seasonElement) {
        return;
    }


    const events =
        Array.isArray(
            this.data.events
        )
            ? this.data.events
            : [];


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const currentSeasons =
        events.filter(
            event => {

                //--------------------------------------------------
                // Must specifically be marked as a hunting season.
                //--------------------------------------------------

                const category =
    String(
        event[
            "Category"
        ] || ""
    )
        .trim()
        .toLowerCase();


const isHuntingSeason =
    category.includes(
        "hunting season"
    );


if (!isHuntingSeason) {
    return false;
}

                //--------------------------------------------------
                // Ignore inactive/cancelled events.
                //--------------------------------------------------

                const status =
                    String(
                        event[
                            "Status"
                        ] || ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    [
                        "inactive",
                        "cancelled",
                        "canceled",
                        "completed",
                        "deleted"
                    ].includes(
                        status
                    )
                ) {

                    return false;
                }


                //--------------------------------------------------
                // Check the event dates.
                //--------------------------------------------------

                const startDate =
                    this.parseHuntEventDate(
                        event[
                            "Start Date"
                        ]
                    );

                const endDate =
                    this.parseHuntEventDate(
                        event[
                            "End Date"
                        ]
                    ) ||
                    startDate;


                if (
                    !startDate ||
                    !endDate
                ) {

                    return false;
                }


                startDate.setHours(
                    0,
                    0,
                    0,
                    0
                );

                endDate.setHours(
                    23,
                    59,
                    59,
                    999
                );


                return (
                    today >= startDate &&
                    today <= endDate
                );
            }
        );


    if (
        currentSeasons.length === 0
    ) {

        seasonElement.textContent =
            "Closed";

        return;
    }


    seasonElement.textContent =
        currentSeasons
            .map(
                event => {

                    return String(
                        event[
                            "Event Name"
                        ] ||
                        "Hunting Season"
                    ).trim();
                }
            )
            .join(" / ");
},

parseHuntEventDate(
    value
) {

    const dateText =
        String(
            value || ""
        ).trim();


    if (!dateText) {
        return null;
    }


    const slashDate =
        dateText.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (slashDate) {

        return new Date(
            Number(
                slashDate[3]
            ),
            Number(
                slashDate[1]
            ) - 1,
            Number(
                slashDate[2]
            )
        );
    }


    const dashDate =
        dateText.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (dashDate) {

        return new Date(
            Number(
                dashDate[1]
            ),
            Number(
                dashDate[2]
            ) - 1,
            Number(
                dashDate[3]
            )
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
},

    async loadCurrentWeather() {

    const locations =
        Array.isArray(
            this.data.locations
        )
            ? this.data.locations
            : [];


    const mappedLocation =
        locations.find(
            function (location) {

                const latitude =
                    parseFloat(
                        location[
                            "Latitude"
                        ]
                    );

                const longitude =
                    parseFloat(
                        location[
                            "Longitude"
                        ]
                    );

                return (
                    Number.isFinite(
                        latitude
                    ) &&
                    Number.isFinite(
                        longitude
                    )
                );
            }
        );


    if (!mappedLocation) {
        return;
    }


    const latitude =
        parseFloat(
            mappedLocation[
                "Latitude"
            ]
        );

    const longitude =
        parseFloat(
            mappedLocation[
                "Longitude"
            ]
        );


    const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" +
        encodeURIComponent(
            latitude
        ) +
        "&longitude=" +
        encodeURIComponent(
            longitude
        ) +
        "&current=" +
[
    "temperature_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m"
].join(",") +
"&daily=" +
[
    "sunrise",
    "sunset"
].join(",") +
"&wind_speed_unit=mph" +
        "&temperature_unit=fahrenheit" +
        "&timezone=auto";


    const response =
        await fetch(
            url
        );


    if (!response.ok) {

        throw new Error(
            "Current hunting weather could not be loaded."
        );
    }


    const weather =
        await response.json();


    this.data.weather =
    weather.current || null;

this.data.dailyWeather =
    weather.daily || null;


this.renderCurrentWeather();
this.renderSunTimes();

},


renderCurrentWeather() {

    const weather =
        this.data.weather;

    if (!weather) {
        return;
    }


    const windElement =
        document.getElementById(
            "huntWind"
        );


    if (windElement) {

        const speed =
            Number(
                weather.wind_speed_10m
            );

        const direction =
            Number(
                weather.wind_direction_10m
            );


        windElement.textContent =
            this.windDirectionName(
                direction
            ) +
            " " +
            Math.round(
                speed
            ) +
            " mph";
    }
},

renderSunTimes() {

    const daily =
        this.data.dailyWeather;


    if (!daily) {
        return;
    }


    const sunriseElement =
        document.getElementById(
            "huntSunrise"
        );

    const sunsetElement =
        document.getElementById(
            "huntSunset"
        );


    if (
        sunriseElement &&
        Array.isArray(
            daily.sunrise
        ) &&
        daily.sunrise.length > 0
    ) {

        const sunrise =
            new Date(
                daily.sunrise[0]
            );


        if (
            !Number.isNaN(
                sunrise.getTime()
            )
        ) {

            sunriseElement.textContent =
                sunrise.toLocaleTimeString(
                    [],
                    {
                        hour:
                            "numeric",

                        minute:
                            "2-digit"
                    }
                );
        }
    }


    if (
        sunsetElement &&
        Array.isArray(
            daily.sunset
        ) &&
        daily.sunset.length > 0
    ) {

        const sunset =
            new Date(
                daily.sunset[0]
            );


        if (
            !Number.isNaN(
                sunset.getTime()
            )
        ) {

            sunsetElement.textContent =
                sunset.toLocaleTimeString(
                    [],
                    {
                        hour:
                            "numeric",

                        minute:
                            "2-digit"
                    }
                );
        }
    }
},

windDirectionName(
    degrees
) {

    if (
        !Number.isFinite(
            degrees
        )
    ) {

        return "--";
    }


    const directions =
        [
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW"
        ];


    const index =
        Math.round(
            degrees / 45
        ) % 8;


    return directions[
        index
    ];
},

    async loadGoogleMaps() {

    if (
        window.google &&
        window.google.maps
    ) {
        return;
    }

    await new Promise(
        (resolve, reject) => {

            const existingScript =
                document.getElementById(
                    "wacGoogleMapsScript"
                );

            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    resolve
                );

                existingScript.addEventListener(
                    "error",
                    reject
                );

                return;
            }

            const script =
                document.createElement(
                    "script"
                );

            script.id =
                "wacGoogleMapsScript";

            script.src =
                "https://maps.googleapis.com/maps/api/js?key=" +
                encodeURIComponent(
                    this.mapsApiKey
                );

            script.async =
                true;

            script.defer =
                true;

            script.onload =
                resolve;

            script.onerror =
                function () {

                    reject(
                        new Error(
                            "Google Maps could not be loaded."
                        )
                    );
                };

            document.head.appendChild(
                script
            );
        }
    );
},


renderMap() {

    const mapElement =
        document.getElementById(
            "huntMap"
        );

    if (!mapElement) {
        return;
    }

    const locations =
        Array.isArray(
            this.data.locations
        )
            ? this.data.locations
            : [];

    const mappedLocations =
        locations.filter(
            function (location) {

                const latitude =
                    parseFloat(
                        location[
                            "Latitude"
                        ]
                    );

                const longitude =
                    parseFloat(
                        location[
                            "Longitude"
                        ]
                    );

                return (
                    Number.isFinite(
                        latitude
                    ) &&
                    Number.isFinite(
                        longitude
                    )
                );
            }
        );


    if (
        mappedLocations.length === 0
    ) {

        mapElement.innerHTML =
            `
                <div class="hunt-map-placeholder">
                    <strong>
                        No Map Locations Yet
                    </strong>

                    <span>
                        Add latitude and longitude values
                        to Hunt Locations.
                    </span>
                </div>
            `;

        return;
    }


    let firstLocation =
    mappedLocations[0];


if (this.selectedLocationId) {

    const selectedLocation =
        mappedLocations.find(
            location => {

                return (
                    String(
                        location[
                            "Location ID"
                        ] || ""
                    ).trim() ===
                    this.selectedLocationId
                );
            }
        );


    if (selectedLocation) {

        firstLocation =
            selectedLocation;
    }
}

    const center =
        {
            lat:
                parseFloat(
                    firstLocation[
                        "Latitude"
                    ]
                ),

            lng:
                parseFloat(
                    firstLocation[
                        "Longitude"
                    ]
                )
        };


    const map =
        new google.maps.Map(
            mapElement,
            {
                center:
                    center,

                zoom:
                    18,

                mapTypeId:
                    "satellite",

                streetViewControl:
                    false,

                mapTypeControl:
                    true,

                fullscreenControl:
                    true
            }
        );

        this.renderWindCone(
    map,
    firstLocation
);

this.renderWindLabel(
    map,
    firstLocation
);

    mappedLocations.forEach(
        location => {

            const position =
                {
                    lat:
                        parseFloat(
                            location[
                                "Latitude"
                            ]
                        ),

                    lng:
                        parseFloat(
                            location[
                                "Longitude"
                            ]
                        )
                };


            const marker =
                new google.maps.Marker(
                    {
                        position:
                            position,

                        map:
                            map,

                        title:
                            String(
                                location[
                                    "Name"
                                ] || ""
                            )
                    }
                );


            const name =
                String(
                    location[
                        "Name"
                    ] || "Hunting Location"
                ).trim();

            const type =
                String(
                    location[
                        "Type"
                    ] || ""
                ).trim();

            const notes =
                String(
                    location[
                        "Notes"
                    ] || ""
                ).trim();


            const infoWindow =
                new google.maps.InfoWindow(
                    {
                        content:
                            `
                                <div
                                    style="
                                        min-width:180px;
                                        font-family:Arial,sans-serif;
                                    "
                                >
                                    <strong>
                                        ${this.escapeHtml(
                                            name
                                        )}
                                    </strong>

                                    ${
                                        type
                                            ? `
                                                <div
                                                    style="
                                                        margin-top:4px;
                                                        font-size:12px;
                                                        color:#666;
                                                    "
                                                >
                                                    ${this.escapeHtml(
                                                        type
                                                    )}
                                                </div>
                                            `
                                            : ""
                                    }

                                    ${
                                        notes
                                            ? `
                                                <div
                                                    style="
                                                        margin-top:8px;
                                                        font-size:12px;
                                                    "
                                                >
                                                    ${this.escapeHtml(
                                                        notes
                                                    )}
                                                </div>
                                            `
                                            : ""
                                    }
                                </div>
                            `
                    }
                );


            marker.addListener(
                "click",
                function () {

                    infoWindow.open(
                        map,
                        marker
                    );
                }
            );
        }
    );
},

renderWindCone(
    map,
    location
) {

    const weather =
        this.data.weather;


    if (
        !weather ||
        !location
    ) {
        return;
    }


    const latitude =
        parseFloat(
            location[
                "Latitude"
            ]
        );

    const longitude =
        parseFloat(
            location[
                "Longitude"
            ]
        );

    const windDirection =
        Number(
            weather.wind_direction_10m
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        ) ||
        !Number.isFinite(
            windDirection
        )
    ) {
        return;
    }


    //--------------------------------------------------
    // Weather direction is where wind comes FROM.
    // Scent travels approximately 180 degrees opposite.
    //--------------------------------------------------

    const scentDirection =
        (
            windDirection +
            180
        ) % 360;


    const coneLengthMeters =
    125;

const coneWidthDegrees =
    16;


    const leftDirection =
        scentDirection -
        coneWidthDegrees;

    const rightDirection =
        scentDirection +
        coneWidthDegrees;


    const origin =
        {
            lat:
                latitude,

            lng:
                longitude
        };


    const leftPoint =
        this.destinationPoint(
            latitude,
            longitude,
            coneLengthMeters,
            leftDirection
        );

    const centerPoint =
        this.destinationPoint(
            latitude,
            longitude,
            coneLengthMeters * 1.15,
            scentDirection
        );

    const rightPoint =
        this.destinationPoint(
            latitude,
            longitude,
            coneLengthMeters,
            rightDirection
        );


    new google.maps.Polygon(
        {
            paths:
                [
                    origin,
                    leftPoint,
                    centerPoint,
                    rightPoint
                ],

            strokeColor:
                "#f2c94c",

            strokeOpacity:
                0.95,

            strokeWeight:
                2,

            fillColor:
                "#f2c94c",

            fillOpacity:
                0.18,

            map:
                map,

            clickable:
                false
        }
    );
},


destinationPoint(
    latitude,
    longitude,
    distanceMeters,
    bearingDegrees
) {

    const earthRadius =
        6378137;


    const angularDistance =
        distanceMeters /
        earthRadius;


    const bearing =
        bearingDegrees *
        Math.PI /
        180;


    const lat1 =
        latitude *
        Math.PI /
        180;

    const lon1 =
        longitude *
        Math.PI /
        180;


    const lat2 =
        Math.asin(
            Math.sin(
                lat1
            ) *
            Math.cos(
                angularDistance
            ) +
            Math.cos(
                lat1
            ) *
            Math.sin(
                angularDistance
            ) *
            Math.cos(
                bearing
            )
        );


    const lon2 =
        lon1 +
        Math.atan2(
            Math.sin(
                bearing
            ) *
            Math.sin(
                angularDistance
            ) *
            Math.cos(
                lat1
            ),

            Math.cos(
                angularDistance
            ) -
            Math.sin(
                lat1
            ) *
            Math.sin(
                lat2
            )
        );


    return {
        lat:
            lat2 *
            180 /
            Math.PI,

        lng:
            lon2 *
            180 /
            Math.PI
    };
},

renderWindLabel(
    map,
    location
) {

    const weather =
        this.data.weather;

    if (
        !weather ||
        !location
    ) {
        return;
    }


    const latitude =
        parseFloat(
            location[
                "Latitude"
            ]
        );

    const longitude =
        parseFloat(
            location[
                "Longitude"
            ]
        );

    const windDirection =
        Number(
            weather.wind_direction_10m
        );

    const windSpeed =
        Number(
            weather.wind_speed_10m
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        ) ||
        !Number.isFinite(
            windDirection
        ) ||
        !Number.isFinite(
            windSpeed
        )
    ) {
        return;
    }


    const scentDirection =
        (
            windDirection +
            180
        ) % 360;


    const labelPosition =
        this.destinationPoint(
            latitude,
            longitude,
            32,
            scentDirection
        );


    const content =
        document.createElement(
            "div"
        );

    content.style.cssText =
        [
            "background:#143f2b",
            "color:#ffffff",
            "padding:7px 10px",
            "border-radius:8px",
            "font-size:12px",
            "font-weight:700",
            "line-height:1.35",
            "box-shadow:0 2px 8px rgba(0,0,0,0.28)",
            "white-space:nowrap"
        ].join(";");


    content.innerHTML =
        `
            Wind:
            ${this.windDirectionName(
                windDirection
            )}
            ${Math.round(
                windSpeed
            )} mph
            <br>
            Scent →
            ${this.windDirectionName(
                scentDirection
            )}
        `;


    const infoWindow =
        new google.maps.InfoWindow(
            {
                content:
                    content,

                position:
                    labelPosition,

                disableAutoPan:
                    true,

                pixelOffset:
                    new google.maps.Size(
                        0,
                        -10
                    )
            }
        );


    infoWindow.open(
        map
    );
},

    showError(
        message
    ) {

        const box =
            document.getElementById(
                "huntBoardError"
            );

        if (!box) {
            return;
        }


        box.textContent =
            message;

        box.style.display =
            "block";
    },


    clearError() {

        const box =
            document.getElementById(
                "huntBoardError"
            );

        if (!box) {
            return;
        }


        box.textContent =
            "";

        box.style.display =
            "none";
    },


    escapeHtml(
        value
    ) {

        return String(
            value || ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                "\"",
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

};


HuntBoard.init();