window.MovieRoom = {

  movies: [],

  async init() {

    const status =
      document.getElementById(
        "movieRoomStatus"
      );

    const grid =
      document.getElementById(
        "movieRoomGrid"
      );


    if (
      !status ||
      !grid
    ) {
      return;
    }


    status.textContent =
      "Loading movies...";


    try {

      const response =
        await Database.getMovies();


      if (
        !response ||
        response.success !== true
      ) {

        throw new Error(
          response &&
          response.error
            ? response.error
            : "Movie Room could not be loaded."
        );

      }


      this.movies =
        Array.isArray(
          response.movies
        )
          ? response.movies
          : [];


      this.renderMovies();


    } catch (error) {

      console.error(
        "Movie Room load error:",
        error
      );


      status.textContent =
        error &&
        error.message
          ? error.message
          : "Movie Room could not be loaded.";

    }

  },


  renderMovies() {

    const status =
      document.getElementById(
        "movieRoomStatus"
      );

    const grid =
      document.getElementById(
        "movieRoomGrid"
      );


    if (
      !status ||
      !grid
    ) {
      return;
    }


    grid.innerHTML = "";


    if (
      !this.movies.length
    ) {

      status.textContent =
        "No movies are available right now.";

      return;

    }


    status.textContent = "";


    this.movies.forEach(
      function (movie) {

        const card =
          document.createElement(
            "div"
          );

        card.className =
          "movie-card";


        const title =
          document.createElement(
            "h3"
          );

        title.textContent =
          movie.Title ||
          "Untitled Movie";


        const details =
          document.createElement(
            "div"
          );

        details.className =
          "movie-details";


        const detailParts = [];

        if (movie.Year) {
          detailParts.push(
            movie.Year
          );
        }

        if (movie.Runtime) {
          detailParts.push(
            movie.Runtime
          );
        }

        if (movie.Rating) {
          detailParts.push(
            movie.Rating
          );
        }

        details.textContent =
          detailParts.join(
            " • "
          );


        const description =
          document.createElement(
            "p"
          );

        description.textContent =
          movie.Description || "";


        card.appendChild(
          title
        );


        if (
          details.textContent
        ) {

          card.appendChild(
            details
          );

        }


        if (
          description.textContent
        ) {

          card.appendChild(
            description
          );

        }


        if (
          movie[
            "Movie URL"
          ]
        ) {

          const button =
            document.createElement(
              "button"
            );

          button.type =
            "button";

          button.className =
            "small-button";

          button.textContent =
            "Watch Movie";


          button.addEventListener(
            "click",
            function () {

              window.open(
                movie[
                  "Movie URL"
                ],
                "_blank",
                "noopener"
              );

            }
          );


          card.appendChild(
            button
          );

        }


        grid.appendChild(
          card
        );

      }
    );

  }

};


window.MovieRoom.init();