window.HuntJournal = {

    data: null,


    async init() {

        try {

            await this.loadJournal();

            this.setDefaultDateTime();

           await this.populateLocations();

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

this.prefillFromHuntBoard();
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