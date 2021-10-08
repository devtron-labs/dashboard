
export function getExternalList(qs): Promise<{
    id: number;
    appName: string;
    environment: string;
    lastDeployedOn: string;
    namespace: string;
    chartName: string;
    clusterId: number;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                appName: "shivani",
                environment: "dashboard",
                lastDeployedOn: "19 June 2019,04:02 PM",
                namespace: "devtron-clus",
                chartName: "helm",
                id: 2,
                clusterId: 123
            },
            {
                appName: "testing",
                environment: "dashboard",
                lastDeployedOn: "19 June 2019,04:02 PM",
                namespace: "devtron-clus",
                chartName: "helm",
                id: 2,
                clusterId: 123
            },
            {
                appName: "demo",
                environment: "dashboard",
                lastDeployedOn: "19 June 2019,04:02 PM",
                namespace: "devtron-clus",
                chartName: "helm",
                id: 2,
                clusterId: 123
            },
            {
                appName: "devtron",
                environment: "dashboard",
                lastDeployedOn: "19 June 2019,04:02 PM",
                namespace: "devtron-clus",
                chartName: "helm",
                id: 2,
                clusterId: 123
            },
            {
                appName: "shivani@devtron.ai",
                environment: "dashboard",
                lastDeployedOn: "19 June 2019,04:02 PM",
                namespace: "devtron-clus",
                chartName: "helm",
                id: 2,
                clusterId: 123
            },
            {
                appName: "shivani@devtron.a",
                environment: "dashboard",
                lastDeployedOn: "19 June 2019,04:02 PM",
                namespace: "devtron-clus",
                chartName: "helm",
                id: 2,
                clusterId: 123
            },
            ])
        }, 1000)
    })
}