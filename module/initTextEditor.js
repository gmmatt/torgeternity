export default function initTextEdidor() {

    CONFIG.TinyMCE = {
        branding: false,
        menubar: false,
        statusbar: false,
        content_css: ["/css/mce.css", "/systems/torgeternity/css/tinymce.css"],
        plugins: "lists image table code save link",
        toolbar: "styles bullist numlist image table hr link removeformat code save",
        save_enablewhendirty: true,
        table_default_styles: {},
        style_formats: [
            {
                title: "Custom",
                items: [
                    {
                        title: "Secret",
                        block: "section",
                        classes: "secret",
                        wrapper: true
                    }
                ]
            },
            {
                title: "Torg Specials",
                items: [

                    {
                        title: "Sidenote (left)",
                        block: "section",
                        classes: "sidenote left",
                        wrapper: true
                    },
                    {
                        title: "Sidenote (right)",
                        block: "section",
                        classes: "sidenote right",
                        wrapper: true
                    },
                    {
                        title: "horizontal bar (separator)",
                        block: "p",
                        classes: "bar",
                        wrapper: true
                    },
                    {
                        title: "Aysle splotch",
                        block: "div",
                        classes: "splotch aysle",
                        wrapper: true
                    },
                    {
                        title: "Cyberpapacy splotch",
                        block: "div",
                        classes: "splotch cyber",
                        wrapper: true
                    },
                    {
                        title: "Nile Empire splotch",
                        block: "div",
                        classes: "splotch nile",
                        wrapper: true
                    },
                    {
                        title: "Orrorsh splotch",
                        block: "div",
                        classes: "splotch or",
                        wrapper: true
                    },
                    {
                        title: "Pan-Pacifica splotch",
                        block: "div",
                        classes: "splotch panpa",
                        wrapper: true
                    },
                    {
                        title: "Tharkold splotch",
                        block: "div",
                        classes: "splotch thark",
                        wrapper: true
                    },
                    {
                        title: "directive (type 1)",
                        block: "div",
                        classes: "directive1",
                        wrapper: true
                    },
                    {
                        title: "directive (type 2)",
                        block: "div",
                        classes: "directive2",
                        wrapper: true
                    },

                ]
            },

        ],
        style_formats_merge: true
    };
};