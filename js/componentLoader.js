// ======================================
// WAC Component Loader
// Version 1.0
// ======================================

const ComponentLoader = {

    async init() {

        const components = [

            "drawer",
            "successModal"

        ];

        const container =
            document.getElementById("globalComponents");

        for (const component of components) {

            const response = await fetch(

                `components/${component}.html?${Date.now()}`

            );

            if (!response.ok) {

                console.warn(

                    `Unable to load ${component}.html`

                );

                continue;

            }

            container.insertAdjacentHTML(

                "beforeend",

                await response.text()

            );

        }

        //--------------------------------------------------
        // Initialize Components
        //--------------------------------------------------

        if (typeof Drawer !== "undefined") {

            Drawer.init();

        }

        if (typeof SuccessModal !== "undefined") {

            SuccessModal.init();

        }

        console.log(

            "Components Loaded"

        );

    }

};