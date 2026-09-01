// ==========================================
// WAC Maintenance Center
// Version 1.0
// ==========================================

(async function () {

    try {

        //--------------------------------------------------
        // Load Maintenance Center Data
        //--------------------------------------------------

        const response =
            await Database.getMaintenanceCenter();

        const equipment =
            Array.isArray(
                response.equipment
            )
                ? response.equipment
                : [];

        const schedules =
            Array.isArray(
                response.schedules
            )
                ? response.schedules
                : [];

        const parts =
            Array.isArray(
                response.parts
            )
                ? response.parts
                : [];

        const logs =
            Array.isArray(
                response.logs
            )
                ? response.logs
                : [];


        //--------------------------------------------------
        // Store Current Page State
        //--------------------------------------------------

        window.WACMaintenance = {

            currentMember:
                response.currentMember || null,

            equipment:
                equipment,

            schedules:
                schedules,

            parts:
                parts,

            logs:
                logs

        };


        //--------------------------------------------------
        // Render Dashboard
        //--------------------------------------------------

        renderMaintenanceSummary(
            equipment,
            schedules,
            logs
        );

        renderEquipmentList(
            equipment,
            schedules,
            logs
        );

        renderMaintenanceHistory(
            equipment,
            logs
        );

        renderMaintenanceDue(
            equipment,
            schedules,
            logs
        );

    }

    catch (error) {

        console.error(
            "Maintenance Center Error:",
            error
        );

        showMaintenanceLoadError(
            error
        );

    }

})();


//--------------------------------------------------
// Dashboard Summary
//--------------------------------------------------

function renderMaintenanceSummary(
    equipment,
    schedules,
    logs
) {

    setMaintenanceText(
        "maintenanceEquipmentCount",
        equipment.length
    );

    setMaintenanceText(
        "maintenanceLogCount",
        logs.length
    );


    const statuses =
        calculateMaintenanceStatuses(
            equipment,
            schedules,
            logs
        );


    const dueSoonCount =
        statuses.filter(
            (item) =>
                item.status ===
                "due-soon"
        ).length;


    const overdueCount =
        statuses.filter(
            (item) =>
                item.status ===
                "overdue"
        ).length;


    setMaintenanceText(
        "maintenanceDueSoonCount",
        dueSoonCount
    );

    setMaintenanceText(
        "maintenanceOverdueCount",
        overdueCount
    );

}


//--------------------------------------------------
// Equipment List
//--------------------------------------------------

function renderEquipmentList(
    equipment,
    schedules,
    logs
) {

    const container =
        document.getElementById(
            "maintenanceEquipmentList"
        );

    if (!container) {

        return;

    }


    if (!equipment.length) {

        container.className =
            "maintenance-empty-state";

        container.innerHTML =
            `
                <strong>
                    No equipment found.
                </strong>

                <p>
                    Add equipment to the Equipment sheet
                    to begin tracking maintenance.
                </p>
            `;

        return;

    }


    container.className =
        "maintenance-equipment-grid";

    container.innerHTML =
        "";


    equipment.forEach(
        (item) => {

            const equipmentId =
                cleanMaintenanceText(
                    item[
                        "Equipment ID"
                    ]
                );

            const name =
                cleanMaintenanceText(
                    item[
                        "Equipment Name"
                    ]
                ) ||
                equipmentId ||
                "Equipment";

            const manufacturer =
                cleanMaintenanceText(
                    item[
                        "Manufacturer"
                    ]
                );

            const model =
                cleanMaintenanceText(
                    item[
                        "Model"
                    ]
                );

            const year =
                cleanMaintenanceText(
                    item[
                        "Year"
                    ]
                );


            const itemSchedules =
                schedules.filter(
                    (schedule) => {

                        return (
                            cleanMaintenanceText(
                                schedule[
                                    "Equipment ID"
                                ]
                            ) ===
                            equipmentId
                        );

                    }
                );


            const itemLogs =
                logs.filter(
                    (log) => {

                        return (
                            cleanMaintenanceText(
                                log[
                                    "Equipment ID"
                                ]
                            ) ===
                            equipmentId
                        );

                    }
                );


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "maintenance-equipment-card";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                name;


            const identity =
                document.createElement(
                    "p"
                );

            identity.className =
                "maintenance-equipment-identity";

            identity.textContent =
                [
                    year,
                    manufacturer,
                    model
                ]
                    .filter(Boolean)
                    .join(" ") ||
                "Equipment details not entered";


            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "maintenance-equipment-meta";


            const serviceCount =
                document.createElement(
                    "span"
                );

            serviceCount.textContent =
                `${itemLogs.length} service ${
                    itemLogs.length === 1
                        ? "record"
                        : "records"
                }`;


            const scheduleCount =
                document.createElement(
                    "span"
                );

            scheduleCount.textContent =
                `${itemSchedules.length} scheduled ${
                    itemSchedules.length === 1
                        ? "item"
                        : "items"
                }`;


            meta.append(
                serviceCount,
                scheduleCount
            );


            card.append(
                title,
                identity,
                meta
            );


            container.appendChild(
                card
            );

        }
    );

}


//--------------------------------------------------
// Recent Maintenance History
//--------------------------------------------------

function renderMaintenanceHistory(
    equipment,
    logs
) {

    const container =
        document.getElementById(
            "maintenanceHistoryList"
        );

    if (!container) {

        return;

    }


    if (!logs.length) {

        container.className =
            "maintenance-empty-state";

        container.innerHTML =
            `
                <strong>
                    No maintenance records yet.
                </strong>

                <p>
                    Completed maintenance will appear here.
                </p>
            `;

        return;

    }


    container.className =
        "maintenance-history-list";

    container.innerHTML =
        "";


    logs
        .slice(0, 10)
        .forEach(
            (log) => {

                const equipmentId =
                    cleanMaintenanceText(
                        log[
                            "Equipment ID"
                        ]
                    );

                const equipmentRecord =
                    equipment.find(
                        (item) => {

                            return (
                                cleanMaintenanceText(
                                    item[
                                        "Equipment ID"
                                    ]
                                ) ===
                                equipmentId
                            );

                        }
                    );


                const equipmentName =
                    equipmentRecord
                        ? cleanMaintenanceText(
                            equipmentRecord[
                                "Equipment Name"
                            ]
                        )
                        : equipmentId;


                const row =
                    document.createElement(
                        "article"
                    );

                row.className =
                    "maintenance-history-card";


                const heading =
                    document.createElement(
                        "div"
                    );

                heading.className =
                    "maintenance-history-heading";


                const title =
                    document.createElement(
                        "h3"
                    );

                title.textContent =
                    cleanMaintenanceText(
                        log[
                            "Maintenance Type"
                        ]
                    ) ||
                    "Maintenance";


                const equipmentLabel =
                    document.createElement(
                        "span"
                    );

                equipmentLabel.textContent =
                    equipmentName ||
                    "Unknown Equipment";


                heading.append(
                    title,
                    equipmentLabel
                );


                const details =
                    document.createElement(
                        "div"
                    );

                details.className =
                    "maintenance-history-meta";


                const completedDate =
                    cleanMaintenanceText(
                        log[
                            "Completed Date"
                        ]
                    );


                const completedBy =
                    cleanMaintenanceText(
                        log[
                            "Completed By"
                        ]
                    );


                const hours =
                    cleanMaintenanceText(
                        log[
                            "Hours"
                        ]
                    );


                const mileage =
                    cleanMaintenanceText(
                        log[
                            "Mileage"
                        ]
                    );


                [
                    completedDate,
                    completedBy
                        ? `By ${completedBy}`
                        : "",
                    hours
                        ? `${hours} hrs`
                        : "",
                    mileage
                        ? `${mileage} mi`
                        : ""
                ]
                    .filter(Boolean)
                    .forEach(
                        (value) => {

                            const span =
                                document.createElement(
                                    "span"
                                );

                            span.textContent =
                                value;

                            details.appendChild(
                                span
                            );

                        }
                    );


                row.append(
                    heading,
                    details
                );


                container.appendChild(
                    row
                );

            }
        );

}


//--------------------------------------------------
// Maintenance Due
//--------------------------------------------------

function renderMaintenanceDue(
    equipment,
    schedules,
    logs
) {

    const container =
        document.getElementById(
            "maintenanceDueList"
        );

    if (!container) {

        return;

    }


    const statuses =
        calculateMaintenanceStatuses(
            equipment,
            schedules,
            logs
        );


    if (!statuses.length) {

        container.className =
            "maintenance-empty-state";

        container.innerHTML =
            `
                <strong>
                    No maintenance schedules configured.
                </strong>

                <p>
                    Add maintenance requirements to the
                    MaintenanceSchedule sheet.
                </p>
            `;

        return;

    }


    container.className =
        "maintenance-due-list";

    container.innerHTML =
        "";


    statuses.forEach(
        (item) => {

            const row =
                document.createElement(
                    "article"
                );

            row.className =
                `maintenance-due-card maintenance-status-${item.status}`;


            const heading =
                document.createElement(
                    "div"
                );

            heading.className =
                "maintenance-due-heading";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                item.maintenanceType;


            const equipmentLabel =
                document.createElement(
                    "span"
                );

            equipmentLabel.textContent =
                item.equipmentName;


            heading.append(
                title,
                equipmentLabel
            );


            const status =
                document.createElement(
                    "strong"
                );

            status.className =
                "maintenance-status-label";

            status.textContent =
                getMaintenanceStatusLabel(
                    item.status
                );


            const detail =
                document.createElement(
                    "p"
                );

            detail.textContent =
                item.detail;


            row.append(
                heading,
                status,
                detail
            );


            container.appendChild(
                row
            );

        }
    );

}


//--------------------------------------------------
// Calculate Maintenance Statuses
//--------------------------------------------------

function calculateMaintenanceStatuses(
    equipment,
    schedules,
    logs
) {

    const results =
        [];


    schedules.forEach(
        (schedule) => {

            const equipmentId =
                cleanMaintenanceText(
                    schedule[
                        "Equipment ID"
                    ]
                );


            const equipmentRecord =
                equipment.find(
                    (item) => {

                        return (
                            cleanMaintenanceText(
                                item[
                                    "Equipment ID"
                                ]
                            ) ===
                            equipmentId
                        );

                    }
                );


            if (!equipmentRecord) {

                return;

            }


            const maintenanceType =
                cleanMaintenanceText(
                    schedule[
                        "Maintenance Type"
                    ]
                );


            const relatedLogs =
                logs.filter(
                    (log) => {

                        return (
                            cleanMaintenanceText(
                                log[
                                    "Equipment ID"
                                ]
                            ) ===
                                equipmentId &&
                            cleanMaintenanceText(
                                log[
                                    "Maintenance Type"
                                ]
                            ).toLowerCase() ===
                                maintenanceType.toLowerCase()
                        );

                    }
                );


            const latestLog =
                relatedLogs.length
                    ? relatedLogs[0]
                    : null;


            const equipmentName =
                cleanMaintenanceText(
                    equipmentRecord[
                        "Equipment Name"
                    ]
                ) ||
                equipmentId;


            const currentHours =
                toMaintenanceNumber(
                    equipmentRecord[
                        "Current Hours"
                    ]
                );


            const currentMileage =
                toMaintenanceNumber(
                    equipmentRecord[
                        "Current Mileage"
                    ]
                );


            const intervalHours =
                toMaintenanceNumber(
                    schedule[
                        "Interval Hours"
                    ]
                );


            const intervalMiles =
                toMaintenanceNumber(
                    schedule[
                        "Interval Miles"
                    ]
                );


            const intervalMonths =
                toMaintenanceNumber(
                    schedule[
                        "Interval Months"
                    ]
                );


            const warningHours =
                toMaintenanceNumber(
                    schedule[
                        "Warning Hours"
                    ]
                );


            const warningMiles =
                toMaintenanceNumber(
                    schedule[
                        "Warning Miles"
                    ]
                );


            const warningDays =
                toMaintenanceNumber(
                    schedule[
                        "Warning Days"
                    ]
                );


            let status =
                "current";

            const detailParts =
                [];


            //--------------------------------------------------
            // Hour-Based
            //--------------------------------------------------

            if (
                intervalHours > 0 &&
                currentHours !== null
            ) {

                const lastHours =
                    latestLog
                        ? toMaintenanceNumber(
                            latestLog[
                                "Hours"
                            ]
                        )
                        : 0;


                const nextHours =
                    (
                        lastHours || 0
                    ) +
                    intervalHours;


                detailParts.push(
                    `Next at ${nextHours} hrs`
                );


                if (
                    currentHours >=
                    nextHours
                ) {

                    status =
                        "overdue";

                }

                else if (
                    warningHours > 0 &&
                    currentHours >=
                        nextHours -
                        warningHours
                ) {

                    status =
                        "due-soon";

                }

            }


            //--------------------------------------------------
            // Mileage-Based
            //--------------------------------------------------

            if (
                intervalMiles > 0 &&
                currentMileage !== null
            ) {

                const lastMileage =
                    latestLog
                        ? toMaintenanceNumber(
                            latestLog[
                                "Mileage"
                            ]
                        )
                        : 0;


                const nextMileage =
                    (
                        lastMileage || 0
                    ) +
                    intervalMiles;


                detailParts.push(
                    `Next at ${nextMileage} mi`
                );


                if (
                    currentMileage >=
                    nextMileage
                ) {

                    status =
                        "overdue";

                }

                else if (
                    status !== "overdue" &&
                    warningMiles > 0 &&
                    currentMileage >=
                        nextMileage -
                        warningMiles
                ) {

                    status =
                        "due-soon";

                }

            }


            //--------------------------------------------------
            // Time-Based
            //--------------------------------------------------

            if (
                intervalMonths > 0
            ) {

                const lastDate =
                    latestLog
                        ? parseMaintenanceDate(
                            latestLog[
                                "Completed Date"
                            ]
                        )
                        : null;


                if (lastDate) {

                    const nextDate =
                        new Date(
                            lastDate
                        );

                    nextDate.setMonth(
                        nextDate.getMonth() +
                        intervalMonths
                    );


                    detailParts.push(
                        `Next ${formatMaintenanceDate(
                            nextDate
                        )}`
                    );


                    const today =
                        new Date();

                    today.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    if (
                        today >=
                        nextDate
                    ) {

                        status =
                            "overdue";

                    }

                    else if (
                        status !== "overdue" &&
                        warningDays > 0
                    ) {

                        const warningDate =
                            new Date(
                                nextDate
                            );

                        warningDate.setDate(
                            warningDate.getDate() -
                            warningDays
                        );


                        if (
                            today >=
                            warningDate
                        ) {

                            status =
                                "due-soon";

                        }

                    }

                }

                else {

                    detailParts.push(
                        "No previous service date"
                    );

                }

            }


            results.push({

                equipmentId:
                    equipmentId,

                equipmentName:
                    equipmentName,

                maintenanceType:
                    maintenanceType,

                status:
                    status,

                detail:
                    detailParts.join(
                        " • "
                    ) ||
                    "Schedule configured"

            });

        }
    );


    const order = {

        overdue: 0,
        "due-soon": 1,
        current: 2

    };


    results.sort(
        (firstItem, secondItem) => {

            return (
                order[
                    firstItem.status
                ] -
                order[
                    secondItem.status
                ]
            );

        }
    );


    return results;

}


//--------------------------------------------------
// Status Label
//--------------------------------------------------

function getMaintenanceStatusLabel(
    status
) {

    if (
        status === "overdue"
    ) {

        return "OVERDUE";

    }


    if (
        status === "due-soon"
    ) {

        return "DUE SOON";

    }


    return "CURRENT";

}


//--------------------------------------------------
// Date Helpers
//--------------------------------------------------

function parseMaintenanceDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        value instanceof Date &&
        !Number.isNaN(
            value.getTime()
        )
    ) {

        return value;

    }


    const text =
        cleanMaintenanceText(
            value
        );


    const slashMatch =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (slashMatch) {

        return new Date(

            Number(
                slashMatch[3]
            ),

            Number(
                slashMatch[1]
            ) - 1,

            Number(
                slashMatch[2]
            )

        );

    }


    const parsed =
        new Date(
            text
        );


    return Number.isNaN(
        parsed.getTime()
    )
        ? null
        : parsed;

}


function formatMaintenanceDate(
    date
) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


//--------------------------------------------------
// Helpers
//--------------------------------------------------

function cleanMaintenanceText(
    value
) {

    return String(
        value ?? ""
    ).trim();

}


function toMaintenanceNumber(
    value
) {

    const text =
        cleanMaintenanceText(
            value
        );


    if (!text) {

        return null;

    }


    const number =
        Number(
            text
        );


    return Number.isFinite(
        number
    )
        ? number
        : null;

}


function setMaintenanceText(
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
// Load Error
//--------------------------------------------------

function showMaintenanceLoadError(
    error
) {

    const message =
        error &&
        error.message
            ? error.message
            : "Maintenance Center could not be loaded.";


    [
        "maintenanceDueList",
        "maintenanceEquipmentList",
        "maintenanceHistoryList"
    ]
        .forEach(
            (elementId) => {

                const element =
                    document.getElementById(
                        elementId
                    );

                if (!element) {

                    return;

                }

                element.className =
                    "maintenance-empty-state";

                element.innerHTML =
                    `
                        <strong>
                            Maintenance Center Unavailable
                        </strong>

                        <p>
                            ${escapeMaintenanceHtml(
                                message
                            )}
                        </p>
                    `;

            }
        );

}


function escapeMaintenanceHtml(
    value
) {

    return cleanMaintenanceText(
        value
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