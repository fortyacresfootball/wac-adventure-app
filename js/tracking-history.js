window.WACTrackingHistory = {

  async init() {

    const status =
      document.getElementById(
        "tracking-history-status"
      );

    const list =
      document.getElementById(
        "tracking-history-list"
      );


    if (
      !status ||
      !list
    ) {

      return;

    }


    try {

      const result =
        await Database
          .getTrackingHistory();


      const sessions =
        Array.isArray(
          result.sessions
        )
          ? result.sessions
          : [];


      if (
        !sessions.length
      ) {

        status.textContent =
          "No saved tracking sessions yet.";

        list.innerHTML =
          "";

        return;

      }


      status.textContent =
        sessions.length +
        (
          sessions.length === 1
            ? " saved track."
            : " saved tracks."
        );


      list.innerHTML =
        sessions
          .map(
            session => {

              const trackType =
                session[
                  "Track Type"
                ] ||
                "Track";

              const trackDate =
                session[
                  "Track Date"
                ] ||
                "";

              const durationSeconds =
                Number(
                  session[
                    "Duration Seconds"
                  ] ||
                  0
                );

              const distanceMiles =
                Number(
                  session[
                    "Total Distance Miles"
                  ] ||
                  0
                );

              const waypointCount =
                Number(
                  session[
                    "Waypoint Count"
                  ] ||
                  0
                );

                const points =
  Array.isArray(
    session[
      "Points"
    ]
  )
    ? session[
        "Points"
      ]
    : [];

              return `
                <div
  class="tracking-history-item"
  data-track-id="${session["Track ID"] || ""}"
  style="cursor: pointer;"
  onclick="
    window.WACTrackingHistory.openTrack(
      '${session["Track ID"] || ""}'
    )
  "
>

                  <h3>
                    ${trackType}
                  </h3>

                  <div>
                    ${trackDate}
                  </div>

                  <div class="tracking-history-meta">

                    <div>
                      <span>Distance</span>
                      <strong>
                        ${distanceMiles.toFixed(2)} mi
                      </strong>
                    </div>

                    <div>
                      <span>Duration</span>
                      <strong>
                        ${this.formatDuration(
                          durationSeconds
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Waypoints</span>
                      <strong>
                        ${waypointCount}
                      </strong>
                    </div>

                  </div>

                                    ${
                    points.length
                      ? `
                        <div style="margin-top: 14px;">

                          <strong style="color: #123b25;">
                            Waypoints
                          </strong>

                          <div style="margin-top: 8px; display: grid; gap: 6px;">

                            ${points
                              .map(
                                point => {

                                  return `
                                    <div>
                                      ${point["Point Type"] || "Waypoint"}
                                      — Accuracy ±${Math.round(
                                        Number(
                                          point["Accuracy Feet"] || 0
                                        )
                                      )} ft
                                    </div>
                                  `;

                                }
                              )
                              .join("")}

                          </div>

                        </div>
                      `
                      : ""
                  }

                </div>
              `;

            }
          )
          .join("");

    }
    catch (
      error
    ) {

      console.error(
        "Unable to load tracking history.",
        error
      );


      status.textContent =
        error &&
        error.message
          ? error.message
          : "Unable to load tracking history.";

    }

  },

openTrack(
  trackId
) {

  if (!trackId) {

    return;

  }


  sessionStorage.setItem(
    "wacSelectedTrackId",
    trackId
  );


  const link =
    document.querySelector(
      '[data-page="tracking-detail"]'
    );


  if (link) {

    link.click();

    return;

  }


  window.location.hash =
    "tracking-detail";

},

  formatDuration(
    totalSeconds
  ) {

    const seconds =
      Math.max(
        0,
        Math.floor(
          totalSeconds
        )
      );


    const hours =
      Math.floor(
        seconds / 3600
      );


    const minutes =
      Math.floor(
        (
          seconds % 3600
        ) /
        60
      );


    const remainingSeconds =
      seconds % 60;


    return (
      String(
        hours
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        minutes
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        remainingSeconds
      ).padStart(
        2,
        "0"
      )
    );

  }

};


window.WACTrackingHistory.init();