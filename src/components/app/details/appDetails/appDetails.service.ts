import { fetchAPI } from '../../../../services/hostGrafana';

export function isDatasourceConfigured(envName: string) {
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');
    const URL = `${root}/grafana/api/datasources/id/Prometheus-${envName}`;
    return fetchAPI(URL, 'GET');
}

export function isDatasourceHealthy(datasourceId: number | string) {
    let timestamp = new Date();
    const root = process.env.REACT_APP_ORCHESTRATOR_ROOT.replace('/orchestrator', '');
    const URL = `${root}/grafana/api/datasources/proxy/${datasourceId}/api/v1/query?query=1&time=${timestamp.getTime()}`;
    return fetchAPI(URL, 'GET');
}

export function getScalePodList(): Promise<{
    result: {
        scalePodToZeroList:
        {
            kind: string;
            name: string;
            isChecked: boolean;
            value: "CHECKED" | "INTERMEDIATE";
        }[],
        // objectToRestoreList:
        // {
        //     kind: string;
        //     name: string;
        //     isChecked: boolean;
        //     value: string;
        // }[]
    },
}> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                result: {
                    scalePodToZeroList: scalePodToZeroList.map((list) => {
                        return {
                            kind: list.kind,
                            name: list.name,
                            isChecked: false,
                            value: "CHECKED"
                        }
                    },
                        // objectToRestore: objectToRestoreList.map((list) => {
                        //     return {
                        //         kind: list.kind,
                        //         name: list.name,
                        //         isChecked: false,
                        //         value: "CHECKED"
                        //     }
                        // })
                    )
                }
            }
            )
        }, 1000)
    })
}

const scalePodToZeroList = [
    {
        kind: "rollout",
        name: "dashboard-bp-devtroncd",

    },
    {
        kind: "horizontalPodAutoscaler",
        name: "dashboard-bp-devtroncd",

    },
    {
        kind: "deployment",
        name: "dashboard-bp-devtroncd",

    },
]

const objectToRestoreList = [
    {
        kind: "rollout",
        name: "dashboard-bp-devtroncd",

    },
    {
        kind: "horizontalPodAutoscaler",
        name: "dashboard-bp-devtroncd",

    },
]