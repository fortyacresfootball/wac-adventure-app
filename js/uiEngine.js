// ======================================
// WAC UI Engine
// Version 3.0
// ======================================

const UI = {

    //------------------------------------
    // Badge Card
    //------------------------------------

    badgeCard(adventure) {

    return `

        <div class="badge-card" data-id="${adventure.ID}">

            <img
                src="assets/badges/B-01.webp"
                alt="${adventure.Title}"
                class="badge-image"
                loading="lazy">

            <div class="badge-title">

                ${adventure.Title}

            </div>

            <div class="badge-category">

                ${adventure.Category}

            </div>

            <div class="badge-footer">

                <span class="badge-id">

                    ${adventure.ID}

                </span>

            </div>

        </div>

    `;

},

    //------------------------------------
    // Achievement Card
    //------------------------------------

    achievementCard(achievement) {

        return `

            <div class="achievement-item">

                <div class="achievement-icon">

                    ${achievement.icon}

                </div>

                <div class="achievement-details">

                    <div class="achievement-title">

                        ${achievement.title}

                    </div>

                    <div class="achievement-description">

                        ${achievement.description}

                    </div>

                </div>

            </div>

        `;

    },

    //------------------------------------
    // Timeline Item
    //------------------------------------

    timelineItem(log, adventure) {

        const completedDate =
            log["Completed DateTime"] ||
            log["Date"] ||
            "";

        return `

            <div class="activity-row">

                <strong>

                    ${adventure["ID"]}

                </strong>

                <span>

                    ${adventure.Title}

                </span>

                <span>

                    ${completedDate}

                </span>

            </div>

        `;

    }

};