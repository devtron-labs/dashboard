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

export function getExternalSearchQueryList(): Promise<{
    appname: string;
    environment: string;
    queryMatch: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                appname: "shivani",
                environment: "default_cluster/devtroncd ",
                queryMatch: "19 June 2019,04:02 PM",
            },
            {
                appname: "testing",
                environment: "default_cluster/devtroncd ",
                queryMatch: "19 June 2019,04:02 PM",
            },
            {
                appname: "demo",
                environment: "default_cluster/devtroncddefaultdefault_cluster/devtroncddefault",
                queryMatch: "Gerena is a municipality in the Province of Seville, Spain. It is 25 km northwest of the provincial capital, Seville, and 10 km north of Olivares. Gerena is a municipality in the Province of Seville, Spain. It is 25 km northwest of the provincial capital, Seville, and 10 km north of Olivares",
            },
            {
                appname: "devtron",
                environment: "default_cluster/devtroncd ",
                queryMatch: "19 June 2019,04:02 PM",
            },
            ])
        }, 1000)
    })
}

export function getNamespaceList(): Promise<{
    value: number;
    label: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                value: 1,
                label: "dashboard",
            },
            {
                value: 2,
                label: "demo",
            },
            ])
        }, 1000)
    })
}

export function getClusterList(): Promise<{
    value: number;
    label: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                value: 101,
                label: "devtron",
            },
            {
                value: 102,
                label: "dev-1",
            },
            {
                value: 103,
                label: "dev-3",
            },
            ])
        }, 1000)
    })
}