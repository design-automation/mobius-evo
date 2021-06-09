const helpJSON = {
    hover: {
        jobs_page: {
            main: "Search Spaces Help",
        },
        start_new_job_page: {
            main: "New Search Help",
            settings_1: "Search Settings Help",
            gen_file: "Generative Settings Help",
            eval_file: "Evaluative Settings Help",
            settings_2: "Initilisation Settings Help",

            description: "Short Description for New Search",
            max_designs: "Number of Generations",
            population_size: "Total population in each Generation",
            tournament_size: "Number of individuals selected at random for mutation",
            survival_size: "Number of fittest individuals to survive to the next Generation",
            mutation_sd: "The standard deviation value that determines the variation in the mutated values of individuals' parameters",
            expiration: "expiration time in seconds",
            total_items: "Total Starting Individuals",
            random_generated: "Number of Randomly Generated Individuals",
        },
        result_page: {
            main: "Result Help",
            result_filter_form: "Filter Form Help",
            result_progress_plot: "Progress Plot Help",
            result_parallel_plot: "Parallel Plot Help",
            result_score_plot: "Score Plot Help",
            result_mobius_viewer: "Mobius Viewer Help",
            result_result_table: "Result Table Help",

            settings_job_settings: "Search Settings Help",
            settings_gen_details: "Generative Details Help",
            settings_past_settings: "Previous Search Settings",
            resume_new_settings_1: "Resume Search Help",
            resume_gen_file: "Resume Generative Help",
            resume_eval_file: "Resume Evaluative Help",
            resume_new_settings_2: "Resume Initilisation Help",

            max_designs: "New total number of Designs",
            new_designs: "Number of new Generations",
            population_size: "Total population in each Generation",
            tournament_size: "Number of individuals selected at random for mutation",
            survival_size: "Number of fittest individuals to survive to the next Generation",
            mutation_sd: "The standard deviation value that determines the variation in the mutated values of individuals' parameters",
            expiration: "expiration time in seconds",
            total_items: "Total Starting Individuals",
            mutate: "Number of individuals mutated",
            random_generated: "Number of Randomly Generated Individuals",
        },
    },
    popup: {
        jobs_page: {
            main: {
                title: "Search Spaces",
                text: `
Manage your past search spaces.

---

__View results:__ Click on search description.

__Sort Search Spaces:__ In ascending/descending order by clicking on the Header.

__Delete Search Space:__ Click the delete button in the _action_ column.
                `,
            },
        },
        start_new_job_page: {
            main: {
                title: "Start New Job",
                text: `
Starts a New Evolutionary Search on the Cloud.

---

1. __Search Settings__: Provide description and search settings.
1. __Generative Settings__: Upload new generation file or select from stored files.
1. __Evaluative Settings__: Upload new evaluation file or select from stored files.
1. __Initialisation Settings__: Additional Initialisation Settings (preset).
1. __Start__
                `,
            },
            settings_1: {
                title: "Search Settings",
                text: `
Provide description and search settings.

---

* __Description__: Short Description for New Search.
* __Number of Designs__: Number of Generations.
* __Population Size__: Total population in each Generation, regardless of species.
* __Tournament Size__: Number of individuals selected at random for mutation, regardless of species.
* __Mutation Standard Deviation__: The standard deviation value that determines the variation in the mutated values of individuals' parameters.
                `,
            },
            gen_file: {
                title: "Generative Settings",
                text: `
Upload new generation file or select from stored files.

---

1. __Add Gen File__ : Opens popup window for file selection.
1. __Upload Gen File__: Upload Generation File. More than one may be uploaded at one go.
1. __Select File(s)__: Select from previously uploaded files. More than one may be selected to compete.

---

* __Sort Files__: In ascending/descending order by clicking on the Header.
* __Page Navigation__: Located at the bottom of the table.
* __OK__: Confirm Selections.
* __Cancel__: Cancel Selections.
                `,
            },
            eval_file: {
                title: "Evaluative Settings",
                text: `
Upload new evaluation file or select from stored files.

---

1. __Add Eval File__ : Opens popup window for file selection.
1. __Upload Eval File__: Upload Evaluation File. More than one may be uploaded at one go.
1. __Select File__: Select from previously uploaded files.

---

* __Sort Files__: In ascending/descending order by clicking on the Header.
* __Page Navigation__: Located at the bottom of the table.
* __OK__: Confirm Selection.
* __Cancel__: Cancel Selection.
                `,
            },
            settings_2: {
                title: "Initialisation Settings",
                text: `
Additional Initialisation Settings (preset).

---

* __Total Starting Items__: 2*population size (search settings).

* __Randomly Generated__: 2*population size (search settings).

                `,
            },

        },
        result_page: {
            main: {
                title: "result main",
                text: ``,
            },
            result_filter_form: {
                title: "Filter Form",
                text: `
Filter Results using Generation Parameters and Evaluation Scores.

---

* __Parameters__: Filter using range for each parameter used in generative files.

* __Score__: Filter using score range.

* __Show__: Filter for results that are live or dead.

                `,
            },
            result_progress_plot: {
                title: "Progress Plot",
                text: `
Displays Evolution progress in a point plot. Each point represents a Design in the Generation.

---

* __Legend__: Clicking on the legend of each plot will toggle its display on the plot.

                `,
            },
            result_parallel_plot: {
                title: "Parallel Plot",
                text: `

---

`,
            },
            result_score_plot: {
                title: "Score Plot",
                text: `
Bar Chart that displays Maximum score over Generations.

---

* __Legend__: Clicking on the legend of each plot will toggle its display on the plot.
* __Slider__: Narrows the plot to the specified Generation range.
* __Bar__: Clicking on a bar will select the model to be viewed in the Mobius Viewer Drawer.

                `,
            },
            result_mobius_viewer: {
                title: "Mobius Viewer",
                text: `
View Evaluated Model. Breakdown of scores available in 3D viewer.
Upload Context GI Model to view evaluated model in context.

---

* __Top Left__: Toggle 3D Viewer / Geographic Viewer
* __Top Right__: Viewer and Selection Settings. Zoom to Fit model
* __Bottom Right__: Change to prefixed Camera settings

---

* __Context Url__: Url where GI context model was uploaded
* __Download__: Download Generated/Evaluated Model
* __Open in New Browser__: Opens Generated/Evaluated Model in New Browser
                `,
            },
            result_result_table: {
                title: "Result Table",
                text:  `
View Evaluation Results in Table.

---

* __Sort Results__: In ascending/descending order by clicking on the Header.
* __Page Navigation__: Located at the bottom of the table.
* __Model__: View Generated/Evaluated Model in Mobius Viewer

                `,
            },
            settings_job_settings: {
                title: "Search Settings",
                text: `
Settings used for Search

---

* __ID__: Search ID
* __Description__: Short Description given for Search.
*__Last Modified__: Time when Search was last run.
*__genFile__: Generation File(s) used for search.
*__evalFile__: Evaluation File used for search.
* __Max Designs__: Number of Generations.
* __Population Size__: Total population in each Generation, regardless of species.
* __Tournament Size__: Number of individuals selected at random for mutation, regardless of species.
* __Survival Size__: Number of fittest individuals to survive to the next Generation, regardless of species.
                `,
            },
            settings_gen_details: {
                title: "Generative Details",
                text: `
Details on Generative Files

---

* __Total Items__: Total number of Designs generated from Generation File
* __Live Items__: Total number of Live Designs generated from Generation File

                `,
            },
            settings_past_settings: {
                title: "Previous Search Settings",
                text: `
Previous Search Settings
`
            },
            resume_new_settings_1: {
                title: "New Search Settings",
                text: `
Provide description and search settings.

---

* __New Max Designs__: Total number of designs after continuing Search.
* __Number of New Designs__: Number of Generations.
* __Population Size__: Total population in each Generation, regardless of species.
* __Tournament Size__: Number of individuals selected at random for mutation, regardless of species.
* __Mutation Standard Deviation__: The standard deviation value that determines the variation in the mutated values of individuals' parameters.
                `,
            },
            resume_gen_file: {
                title: "New Generative Settings",
                text: `
Upload new generation file or select from stored files.
You may also replace previously used Generation File.

---

1. __Add Gen File__ : Opens popup window for file selection.
1. __Upload Gen File__: Upload Generation File. More than one may be uploaded at one go.
1. __Select File(s)__: Select from previously uploaded files. More than one may be selected to compete.

---

* __Sort Files__: In ascending/descending order by clicking on the Header.
* __Page Navigation__: Located at the bottom of the table.
* __OK__: Confirm Selections.
* __Cancel__: Cancel Selections.
                `,
            },
            resume_eval_file: {
                title: "New Evaluative Settings",
                text: `
Upload new evaluation file or select from stored files.
You may also replace previously used Evaluation File.

---

1. __Add Eval File__ : Opens popup window for file selection.
1. __Upload Eval File__: Upload Evaluation File. More than one may be uploaded at one go.
1. __Select File__: Select from previously uploaded files.

---

* __Sort Files__: In ascending/descending order by clicking on the Header.
* __Page Navigation__: Located at the bottom of the table.
* __OK__: Confirm Selection.
* __Cancel__: Cancel Selection.
                `,
            },
            resume_new_settings_2: {
                title: "New Initilisation Settings",
                text: `
Additional Initialisation Settings (preset).

---

* __<gen file>__: Number of existing (live) designs to start Generation.

* __Mutate from Existing__: Number of existing designs to be mutated.

                `,
            },
        },
    },
};

export default helpJSON;
