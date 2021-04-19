export function getExternalList(): Promise<{
    appname: string;
    environment: string;
    lastupdate: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                appname: "shivani",
                environment: "dashboard",
                lastupdate: "19 June 2019,04:02 PM",
            },
            {
                appname: "testing",
                environment: "dashboard",
                lastupdate: "19 June 2019,04:02 PM",
            },
            {
                appname: "demo",
                environment: "dashboard",
                lastupdate: "19 June 2019,04:02 PM",
            },
            {
                appname: "devtron",
                environment: "dashboard",
                lastupdate: "19 June 2019,04:02 PM",
            },
            {
                appname: "shivani@devtron.ai",
                environment: "dashboard",
                lastupdate: "19 June 2019,04:02 PM",
            },
            {
                appname: "shivani@devtron.a",
                environment: "dashboard",
                lastupdate: "19 June 2019,04:02 PM",
            },
            ])
        }, 1000)
    })
}

export function getNamespaceList(): Promise<{
    key: string | number;
    value: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                key: 1,
                value: "dashboard",
            },
            {
                key: 2,
                value: "demo",
            },
            ])
        }, 1000)
    })
}

export function getClusterList(): Promise<{
    key: string | number;
    value: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                key: 1,
                value: "devtron",
            },
            {
                key: 2,
                value: "dev-1",
            },
            {
                key: 3,
                value: "dev-3",
            },
            ])
        }, 1000)
    })
}