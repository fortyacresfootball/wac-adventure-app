window.WACTracking = {

  watchId: null,
  wakeLock: null,
  startedAt: null,
  lastPosition: null,
  totalDistanceMiles: 0,
  waypoints: [],
  timerInterval: null,
  waypointSamples: [],
isCapturingWaypoint: false,


  init() {

    const startButton =
      document.getElementById(
        "tracking-start-button"
      );

    const waypointButton =
      document.getElementById(
        "tracking-waypoint-button"
      );

    const endButton =
      document.getElementById(
        "tracking-end-button"
      );


    if (
      !startButton ||
      !waypointButton ||
      !endButton
    ) {

      return;
    }


    startButton.addEventListener(
      "click",
      () => {
        this.startTracking();
      }
    );


    waypointButton.addEventListener(
      "click",
      () => {
        this.addWaypoint();
      }
    );


    endButton.addEventListener(
      "click",
      () => {
        this.endTracking();
      }
    );

  },


  async startTracking() {

    if (
      !navigator.geolocation
    ) {

      this.setGpsStatus(
        "GPS is not supported on this device."
      );

      return;
    }


    this.startedAt =
      new Date();

    this.lastPosition =
      null;

    this.totalDistanceMiles =
      0;

    this.waypoints =
      [];


    this.setTrackingState(
      true
    );


    this.setGpsStatus(
      "Requesting GPS location..."
    );


    await this.requestWakeLock();


    this.timerInterval =
      setInterval(
        () => {

          this.updateElapsedTime();

        },
        1000
      );


    this.watchId =
      navigator.geolocation.watchPosition(

        position => {

          this.handlePosition(
            position
          );

        },

        error => {

          this.handleGpsError(
            error
          );

        },

        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000
        }

      );

  },


  handlePosition(
  position
) {

  const currentPosition = {

    latitude:
      position.coords.latitude,

    longitude:
      position.coords.longitude,

    accuracyFeet:
      position.coords.accuracy *
      3.28084,

    pointDateTime:
      new Date().toISOString()

  };

  if (
  this.isCapturingWaypoint
) {

  this.waypointSamples.push({
    ...currentPosition
  });

}

  const maximumAccuracyFeet =
    65;


  if (
    this.lastPosition
  ) {

    const distance =
      this.calculateDistanceMiles(
        this.lastPosition.latitude,
        this.lastPosition.longitude,
        currentPosition.latitude,
        currentPosition.longitude
      );


    const distanceFeet =
      distance *
      5280;


    const minimumMovementFeet =
      Math.max(
        8,
        Math.min(
          25,
          Math.max(
            this.lastPosition.accuracyFeet,
            currentPosition.accuracyFeet
          ) *
          0.5
        )
      );


    const accuracyIsUsable =
      this.lastPosition.accuracyFeet <=
        maximumAccuracyFeet &&
      currentPosition.accuracyFeet <=
        maximumAccuracyFeet;


    const movementIsReal =
      distanceFeet >=
      minimumMovementFeet;


    if (
      accuracyIsUsable &&
      movementIsReal
    ) {

      this.totalDistanceMiles +=
        distance;


      document.getElementById(
        "tracking-distance"
      ).textContent =
        this.totalDistanceMiles
          .toFixed(2) +
        " mi";

    }

  }


  this.lastPosition =
    currentPosition;


  let quality =
    "Good";


  if (
    currentPosition.accuracyFeet <=
    15
  ) {

    quality =
      "Excellent";

  }
  else if (
    currentPosition.accuracyFeet >
    30
  ) {

    quality =
      "Fair";

  }


  if (
    currentPosition.accuracyFeet >
    65
  ) {

    quality =
      "Poor";

  }


  this.setGpsStatus(
    "GPS " +
    quality +
    " — accuracy ±" +
    Math.round(
      currentPosition.accuracyFeet
    ) +
    " ft"
  );

},

  async addWaypoint() {

  if (
    !this.lastPosition
  ) {

    this.setGpsStatus(
      "Waiting for a GPS location."
    );

    return;

  }


  if (
    this.isCapturingWaypoint
  ) {

    return;

  }


  this.isCapturingWaypoint =
    true;

  this.waypointSamples =
    [];


  const waypointButton =
    document.getElementById(
      "tracking-waypoint-button"
    );


  waypointButton.disabled =
    true;

  waypointButton.textContent =
    "Refining Location...";


  this.setGpsStatus(
    "Hold still — refining waypoint location..."
  );


  // Include the most recent GPS fix
  // while we wait for additional fresh fixes.
  this.waypointSamples.push({
    ...this.lastPosition
  });


  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        7000
      )
  );


  this.isCapturingWaypoint =
    false;


  if (
    !this.waypointSamples.length
  ) {

    waypointButton.disabled =
      false;

    waypointButton.textContent =
      "Add Waypoint";


    this.setGpsStatus(
      "Unable to obtain a waypoint location."
    );

    return;

  }


  // Choose the GPS fix reporting
  // the smallest accuracy radius.
  const bestPosition =
    this.waypointSamples.reduce(
      (
        best,
        sample
      ) => {

        if (
          sample.accuracyFeet <
          best.accuracyFeet
        ) {

          return sample;

        }

        return best;

      }
    );


  const previousWaypoint =
    this.waypoints.length
      ? this.waypoints[
          this.waypoints.length - 1
        ]
      : null;


  let distanceFromPrevious =
    0;


  if (
    previousWaypoint
  ) {

    distanceFromPrevious =
      this.calculateDistanceMiles(
        previousWaypoint.latitude,
        previousWaypoint.longitude,
        bestPosition.latitude,
        bestPosition.longitude
      );

  }


  const waypointType =
  document.getElementById(
    "tracking-waypoint-type"
  ).value;


const waypoint = {

  pointType:
    waypointType,

    latitude:
      bestPosition.latitude,

    longitude:
      bestPosition.longitude,

    accuracyFeet:
      bestPosition.accuracyFeet,

    pointDateTime:
      new Date().toISOString(),

    distanceFromPreviousMiles:
      distanceFromPrevious,

    notes:
      ""

  };


  this.waypoints.push(
    waypoint
  );


  document.getElementById(
    "tracking-waypoint-count"
  ).textContent =
    this.waypoints.length;


  this.renderWaypoints();


  waypointButton.disabled =
    false;

  waypointButton.textContent =
    "Add Waypoint";


  this.setGpsStatus(
    "Waypoint saved — estimated accuracy ±" +
    Math.round(
      bestPosition.accuracyFeet
    ) +
    " ft"
  );

},

async endTracking() {

  if (
    this.watchId !== null
  ) {

    navigator.geolocation
      .clearWatch(
        this.watchId
      );

    this.watchId =
      null;

  }


  if (
    this.timerInterval
  ) {

    clearInterval(
      this.timerInterval
    );

    this.timerInterval =
      null;

  }


  await this.releaseWakeLock();


  const endedAt =
    new Date();


  if (
    !this.startedAt ||
    !this.lastPosition
  ) {

    this.setTrackingState(
      false
    );

    this.setGpsStatus(
      "Tracking ended, but no GPS track was available to save."
    );

    return;

  }


  const durationSeconds =
    Math.floor(
      (
        endedAt.getTime() -
        this.startedAt.getTime()
      ) /
      1000
    );


  const trackType =
    document.getElementById(
      "tracking-type"
    ).value;


  const firstPoint =
    this.waypoints.length
      ? this.waypoints[0]
      : this.lastPosition;


  const session = {

    trackType:
      trackType,

    trackDate:
      this.startedAt
        .toISOString()
        .slice(
          0,
          10
        ),

    startDateTime:
      this.startedAt
        .toISOString(),

    endDateTime:
      endedAt
        .toISOString(),

    durationSeconds:
      durationSeconds,

    totalDistanceMiles:
      this.totalDistanceMiles,

    startLatitude:
      firstPoint.latitude,

    startLongitude:
      firstPoint.longitude,

    endLatitude:
      this.lastPosition.latitude,

    endLongitude:
      this.lastPosition.longitude,

    notes:
      ""

  };


  this.setTrackingState(
    false
  );


  this.setGpsStatus(
    "Saving track..."
  );


  try {

    const result =
      await Database
        .saveTrackingSession({

          session:
            session,

          points:
            this.waypoints

        });


    this.setGpsStatus(
      result.message ||
      "Tracking session saved."
    );

  }
  catch (
    error
  ) {

    console.error(
      "Unable to save tracking session.",
      error
    );


    this.setGpsStatus(
      error &&
      error.message
        ? error.message
        : "Unable to save tracking session."
    );

  }

},

  setTrackingState(
    active
  ) {

    const startButton =
      document.getElementById(
        "tracking-start-button"
      );

    const waypointButton =
      document.getElementById(
        "tracking-waypoint-button"
      );

    const endButton =
      document.getElementById(
        "tracking-end-button"
      );

      const waypointType =
  document.getElementById(
    "tracking-waypoint-type"
  );

    const status =
      document.getElementById(
        "tracking-status"
      );


    startButton.disabled =
      active;

    waypointButton.disabled =
  !active;

waypointType.disabled =
  !active;

endButton.disabled =
  !active;

    status.textContent =
      active
        ? "Tracking"
        : "Ready";

  },


  updateElapsedTime() {

    if (
      !this.startedAt
    ) {

      return;
    }


    const seconds =
      Math.floor(
        (
          Date.now() -
          this.startedAt.getTime()
        ) /
        1000
      );


    const hours =
      String(
        Math.floor(
          seconds / 3600
        )
      ).padStart(
        2,
        "0"
      );


    const minutes =
      String(
        Math.floor(
          (
            seconds % 3600
          ) /
          60
        )
      ).padStart(
        2,
        "0"
      );


    const remainingSeconds =
      String(
        seconds % 60
      ).padStart(
        2,
        "0"
      );


    document.getElementById(
      "tracking-elapsed"
    ).textContent =
      hours +
      ":" +
      minutes +
      ":" +
      remainingSeconds;

  },


  calculateDistanceMiles(
    lat1,
    lon1,
    lat2,
    lon2
  ) {

    const earthRadiusMiles =
      3958.8;

    const toRadians =
      degrees =>
        degrees *
        Math.PI /
        180;


    const latitudeDifference =
      toRadians(
        lat2 - lat1
      );

    const longitudeDifference =
      toRadians(
        lon2 - lon1
      );


    const a =
      Math.sin(
        latitudeDifference / 2
      ) ** 2 +
      Math.cos(
        toRadians(
          lat1
        )
      ) *
      Math.cos(
        toRadians(
          lat2
        )
      ) *
      Math.sin(
        longitudeDifference / 2
      ) ** 2;


    const c =
      2 *
      Math.atan2(
        Math.sqrt(
          a
        ),
        Math.sqrt(
          1 - a
        )
      );


    return (
      earthRadiusMiles *
      c
    );

  },


  renderWaypoints() {

    const container =
      document.getElementById(
        "tracking-waypoints"
      );


    container.innerHTML =
      this.waypoints
        .map(
          (
            waypoint,
            index
          ) => {

            return `
              <div class="tracking-waypoint-item">

                <strong>
  ${waypoint.pointType} ${index + 1}
</strong>

                <div>
                  ${waypoint.latitude.toFixed(6)},
                  ${waypoint.longitude.toFixed(6)}
                </div>

                <div>
                  Accuracy:
                  ±${Math.round(
                    waypoint.accuracyFeet
                  )} ft
                </div>

              </div>
            `;

          }
        )
        .join("");

  },


  setGpsStatus(
    message
  ) {

    const element =
      document.getElementById(
        "tracking-gps-status"
      );


    if (element) {

      element.textContent =
        message;

    }

  },


  handleGpsError(
    error
  ) {

    let message =
      "Unable to obtain GPS location.";


    if (
      error &&
      error.code === 1
    ) {

      message =
        "Location permission was denied.";

    }


    if (
      error &&
      error.code === 2
    ) {

      message =
        "GPS location is currently unavailable.";

    }


    if (
      error &&
      error.code === 3
    ) {

      message =
        "GPS location request timed out.";

    }


    this.setGpsStatus(
      message
    );

  },


  async requestWakeLock() {

    if (
      !(
        "wakeLock" in navigator
      )
    ) {

      return;

    }


    try {

      this.wakeLock =
        await navigator.wakeLock
          .request(
            "screen"
          );

    }
    catch (
      error
    ) {

      console.warn(
        "Wake lock unavailable.",
        error
      );

    }

  },


  async releaseWakeLock() {

    if (
      !this.wakeLock
    ) {

      return;

    }


    try {

      await this.wakeLock
        .release();

    }
    catch (
      error
    ) {

      console.warn(
        "Unable to release wake lock.",
        error
      );

    }


    this.wakeLock =
      null;

  }

};


window.WACTracking.init();