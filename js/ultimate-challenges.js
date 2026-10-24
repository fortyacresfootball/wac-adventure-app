window.UltimateChallenges = {

    data: null,

    async init() {

        try {

            const response =
                await Database.getUltimateChallenges();

            this.data =
                response;

            console.log(
                "Ultimate Challenges loaded:",
                response
            );

        } catch (error) {

            console.error(
                "Ultimate Challenges load error:",
                error
            );
        }
    }

};

UltimateChallenges.init();