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

export function getNamespace(): Promise<{
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