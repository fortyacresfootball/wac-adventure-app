window.HuntJournal = {

    data: null,


    async init() {

        try {

            await this.loadJournal();

            this.renderHistory();

            this.setDefaultDateTime();

           await this.populateLocations();

await this.loadCurrentWeather();

this.prefillFromHuntBoard();

            this.bindEvents();

        } catch (error) {

            console.error(
                "Hunt Journal load error:",
                error
            );

            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Unable to load the Hunting Journal."
            );
        }
    },


    async loadJournal() {

        const response =
            await Database.getHuntJournal();


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.error
                    ? response.error
                    : "Unable to load Hunting Journal data."
            );
        }


        this.data = response;
    },


    setDefaultDateTime() {

        const dateInput =
            document.getElementById(
                "huntJournalDate"
            );

        const startTimeInput =
            document.getElementById(
                "huntJournalStartTime"
            );


        const now =
            new Date();


        if (
            dateInput &&
            !dateInput.value
        ) {

            const year =
                now.getFullYear();

            const month =
                String(
                    now.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    now.getDate()
                ).padStart(
                    2,
                    "0"
                );


            dateInput.value =
                year +
                "-" +
                month +
                "-" +
                day;
        }


        if (
            startTimeInput &&
            !startTimeInput.value
        ) {

            const hours =
                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                );

            const minutes =
                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                );


            startTimeInput.value =
                hours +
                ":" +
                minutes;
        }
    },


    async populateLocations() {

        const select =
            document.getElementById(
                "huntJournalLocation"
            );


        if (!select) {
            return;
        }


        select.innerHTML =
            `
                <option value="">
                    Select Location
                </option>
            `;


        try {

            const huntBoard =
                await Database.getHuntBoard();


            if (
                !huntBoard ||
                huntBoard.success !== true
            ) {

                return;
            }


            this.data.huntBoard =
                huntBoard;


            const locations =
                Array.isArray(
                    huntBoard.locations
                )
                    ? huntBoard.locations
                    : [];


            locations.forEach(
                function (location) {

                    const id =
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
                        !id ||
                        !name
                    ) {
                        return;
                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        id;

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


            if (
                huntBoard.myCheckin &&
                huntBoard.myCheckin[
                    "Location ID"
                ]
            ) {

                select.value =
                    String(
                        huntBoard.myCheckin[
                            "Location ID"
                        ]
                    ).trim();
            }


        } catch (error) {

            console.warn(
                "Journal locations could not be loaded:",
                error
            );
        }
    },

    async loadCurrentWeather() {

    const huntBoard =
        this.data &&
        this.data.huntBoard
            ? this.data.huntBoard
            : null;


    if (!huntBoard) {
        return;
    }


    const locations =
        Array.isArray(
            huntBoard.locations
        )
            ? huntBoard.locations
            : [];


    if (
        locations.length === 0
    ) {
        return;
    }

    const locationSelect =
        document.getElementById(
            "huntJournalLocation"
        );


    let selectedLocation =
        null;


    if (
        locationSelect &&
        locationSelect.value
    ) {

        selectedLocation =
            locations.find(
                location => {

                    return (
                        String(
                            location[
                                "Location ID"
                            ] || ""
                        ).trim() ===
                        locationSelect.value
                    );
                }
            );
    }


    if (!selectedLocation) {

        selectedLocation =
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
    }


    if (!selectedLocation) {
        return;
    }


    const latitude =
        parseFloat(
            selectedLocation[
                "Latitude"
            ]
        );

    const longitude =
        parseFloat(
            selectedLocation[
                "Longitude"
            ]
        );


    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
    ) {
        return;
    }


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
            "precipitation",
            "weather_code",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m"
        ].join(",") +
        "&temperature_unit=fahrenheit" +
        "&wind_speed_unit=mph" +
        "&precipitation_unit=inch" +
        "&timezone=auto";


    try {

        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Current weather could not be loaded."
            );
        }


        const weatherData =
            await response.json();


        this.data.huntBoard.weather =
            weatherData.current ||
            null;


    } catch (error) {

        console.warn(
            "Journal weather could not be loaded:",
            error
        );
    }
},

    prefillFromHuntBoard() {

    const huntBoard =
        this.data &&
        this.data.huntBoard
            ? this.data.huntBoard
            : null;


    if (!huntBoard) {
        return;
    }


    const weather =
        huntBoard.weather || null;


    if (weather) {

        const weatherElement =
            document.getElementById(
                "huntJournalWeather"
            );

        const temperature =
            document.getElementById(
                "huntJournalTemperature"
            );

        const windDirection =
            document.getElementById(
                "huntJournalWindDirection"
            );

        const windSpeed =
            document.getElementById(
                "huntJournalWindSpeed"
            );

        const pressure =
            document.getElementById(
                "huntJournalPressure"
            );

        const precipitation =
            document.getElementById(
                "huntJournalPrecipitation"
            );


        if (
            weatherElement &&
            Number.isFinite(
                Number(
                    weather.weather_code
                )
            )
        ) {

            weatherElement.value =
                this.weatherCodeName(
                    Number(
                        weather.weather_code
                    )
                );
        }


        if (
            temperature &&
            Number.isFinite(
                Number(
                    weather.temperature_2m
                )
            )
        ) {

            temperature.value =
                Math.round(
                    Number(
                        weather.temperature_2m
                    )
                ) +
                "°F";
        }


        if (
            windDirection &&
            Number.isFinite(
                Number(
                    weather.wind_direction_10m
                )
            )
        ) {

            windDirection.value =
                this.windDirectionName(
                    Number(
                        weather.wind_direction_10m
                    )
                );
        }


        if (
            windSpeed &&
            Number.isFinite(
                Number(
                    weather.wind_speed_10m
                )
            )
        ) {

            windSpeed.value =
                Math.round(
                    Number(
                        weather.wind_speed_10m
                    )
                ) +
                " mph";
        }


        if (
            pressure &&
            Number.isFinite(
                Number(
                    weather.surface_pressure
                )
            )
        ) {

            const inchesHg =
                Number(
                    weather.surface_pressure
                ) *
                0.02953;


            pressure.value =
                inchesHg.toFixed(
                    2
                ) +
                " inHg";
        }


        if (
            precipitation &&
            Number.isFinite(
                Number(
                    weather.precipitation
                )
            )
        ) {

            const amount =
                Number(
                    weather.precipitation
                );


            if (
                amount <= 0
            ) {

                precipitation.value =
                    "";

            } else if (
                amount < 0.05
            ) {

                precipitation.value =
                    "Light";

            } else if (
                amount < 0.20
            ) {

                precipitation.value =
                    "Moderate";

            } else {

                precipitation.value =
                    "Heavy";
            }
        }
    }


    const moonPhase =
        document.getElementById(
            "huntJournalMoonPhase"
        );


    if (moonPhase) {

        moonPhase.value =
            this.getMoonPhaseName();
    }
},


    bindEvents() {

        const saveButton =
            document.getElementById(
                "huntJournalSaveButton"
            );

        const clearButton =
            document.getElementById(
                "huntJournalClearButton"
            );

            const speciesSelect =
    document.getElementById(
        "huntJournalSpecies"
    );


if (speciesSelect) {

    speciesSelect.addEventListener(
        "change",
        () => {

            this.updateSpeciesFields();
        }
    );
}

            const locationSelect =
    document.getElementById(
        "huntJournalLocation"
    );


if (locationSelect) {

    locationSelect.addEventListener(
        "change",
        async () => {

            await this.loadCurrentWeather();

            this.prefillFromHuntBoard();
        }
    );
}

        if (saveButton) {

            saveButton.addEventListener(
                "click",
                () => {
                    this.saveEntry();
                }
            );
        }


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                () => {
                    this.clearForm();
                }
            );
        }
    },


    async saveEntry() {

        this.clearMessages();


        const saveButton =
            document.getElementById(
                "huntJournalSaveButton"
            );


        const entry =
            this.collectEntry();


        if (!entry.date) {

            this.showError(
                "Please enter the hunt date."
            );

            return;
        }


        if (!entry.gameSpecies) {

            this.showError(
                "Please select the game species."
            );

            return;
        }


        try {

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";
            }


            const response =
                await Database
                    .saveHuntJournalEntry(
                        entry
                    );


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response &&
                    response.error
                        ? response.error
                        : "Unable to save the journal entry."
                );
            }


            this.showSuccess(
                "Hunt journal entry saved."
            );

            await this.loadJournal();

this.renderHistory();

        } catch (error) {

            console.error(
                "Hunt Journal save error:",
                error
            );

            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Unable to save the journal entry."
            );


        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "Save Journal Entry";
            }
        }
    },


    collectEntry() {

        const getValue =
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );

                return element
                    ? String(
                        element.value || ""
                    ).trim()
                    : "";
            };


        return {

            date:
                getValue(
                    "huntJournalDate"
                ),

            startTime:
                getValue(
                    "huntJournalStartTime"
                ),

            endTime:
                getValue(
                    "huntJournalEndTime"
                ),

            locationId:
                getValue(
                    "huntJournalLocation"
                ),

            huntType:
                getValue(
                    "huntJournalHuntType"
                ),

            gameSpecies:
                getValue(
                    "huntJournalSpecies"
                ),

            weather:
                getValue(
                    "huntJournalWeather"
                ),

            temperature:
                getValue(
                    "huntJournalTemperature"
                ),

            windDirection:
                getValue(
                    "huntJournalWindDirection"
                ),

            windSpeed:
                getValue(
                    "huntJournalWindSpeed"
                ),

            moonPhase:
                getValue(
                    "huntJournalMoonPhase"
                ),

            pressure:
                getValue(
                    "huntJournalPressure"
                ),

            precipitation:
                getValue(
                    "huntJournalPrecipitation"
                ),

            weapon:
                getValue(
                    "huntJournalWeapon"
                ),

            ammunition:
                getValue(
                    "huntJournalAmmunition"
                ),

            coHunters:
                getValue(
                    "huntJournalCoHunters"
                ),

            terrain:
                getValue(
                    "huntJournalTerrain"
                ),

            accessRoute:
                getValue(
                    "huntJournalAccessRoute"
                ),

            targetArea:
                getValue(
                    "huntJournalTargetArea"
                ),

            animalsSeen:
                getValue(
                    "huntJournalAnimalsSeen"
                ),

            quantity:
                getValue(
                    "huntJournalQuantity"
                ),

            sex:
                getValue(
                    "huntJournalSex"
                ),

            estimatedAge:
                getValue(
                    "huntJournalEstimatedAge"
                ),

            movementDirection:
                getValue(
                    "huntJournalMovementDirection"
                ),

            behavior:
                getValue(
                    "huntJournalBehavior"
                ),

            distance:
                getValue(
                    "huntJournalDistance"
                ),

            shotOpportunity:
                getValue(
                    "huntJournalShotOpportunity"
                ),

            result:
                getValue(
                    "huntJournalResult"
                ),

            animalHarvested:
                getValue(
                    "huntJournalAnimalHarvested"
                ),

            shotDistance:
                getValue(
                    "huntJournalShotDistance"
                ),

            recoveryDistance:
                getValue(
                    "huntJournalRecoveryDistance"
                ),

            trackingNotes:
                getValue(
                    "huntJournalTrackingNotes"
                ),

            strategy:
                getValue(
                    "huntJournalStrategy"
                ),

            whatWorked:
                getValue(
                    "huntJournalWhatWorked"
                ),

            whatDidNotWork:
                getValue(
                    "huntJournalWhatDidNotWork"
                ),

            nextTime:
                getValue(
                    "huntJournalNextTime"
                ),

            notes:
                getValue(
                    "huntJournalNotes"
                )

        };
    },


    async clearForm() {

        const controls =
            document.querySelectorAll(
                ".hunt-journal-page input, " +
                ".hunt-journal-page select, " +
                ".hunt-journal-page textarea"
            );


        controls.forEach(
            function (control) {

                control.value =
                    "";
            }
        );


        this.clearMessages();

        this.setDefaultDateTime();

        await this.populateLocations();

await this.loadCurrentWeather();

this.prefillFromHuntBoard();

    },

    renderHistory() {

    const historyContainer =
        document.getElementById(
            "huntJournalHistory"
        );


    if (!historyContainer) {
        return;
    }


    const entries =
        this.data &&
        Array.isArray(
            this.data.entries
        )
            ? this.data.entries
            : [];


    historyContainer.innerHTML =
        "";


    if (
        entries.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.style.padding =
            "18px";

        empty.style.border =
            "1px dashed #9d8a67";

        empty.style.borderRadius =
            "10px";

        empty.style.background =
            "rgba(255,253,244,0.55)";

        empty.style.color =
            "#6f644f";

        empty.style.textAlign =
            "center";

        empty.style.fontWeight =
            "700";

        empty.textContent =
            "No journal entries yet.";


        historyContainer.appendChild(
            empty
        );

        return;
    }


    entries
        .slice(
            0,
            20
        )
        .forEach(
            entry => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.style.border =
                    "1px solid #a89572";

                card.style.borderRadius =
                    "12px";

                card.style.background =
                    "rgba(255,253,244,0.88)";

                card.style.padding =
                    "16px";

                card.style.boxShadow =
                    "0 3px 10px rgba(73,59,36,0.08)";


                /*
                 * HEADER
                 */

                const header =
                    document.createElement(
                        "div"
                    );


                header.style.display =
                    "flex";

                header.style.justifyContent =
                    "space-between";

                header.style.alignItems =
                    "flex-start";

                header.style.gap =
                    "12px";

                header.style.flexWrap =
                    "wrap";


                const headingArea =
                    document.createElement(
                        "div"
                    );


                const species =
                    document.createElement(
                        "div"
                    );


                species.style.fontSize =
                    "1.08rem";

                species.style.fontWeight =
                    "900";

                species.style.color =
                    "#394a2f";

                species.textContent =
                    entry[
                        "Game Species"
                    ] ||
                    "Hunt";


                const location =
                    document.createElement(
                        "div"
                    );


                location.style.marginTop =
                    "3px";

                location.style.fontSize =
                    "0.85rem";

                location.style.color =
                    "#756a54";


                const locationName =
                    entry[
                        "Location Name"
                    ] || "";


                const huntType =
                    entry[
                        "Hunt Type"
                    ] || "";


                location.textContent =
                    [
                        locationName,
                        huntType
                    ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " • "
                    );


                headingArea.appendChild(
                    species
                );

                headingArea.appendChild(
                    location
                );


                const date =
                    document.createElement(
                        "div"
                    );


                date.style.fontWeight =
                    "900";

                date.style.color =
                    "#5e533f";

                date.style.fontSize =
                    "0.9rem";

                date.textContent =
                    this.formatJournalDate(
                        entry["Date"]
                    );


                header.appendChild(
                    headingArea
                );

                header.appendChild(
                    date
                );


                card.appendChild(
                    header
                );


                /*
                 * QUICK DETAILS
                 */

                const details =
                    document.createElement(
                        "div"
                    );


                details.style.display =
                    "flex";

                details.style.flexWrap =
                    "wrap";

                details.style.gap =
                    "8px";

                details.style.marginTop =
                    "12px";


                const detailItems =
                    [];


                if (
                    entry["Result"]
                ) {

                    detailItems.push(
                        "Result: " +
                        entry["Result"]
                    );
                }


                if (
                    entry["Weather"]
                ) {

                    detailItems.push(
                        entry["Weather"]
                    );
                }


                if (
                    entry["Temperature"]
                ) {

                    detailItems.push(
                        entry[
                            "Temperature"
                        ]
                    );
                }


                if (
                    entry["Wind Direction"]
                ) {

                    let wind =
                        "Wind " +
                        entry[
                            "Wind Direction"
                        ];


                    if (
                        entry[
                            "Wind Speed"
                        ]
                    ) {

                        wind +=
                            " " +
                            entry[
                                "Wind Speed"
                            ];
                    }


                    detailItems.push(
                        wind
                    );
                }


                detailItems.forEach(
                    text => {

                        const chip =
                            document.createElement(
                                "span"
                            );


                        chip.style.padding =
                            "6px 9px";

                        chip.style.borderRadius =
                            "999px";

                        chip.style.background =
                            "#e4dcc8";

                        chip.style.color =
                            "#554c3b";

                        chip.style.fontSize =
                            "0.76rem";

                        chip.style.fontWeight =
                            "800";

                        chip.textContent =
                            text;


                        details.appendChild(
                            chip
                        );
                    }
                );


                card.appendChild(
                    details
                );


                /*
                 * ACTIVITY SUMMARY
                 */

                if (
                    entry[
                        "Animals Seen"
                    ]
                ) {

                    const activity =
                        document.createElement(
                            "div"
                        );


                    activity.style.marginTop =
                        "12px";

                    activity.style.fontSize =
                        "0.88rem";

                    activity.style.color =
                        "#4d493d";


                    let activityText =
                        "Seen: " +
                        entry[
                            "Animals Seen"
                        ];


                    if (
                        entry[
                            "Quantity"
                        ]
                    ) {

                        activityText +=
                            " (" +
                            entry[
                                "Quantity"
                            ] +
                            ")";
                    }


                    activity.textContent =
                        activityText;


                    card.appendChild(
                        activity
                    );
                }


                /*
                 * NOTES PREVIEW
                 */

                if (
                    entry["Notes"]
                ) {

                    const notes =
                        document.createElement(
                            "div"
                        );


                    notes.style.marginTop =
                        "10px";

                    notes.style.paddingTop =
                        "10px";

                    notes.style.borderTop =
                        "1px solid rgba(73,59,36,0.16)";

                    notes.style.fontSize =
                        "0.84rem";

                    notes.style.lineHeight =
                        "1.45";

                    notes.style.color =
                        "#665d4c";


                    const noteText =
                        String(
                            entry["Notes"]
                        );


                    notes.textContent =
                        noteText.length >
                        180
                            ? noteText.slice(
                                0,
                                180
                            ) +
                            "..."
                            : noteText;


                    card.appendChild(
                        notes
                    );
                }


                historyContainer.appendChild(
                    card
                );
            }
        );
},


formatJournalDate(
    value
) {

    if (!value) {
        return "";
    }


    const text =
        String(
            value
        ).trim();


    const simpleDate =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (simpleDate) {

        const date =
            new Date(
                Number(
                    simpleDate[1]
                ),
                Number(
                    simpleDate[2]
                ) - 1,
                Number(
                    simpleDate[3]
                )
            );


        return date.toLocaleDateString(
            undefined,
            {
                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric"
            }
        );
    }


    const date =
        new Date(
            text
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return text;
    }


    return date.toLocaleDateString(
        undefined,
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    );
},

    updateSpeciesFields() {

    const speciesSelect =
        document.getElementById(
            "huntJournalSpecies"
        );

    if (!speciesSelect) {
        return;
    }


    const species =
        speciesSelect.value;


    const animalsLabel =
        document.getElementById(
            "huntJournalAnimalsSeenLabel"
        );

    const animalsInput =
        document.getElementById(
            "huntJournalAnimalsSeen"
        );

    const sexLabel =
        document.getElementById(
            "huntJournalSexLabel"
        );

    const sexSelect =
        document.getElementById(
            "huntJournalSex"
        );

    const ageField =
        document.getElementById(
            "huntJournalEstimatedAgeField"
        );

    const ageLabel =
        document.getElementById(
            "huntJournalEstimatedAgeLabel"
        );

    const movementLabel =
        document.getElementById(
            "huntJournalMovementDirectionLabel"
        );

    const behaviorLabel =
        document.getElementById(
            "huntJournalBehaviorLabel"
        );

    const behaviorInput =
        document.getElementById(
            "huntJournalBehavior"
        );

    const distanceLabel =
        document.getElementById(
            "huntJournalDistanceLabel"
        );


    const setSexOptions =
        function (
            label,
            options
        ) {

            if (sexLabel) {
                sexLabel.textContent =
                    label;
            }


            if (!sexSelect) {
                return;
            }


            const previousValue =
                sexSelect.value;


            sexSelect.innerHTML =
                '<option value="">Select</option>';


            options.forEach(
                function (option) {

                    const element =
                        document.createElement(
                            "option"
                        );

                    element.value =
                        option;

                    element.textContent =
                        option;

                    sexSelect.appendChild(
                        element
                    );
                }
            );


            if (
                options.includes(
                    previousValue
                )
            ) {

                sexSelect.value =
                    previousValue;
            }
        };


    /*
     * DEFAULT / GENERIC
     */

    if (animalsLabel) {
        animalsLabel.textContent =
            "Animals Seen";
    }

    if (animalsInput) {
        animalsInput.placeholder =
            "Species / description";
    }

    if (ageField) {
        ageField.style.display =
            "";
    }

    if (ageLabel) {
        ageLabel.textContent =
            "Estimated Age";
    }

    if (movementLabel) {
        movementLabel.textContent =
            "Movement Direction";
    }

    if (behaviorLabel) {
        behaviorLabel.textContent =
            "Behavior";
    }

    if (behaviorInput) {
        behaviorInput.placeholder =
            "Feeding, traveling, chasing...";
    }

    if (distanceLabel) {
        distanceLabel.textContent =
            "Distance";
    }


    setSexOptions(
        "Sex",
        [
            "Male",
            "Female",
            "Mixed",
            "Unknown"
        ]
    );


    /*
     * WHITETAIL DEER
     */

    if (
        species ===
        "Whitetail Deer"
    ) {

        if (animalsLabel) {
            animalsLabel.textContent =
                "Deer Seen";
        }

        if (animalsInput) {
            animalsInput.placeholder =
                "Buck, doe, fawn, description...";
        }

        setSexOptions(
            "Buck / Doe",
            [
                "Buck",
                "Doe",
                "Mixed",
                "Unknown"
            ]
        );

        if (ageLabel) {
            ageLabel.textContent =
                "Estimated Age";
        }

        if (behaviorInput) {
            behaviorInput.placeholder =
                "Feeding, traveling, chasing, bedding...";
        }

        return;
    }


    /*
     * TURKEY
     */

    if (
        species ===
        "Turkey"
    ) {

        if (animalsLabel) {
            animalsLabel.textContent =
                "Turkeys Seen";
        }

        if (animalsInput) {
            animalsInput.placeholder =
                "Tom, jake, hen, flock...";
        }

        setSexOptions(
            "Tom / Hen",
            [
                "Tom",
                "Jake",
                "Hen",
                "Mixed",
                "Unknown"
            ]
        );

        if (ageLabel) {
            ageLabel.textContent =
                "Estimated Age";
        }

        if (movementLabel) {
            movementLabel.textContent =
                "Travel Direction";
        }

        if (behaviorInput) {
            behaviorInput.placeholder =
                "Gobbling, feeding, strutting, traveling...";
        }

        return;
    }


    /*
     * BLACK BEAR
     */

    if (
        species ===
        "Black Bear"
    ) {

        if (animalsLabel) {
            animalsLabel.textContent =
                "Bears Seen";
        }

        if (animalsInput) {
            animalsInput.placeholder =
                "Bear description";
        }

        setSexOptions(
            "Boar / Sow",
            [
                "Boar",
                "Sow",
                "Unknown"
            ]
        );

        if (behaviorInput) {
            behaviorInput.placeholder =
                "Feeding, traveling, cautious, aggressive...";
        }

        return;
    }


    /*
     * WATERFOWL
     */

    if (
        species ===
        "Waterfowl"
    ) {

        if (animalsLabel) {
            animalsLabel.textContent =
                "Birds / Flocks Seen";
        }

        if (animalsInput) {
            animalsInput.placeholder =
                "Species, flock size, description...";
        }

        setSexOptions(
            "Drake / Hen",
            [
                "Drake",
                "Hen",
                "Mixed",
                "Unknown"
            ]
        );

        if (ageField) {
            ageField.style.display =
                "none";
        }

        if (movementLabel) {
            movementLabel.textContent =
                "Flight Direction";
        }

        if (behaviorInput) {
            behaviorInput.placeholder =
                "Passing, circling, committing, landing...";
        }

        return;
    }


    /*
     * SMALL GAME
     */

    if (
        species ===
        "Small Game"
    ) {

        if (animalsLabel) {
            animalsLabel.textContent =
                "Small Game Seen";
        }

        if (animalsInput) {
            animalsInput.placeholder =
                "Rabbit, squirrel, grouse...";
        }

        if (ageField) {
            ageField.style.display =
                "none";
        }

        if (behaviorInput) {
            behaviorInput.placeholder =
                "Feeding, moving, flushing, stationary...";
        }

        return;
    }


    /*
     * COYOTE / OTHER PREDATOR
     */

    if (
        species === "Coyote" ||
        species === "Predator"
    ) {

        if (animalsLabel) {
            animalsLabel.textContent =
                "Predators Seen";
        }

        if (animalsInput) {
            animalsInput.placeholder =
                "Species / description";
        }

        if (ageField) {
            ageField.style.display =
                "none";
        }

        if (behaviorInput) {
            behaviorInput.placeholder =
                "Traveling, calling, circling, responding...";
        }

        return;
    }
},

weatherCodeName(
    code
) {

    if (
        code === 0
    ) {

        return "Clear";
    }


    if (
        [
            1,
            2
        ].includes(
            code
        )
    ) {

        return "Partly Cloudy";
    }


    if (
        code === 3
    ) {

        return "Cloudy";
    }


    if (
        [
            45,
            48
        ].includes(
            code
        )
    ) {

        return "Fog";
    }


    if (
        [
            51,
            53,
            55,
            56,
            57,
            61,
            63,
            65,
            66,
            67,
            80,
            81,
            82
        ].includes(
            code
        )
    ) {

        return "Rain";
    }


    if (
        [
            71,
            73,
            75,
            77,
            85,
            86
        ].includes(
            code
        )
    ) {

        return "Snow";
    }


    if (
        [
            95,
            96,
            99
        ].includes(
            code
        )
    ) {

        return "Storm";
    }


    return "Other";
},

    windDirectionName(
        degrees
    ) {

        if (
            !Number.isFinite(
                degrees
            )
        ) {

            return "";
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


    getMoonPhaseName() {

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


        if (
            phaseFraction < 0.0625 ||
            phaseFraction >= 0.9375
        ) {

            return "New Moon";
        }

        if (
            phaseFraction < 0.1875
        ) {

            return "Waxing Crescent";
        }

        if (
            phaseFraction < 0.3125
        ) {

            return "First Quarter";
        }

        if (
            phaseFraction < 0.4375
        ) {

            return "Waxing Gibbous";
        }

        if (
            phaseFraction < 0.5625
        ) {

            return "Full Moon";
        }

        if (
            phaseFraction < 0.6875
        ) {

            return "Waning Gibbous";
        }

        if (
            phaseFraction < 0.8125
        ) {

            return "Last Quarter";
        }


        return "Waning Crescent";
    },


    showError(
        message
    ) {

        const box =
            document.getElementById(
                "huntJournalError"
            );


        if (!box) {
            return;
        }


        box.textContent =
            message;

        box.style.display =
            "block";
    },


    showSuccess(
        message
    ) {

        const box =
            document.getElementById(
                "huntJournalSuccess"
            );


        if (!box) {
            return;
        }


        box.textContent =
            message;

        box.style.display =
            "block";
    },


    clearMessages() {

        const errorBox =
            document.getElementById(
                "huntJournalError"
            );

        const successBox =
            document.getElementById(
                "huntJournalSuccess"
            );


        if (errorBox) {

            errorBox.textContent =
                "";

            errorBox.style.display =
                "none";
        }


        if (successBox) {

            successBox.textContent =
                "";

            successBox.style.display =
                "none";
        }
    }

};


HuntJournal.init();