window.HuntBoard = {

    data: null,

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

        this.renderLocations();
        this.renderCheckInStatus();
        this.renderHunters();
        this.updateHunterCount();
    },


    bindEvents() {

        const checkInButton =
            document.getElementById(
                "huntCheckInButton"
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