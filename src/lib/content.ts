export const CONTENT = {
    BUS_FACTOR: {
        TITLE: "What is Bus Factor?",
        DESCRIPTION: "The \"bus factor\" is the minimum number of team members that have to suddenly disappear from a project before the project stalls due to lack of knowledgeable or competent personnel."
            + "Ideally, this number should be as higher than 3.",
        SCALE: {
            RED: "Critical: Single point of failure",
            AMBER: "Concerning: Limited backup",
            GREEN: "Healthy: Good distribution"
        }
    }
} as const 