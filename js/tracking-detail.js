window.WACTrackingDetail = {

  selectedSession: null,
  mapsApiKey: "",

  async init() {

    const status =
      document.getElementById(
        "tracking-detail-status"
      );

    const content =
      document.getElementById(
        "tracking-detail-content"
      );


    if (
      !status ||
      !content
    ) {

      return;

    }


    const selectedTrackId =
      sessionStorage.getItem(
        "wacSelectedTrackId"
      );


    if (!selectedTrackId) {

      status.textContent =
        "No saved track was selected.";

      return;

    }


    try {

      const result =
        await Database
          .getTrackingHistory();

          this.mapsApiKey =
  result.mapsApiKey ||
  "";

      const sessions =
        Array.isArray(
          result.sessions
        )
          ? result.sessions
          : [];


      const session =
        sessions.find(
          item => {

            return (
              String(
                item[
                  "Track ID"
                ] ||
                ""
              ) ===
              selectedTrackId
            );

          }
        );


      if (!session) {

        status.textContent =
          "The selected track could not be found.";

        return;

      }

      this.selectedSession =
  session;


const showMapButton =
  document.getElementById(
    "tracking-show-map-button"
  );


if (showMapButton) {

  showMapButton.addEventListener(
    "click",
    () => {

      this.showMap();

    }
  );

}

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


      const distanceMiles =
        Number(
          session[
            "Total Distance Miles"
          ] ||
          0
        );


      const durationSeconds =
        Number(
          session[
            "Duration Seconds"
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


      status.textContent =
        trackType +
        (
          trackDate
            ? " — " + trackDate
            : ""
        );


      content.innerHTML = `
        <div>

          <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          ">

            <div style="
              background: #f7f4eb;
              border-radius: 12px;
              padding: 14px;
            ">
              <span style="
                display: block;
                font-size: 0.75rem;
                font-weight: 800;
                text-transform: uppercase;
                color: #6b746e;
              ">
                Distance
              </span>

              <strong style="
                display: block;
                margin-top: 4px;
                color: #123b25;
              ">
                ${distanceMiles.toFixed(2)} mi
              </strong>
            </div>


            <div style="
              background: #f7f4eb;
              border-radius: 12px;
              padding: 14px;
            ">
              <span style="
                display: block;
                font-size: 0.75rem;
                font-weight: 800;
                text-transform: uppercase;
                color: #6b746e;
              ">
                Duration
              </span>

              <strong style="
                display: block;
                margin-top: 4px;
                color: #123b25;
              ">
                ${this.formatDuration(
                  durationSeconds
                )}
              </strong>
            </div>


            <div style="
              background: #f7f4eb;
              border-radius: 12px;
              padding: 14px;
            ">
              <span style="
                display: block;
                font-size: 0.75rem;
                font-weight: 800;
                text-transform: uppercase;
                color: #6b746e;
              ">
                Waypoints
              </span>

              <strong style="
                display: block;
                margin-top: 4px;
                color: #123b25;
              ">
                ${points.length}
              </strong>
            </div>

          </div>


          <div>

            <strong style="
              color: #123b25;
              font-size: 1.1rem;
            ">
              Saved Waypoints
            </strong>

            <div style="
              margin-top: 10px;
              display: grid;
              gap: 10px;
            ">

              ${
                points.length
                  ? points
                      .map(
                        (
                          point,
                          index
                        ) => {

                          return `
                            <div style="
                              background: #f7f4eb;
                              border: 1px solid #ddd7c7;
                              border-radius: 12px;
                              padding: 14px;
                            ">

                              <strong style="
                                color: #123b25;
                              ">
                                ${point["Point Type"] || "Waypoint"}
                                ${index + 1}
                              </strong>

                              <div>
                                Accuracy:
                                ±${Math.round(
                                  Number(
                                    point[
                                      "Accuracy Feet"
                                    ] ||
                                    0
                                  )
                                )} ft
                              </div>

                            </div>
                          `;

                        }
                      )
                      .join("")
                  : "No waypoints were saved for this track."
              }

            </div>

          </div>

        </div>
      `;

    }
    catch (
      error
    ) {

      console.error(
        "Unable to load track details.",
        error
      );


      status.textContent =
        error &&
        error.message
          ? error.message
          : "Unable to load track details.";

    }

  },
showMap() {

  const mapContainer =
    document.getElementById(
      "tracking-detail-map"
    );

  const showMapButton =
    document.getElementById(
      "tracking-show-map-button"
    );


  if (!mapContainer) {
    return;
  }


  if (!this.selectedSession) {

    alert(
      "Track information is not available."
    );

    return;

  }


  if (!this.mapsApiKey) {

    alert(
      "Google Maps is not configured."
    );

    return;

  }


  mapContainer.style.display =
    "block";


  if (showMapButton) {

    showMapButton.disabled =
      true;

    showMapButton.textContent =
      "Loading Map...";

  }


  if (
    window.google &&
    window.google.maps
  ) {

    this.renderMap();

    return;

  }


  const existingScript =
    document.getElementById(
      "wac-tracking-google-maps"
    );


  if (existingScript) {

    existingScript.addEventListener(
      "load",
      () => {

        this.renderMap();

      },
      {
        once: true
      }
    );

    return;

  }


  const script =
    document.createElement(
      "script"
    );


  script.id =
    "wac-tracking-google-maps";


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
    () => {

      this.renderMap();

    };


  script.onerror =
    () => {

      if (showMapButton) {

        showMapButton.disabled =
          false;

        showMapButton.textContent =
          "Show Map";

      }


      alert(
        "Google Maps could not be loaded."
      );

    };


  document.head.appendChild(
    script
  );

},
renderMap() {

  const mapContainer =
    document.getElementById(
      "tracking-detail-map"
    );

  const showMapButton =
    document.getElementById(
      "tracking-show-map-button"
    );


  if (
    !mapContainer ||
    !this.selectedSession
  ) {

    return;

  }


  const session =
    this.selectedSession;


  const points =
    Array.isArray(
      session["Points"]
    )
      ? session["Points"]
      : [];


  const mapPoints =
    [];


  const startLatitude =
    Number(
      session[
        "Start Latitude"
      ]
    );

  const startLongitude =
    Number(
      session[
        "Start Longitude"
      ]
    );


  if (
    Number.isFinite(
      startLatitude
    ) &&
    Number.isFinite(
      startLongitude
    )
  ) {

    mapPoints.push({

      position: {
        lat: startLatitude,
        lng: startLongitude
      },

      title:
        "Track Start"

    });

  }


  points.forEach(
    (
      point,
      index
    ) => {

      const latitude =
        Number(
          point[
            "Latitude"
          ]
        );

      const longitude =
        Number(
          point[
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


      mapPoints.push({

        position: {
          lat: latitude,
          lng: longitude
        },

        title:
          (
            point[
              "Point Type"
            ] ||
            "Waypoint"
          ) +
          " " +
          (
            index + 1
          )

      });

    }
  );


  const endLatitude =
    Number(
      session[
        "End Latitude"
      ]
    );

  const endLongitude =
    Number(
      session[
        "End Longitude"
      ]
    );


  if (
    Number.isFinite(
      endLatitude
    ) &&
    Number.isFinite(
      endLongitude
    )
  ) {

    mapPoints.push({

      position: {
        lat: endLatitude,
        lng: endLongitude
      },

      title:
        "Track End"

    });

  }


  if (!mapPoints.length) {

    mapContainer.innerHTML =
      "No saved GPS locations are available for this track.";

    if (showMapButton) {

      showMapButton.disabled =
        false;

      showMapButton.textContent =
        "Show Map";

    }

    return;

  }


  const map =
    new google.maps.Map(
      mapContainer,
      {

        zoom:
          17,

        center:
          mapPoints[0]
            .position,

        mapTypeId:
          "satellite"

      }
    );


  const bounds =
    new google.maps.LatLngBounds();


  mapPoints.forEach(
    mapPoint => {

      new google.maps.Marker({

        map:
          map,

        position:
          mapPoint.position,

        title:
          mapPoint.title

      });


      bounds.extend(
        mapPoint.position
      );

    }
  );


  if (
    mapPoints.length > 1
  ) {

    map.fitBounds(
      bounds
    );

  }


  if (showMapButton) {

    showMapButton.textContent =
      "Map Shown";

  }

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


window.WACTrackingDetail.init();