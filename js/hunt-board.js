window.HuntBoard = {
    mapsApiKey: "",

    data: null,

    async init() {

        try {

            await this.loadBoard();

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

        this.mapsApiKey =
    String(
        response.mapsApiKey || ""
    ).trim();

if (!this.mapsApiKey) {

    throw new Error(
        "Google Maps API key was not provided."
    );
}

this.data.events =
    await Database.getEvents();

this.renderSeason();
this.renderMoonPhase();

await this.loadGoogleMaps();

await this.loadCurrentWeather();

this.renderMap();
this.renderRadar();

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

renderMoonPhase() {

    const visual =
        document.getElementById(
            "huntMoonVisual"
        );

    const phaseElement =
        document.getElementById(
            "huntMoonPhase"
        );

    const illuminationElement =
        document.getElementById(
            "huntMoonIllumination"
        );


    if (
        !visual ||
        !phaseElement ||
        !illuminationElement
    ) {
        return;
    }


    //--------------------------------------------------
    // Lunar Cycle
    //--------------------------------------------------

    const lunarCycleDays =
        29.53058867;

    const knownNewMoon =
        new Date(
            Date.UTC(
                2000,
                0,
                6,
                18,
                14,
                0
            )
        );

    const now =
        new Date();

    const daysSinceKnownNewMoon =
        (
            now.getTime() -
            knownNewMoon.getTime()
        ) /
        86400000;

    const moonAge =
        (
            (
                daysSinceKnownNewMoon %
                lunarCycleDays
            ) +
            lunarCycleDays
        ) %
        lunarCycleDays;

    const phaseFraction =
        moonAge /
        lunarCycleDays;


    //--------------------------------------------------
    // Illumination
    //--------------------------------------------------

    const illumination =
        (
            1 -
            Math.cos(
                2 *
                Math.PI *
                phaseFraction
            )
        ) /
        2;

    const illuminationPercent =
        Math.round(
            illumination * 100
        );


    //--------------------------------------------------
    // Phase Name
    //--------------------------------------------------

    let phaseName =
        "New Moon";

    if (
        phaseFraction < 0.0625 ||
        phaseFraction >= 0.9375
    ) {

        phaseName =
            "New Moon";

    } else if (
        phaseFraction < 0.1875
    ) {

        phaseName =
            "Waxing Crescent";

    } else if (
        phaseFraction < 0.3125
    ) {

        phaseName =
            "First Quarter";

    } else if (
        phaseFraction < 0.4375
    ) {

        phaseName =
            "Waxing Gibbous";

    } else if (
        phaseFraction < 0.5625
    ) {

        phaseName =
            "Full Moon";

    } else if (
        phaseFraction < 0.6875
    ) {

        phaseName =
            "Waning Gibbous";

    } else if (
        phaseFraction < 0.8125
    ) {

        phaseName =
            "Last Quarter";

    } else {

        phaseName =
            "Waning Crescent";
    }


    //--------------------------------------------------
    // Draw Realistic Moon Phase
    //--------------------------------------------------

    visual.innerHTML =
        "";

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        184;

    canvas.height =
        184;

    canvas.style.width =
        "92px";

    canvas.style.height =
        "92px";

    canvas.style.display =
        "block";

    canvas.style.position =
        "relative";

    canvas.style.zIndex =
        "2";


    const context =
        canvas.getContext(
            "2d"
        );

    if (!context) {
        return;
    }


    const width =
        canvas.width;

    const height =
        canvas.height;

    const radius =
        width / 2;

    const centerX =
        radius;

    const centerY =
        radius;

    const image =
        context.createImageData(
            width,
            height
        );


    //--------------------------------------------------
    // Sun Direction
    //
    // New Moon = light behind Moon
    // Full Moon = light facing observer
    //--------------------------------------------------

    const phaseAngle =
        phaseFraction *
        Math.PI *
        2;

    const sunX =
        Math.sin(
            phaseAngle
        );

    const sunZ =
        -Math.cos(
            phaseAngle
        );


    for (
        let y = 0;
        y < height;
        y += 1
    ) {

        for (
            let x = 0;
            x < width;
            x += 1
        ) {

            const normalizedX =
                (
                    x -
                    centerX
                ) /
                radius;

            const normalizedY =
                (
                    y -
                    centerY
                ) /
                radius;

            const distanceSquared =
                normalizedX *
                normalizedX +
                normalizedY *
                normalizedY;

            const index =
                (
                    y *
                    width +
                    x
                ) *
                4;


            if (
                distanceSquared >
                1
            ) {

                image.data[
                    index + 3
                ] =
                    0;

                continue;
            }


            const normalizedZ =
                Math.sqrt(
                    Math.max(
                        0,
                        1 -
                        distanceSquared
                    )
                );


            const light =
                Math.max(
                    0,
                    normalizedX *
                    sunX +
                    normalizedZ *
                    sunZ
                );


            //--------------------------------------------------
            // Dark side remains slightly visible.
            //--------------------------------------------------

            const ambient =
                0.055;

            const brightness =
                Math.min(
                    1,
                    ambient +
                    light *
                    0.95
                );


            //--------------------------------------------------
            // Gentle lunar surface variation
            //--------------------------------------------------

            const texture =
                0.92 +
                0.08 *
                Math.sin(
                    x * 0.17 +
                    y * 0.11
                );


            const value =
                Math.round(
                    230 *
                    brightness *
                    texture
                );


            image.data[
                index
            ] =
                value;

            image.data[
                index + 1
            ] =
                Math.round(
                    value * 0.98
                );

            image.data[
                index + 2
            ] =
                Math.round(
                    value * 0.88
                );

            image.data[
                index + 3
            ] =
                255;
        }
    }


    context.putImageData(
        image,
        0,
        0
    );


    //--------------------------------------------------
    // Subtle Moon Surface Features
    //--------------------------------------------------

    context.save();

    context.beginPath();

    context.arc(
        centerX,
        centerY,
        radius - 2,
        0,
        Math.PI * 2
    );

    context.clip();


    const craters =
        [
            [0.32, 0.30, 0.10],
            [0.61, 0.39, 0.07],
            [0.48, 0.64, 0.13],
            [0.70, 0.67, 0.06],
            [0.26, 0.58, 0.05]
        ];


    craters.forEach(
        crater => {

            const craterX =
                crater[0] *
                width;

            const craterY =
                crater[1] *
                height;

            const craterRadius =
                crater[2] *
                width;

            const gradient =
                context.createRadialGradient(
                    craterX,
                    craterY,
                    0,
                    craterX,
                    craterY,
                    craterRadius
                );

            gradient.addColorStop(
                0,
                "rgba(70,70,65,0.16)"
            );

            gradient.addColorStop(
                1,
                "rgba(70,70,65,0)"
            );

            context.fillStyle =
                gradient;

            context.beginPath();

            context.arc(
                craterX,
                craterY,
                craterRadius,
                0,
                Math.PI * 2
            );

            context.fill();
        }
    );


    context.restore();


    visual.appendChild(
        canvas
    );


    //--------------------------------------------------
    // Display Information
    //--------------------------------------------------

    phaseElement.textContent =
        phaseName;

    illuminationElement.textContent =
        illuminationPercent +
        "% illuminated";

    visual.setAttribute(
        "aria-label",
        phaseName +
        ", " +
        illuminationPercent +
        "% illuminated"
    );

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

renderRadar() {

    const radarElement =
        document.getElementById(
            "huntRadar"
        );


    if (!radarElement) {
        return;
    }


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

        radarElement.innerHTML =
            `
                <div class="hunt-map-placeholder">

                    <strong>
                        Radar Unavailable
                    </strong>

                    <span>
                        No mapped Hunt Location was found.
                    </span>

                </div>
            `;

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


    const radarUrl =
        "https://embed.windy.com/embed2.html" +
        "?lat=" +
        encodeURIComponent(
            latitude
        ) +
        "&lon=" +
        encodeURIComponent(
            longitude
        ) +
        "&detailLat=" +
        encodeURIComponent(
            latitude
        ) +
        "&detailLon=" +
        encodeURIComponent(
            longitude
        ) +
        "&zoom=8" +
        "&level=surface" +
        "&overlay=radar" +
        "&product=radar" +
        "&menu=" +
        "&message=true" +
        "&marker=true" +
        "&calendar=now" +
        "&pressure=" +
        "&type=map" +
        "&location=coordinates" +
        "&detail=" +
        "&metricWind=mph" +
        "&metricTemp=%C2%B0F" +
        "&radarRange=-1";


    const iframe =
        document.createElement(
            "iframe"
        );


    iframe.src =
        radarUrl;

    iframe.title =
        "WAC live weather radar";

    iframe.loading =
        "lazy";

    iframe.setAttribute(
        "allowfullscreen",
        ""
    );


    radarElement.innerHTML =
        "";

    radarElement.appendChild(
        iframe
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