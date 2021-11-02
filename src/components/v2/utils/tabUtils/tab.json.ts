export const ResourceTabsJSON = [
    {
        name: "K8 Resources",
        icon: "K8Resource",
        className: "",
        isSelected: true
    },
    {
        name: "Log Analyzer",
        icon: "LogAnalyser",
        className: "",
        isSelected: false
    }
]

export const DefaultViewTabsJSON = [
    {
        name: "TERMINAL",
        isSelected: false
    },
    {
        name: "SUMMARY",
        isSelected: false
    },
    {
        name: "MANIFEST",
        isSelected: true
    },
    {
        name: "EVENTS",
        isSelected: false
    },
    {
        name: "LOGS",
        isSelected: false
    },
]

export const ManifestTabJSON = [
    {
        name: "Live Manifest",
        isSelected: true
    },
    {
        name: "Compare",
        isSelected: false
    },
    {
        name: "Desired manifest",
        isSelected: false
    }
]

export const StatusViewTabJSON = [
    {
        status: "ALL",
        isSelected: true
    },
    {
        status: "HEALTHY",
        count: 6,
        isSelected: false
    },
    {
        status: "FAILED",
        count: 1,
        isSelected: false
    }, 
    {
        status: "PROGRESSING",
        count: 6,
        isSelected: false
    }
]