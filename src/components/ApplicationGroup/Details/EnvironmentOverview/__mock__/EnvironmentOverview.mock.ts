import { MultiValue } from "react-select"
import { OptionType } from "../../../../app/types"
import { EnvDeploymentStatusType } from "../../../AppGroup.service"
import { EnvDeploymentStatus } from "../../../AppGroup.types"


const result = ():EnvDeploymentStatus[] => {
    return [
        {
            "appId": 374,
            "pipelineId": 305,
            "deployStatus": "Succeeded"
        },
        {
            "appId": 19,
            "pipelineId": 19,
            "deployStatus": "Succeeded"
        },
        {
            "appId": 81,
            "pipelineId": 74,
            "deployStatus": "Succeeded"
        },
        {
            "appId": 23,
            "pipelineId": 21,
            "deployStatus": "Failed"
        },
        {
            "appId": 1,
            "pipelineId": 63,
            "deployStatus": "Not Deployed"
        },
        {
            "appId": 101,
            "pipelineId": 238,
            "deployStatus": "Not Deployed"
        }
    ]
}

const appListResult = () => {
    return {
        "appContainers": [
            {
                "appId": 374,
                "appName": "prakash-1mar",
                "projectId": 1,
                "environments": [
                    {
                        "appId": 374,
                        "appName": "prakash-1mar",
                        "environmentId": 4,
                        "environmentName": "env-2",
                        "namespace": "ns-2",
                        "clusterName": "default_cluster",
                        "status": "",
                        "appStatus": "",
                        "cdStageStatus": "Succeeded",
                        "preStageStatus": null,
                        "postStageStatus": null,
                        "lastDeployedTime": "2023-03-02 04:48:48.520441+00",
                        "default": false,
                        "deleted": false,
                        "materialInfo": [
                            {
                                "author": "test <97603455+test-devtron@users.noreply.github.com>",
                                "branch": "main",
                                "message": "Update hello.py\n\nfor testing",
                                "modifiedTime": "2022-11-11T17:54:21+05:30",
                                "revision": "b08dbe27efb2a5a9sss35a9efe7fb6a5dd1184e8",
                                "url": "https://github.com/devtron-labs/sample-go-app.git",
                                "webhookData": "{\"Id\":0,\"EventActionType\":\"\",\"Data\":null}"
                            }
                        ],
                        "dataSource": "CI-RUNNER",
                        "ciArtifactId": 594,
                        "teamId": 1,
                        "teamName": "devtron-demo"
                    }
                ]
            },
            {
                "appId": 101,
                "appName": "aravind-child",
                "projectId": 1,
                "environments": [
                    {
                        "appId": 101,
                        "appName": "aravind-child",
                        "environmentId": 4,
                        "environmentName": "env-2",
                        "namespace": "ns-2",
                        "clusterName": "default_cluster",
                        "status": "",
                        "appStatus": "",
                        "cdStageStatus": null,
                        "preStageStatus": null,
                        "postStageStatus": null,
                        "default": false,
                        "deleted": false,
                        "materialInfo": [],
                        "ciArtifactId": 0,
                        "teamId": 1,
                        "teamName": "devtron-demo"
                    }
                ]
            },
            {
                "appId": 19,
                "appName": "testing-app",
                "projectId": 1,
                "environments": [
                    {
                        "appId": 19,
                        "appName": "testing-app",
                        "environmentId": 4,
                        "environmentName": "env-2",
                        "namespace": "ns-2",
                        "clusterName": "default_cluster",
                        "status": "",
                        "appStatus": "Healthy",
                        "cdStageStatus": "Succeeded",
                        "preStageStatus": null,
                        "postStageStatus": null,
                        "lastDeployedTime": "2023-02-19 07:06:23.112711+00",
                        "default": false,
                        "deleted": false,
                        "materialInfo": [
                            {
                                "author": "ghgsnaidu <smartcoder06@gmail.com>",
                                "branch": "main",
                                "message": "fun commit\n",
                                "modifiedTime": "2022-09-03T15:39:38+05:30",
                                "revision": "a8ee01b506369be47e8bf886f13721d5202190e5",
                                "url": "https://github.com/test/go-db-demo.git",
                                "webhookData": "{\"Id\":0,\"EventActionType\":\"\",\"Data\":null}"
                            }
                        ],
                        "dataSource": "CI-RUNNER",
                        "ciArtifactId": 318,
                        "teamId": 1,
                        "teamName": "devtron-demo"
                    }
                ]
            },
            {
                "appId": 81,
                "appName": "docker-hub-test",
                "projectId": 1,
                "environments": [
                    {
                        "appId": 81,
                        "appName": "docker-hub-test",
                        "environmentId": 4,
                        "environmentName": "env-2",
                        "namespace": "ns-2",
                        "clusterName": "default_cluster",
                        "status": "",
                        "appStatus": "Healthy",
                        "cdStageStatus": "Succeeded",
                        "preStageStatus": null,
                        "postStageStatus": null,
                        "lastDeployedTime": "2023-02-17 19:30:00.200782+00",
                        "default": false,
                        "deleted": false,
                        "materialInfo": [
                            {
                                "author": "test-test <79351203+test-test@users.noreply.github.com>",
                                "branch": "main",
                                "message": "Update requirements.txt",
                                "modifiedTime": "2023-02-08T15:51:21+05:30",
                                "revision": "13f2a9ee04478da10ee83bd8c73a60f588503102",
                                "url": "https://github.com/test-test/Docker_examples.git",
                                "webhookData": "{\"Id\":0,\"EventActionType\":\"\",\"Data\":null}"
                            }
                        ],
                        "dataSource": "CI-RUNNER",
                        "ciArtifactId": 61,
                        "teamId": 1,
                        "teamName": "devtron-demo"
                    }
                ]
            },
            {
                "appId": 1,
                "appName": "ajay-app",
                "projectId": 1,
                "environments": [
                    {
                        "appId": 1,
                        "appName": "ajay-app",
                        "environmentId": 4,
                        "environmentName": "env-2",
                        "namespace": "ns-2",
                        "clusterName": "default_cluster",
                        "status": "",
                        "appStatus": "",
                        "cdStageStatus": "",
                        "preStageStatus": "Starting",
                        "postStageStatus": null,
                        "default": false,
                        "deleted": false,
                        "materialInfo": [],
                        "ciArtifactId": 0,
                        "teamId": 1,
                        "teamName": "devtron-demo"
                    }
                ]
            },
            {
                "appId": 23,
                "appName": "testing-4",
                "projectId": 1,
                "environments": [
                    {
                        "appId": 23,
                        "appName": "testing-4",
                        "environmentId": 4,
                        "environmentName": "env-2",
                        "namespace": "ns-2",
                        "clusterName": "default_cluster",
                        "status": "",
                        "appStatus": "",
                        "cdStageStatus": "Failed",
                        "preStageStatus": null,
                        "postStageStatus": null,
                        "lastDeployedTime": "2023-02-09 06:27:34.294533+00",
                        "default": false,
                        "deleted": false,
                        "materialInfo": [
                            {
                                "author": "test <smartcoder06@gmail.com>",
                                "branch": "main",
                                "message": "fun commit\n",
                                "modifiedTime": "2022-09-03T15:39:38+05:30",
                                "revision": "a8ee01b506369be47e8bff86003721d5202190e5",
                                "url": "https://github.com/test/go-db-demo.git",
                                "webhookData": "{\"Id\":0,\"EventActionType\":\"\",\"Data\":null}"
                            }
                        ],
                        "dataSource": "CI-RUNNER",
                        "ciArtifactId": 32,
                        "teamId": 1,
                        "teamName": "devtron-demo"
                    }
                ]
            }
        ],
        "appCount": 6,
        "deploymentGroup": {
            "id": 0,
            "name": "",
            "appCount": 0,
            "noOfApps": "",
            "environmentId": 0,
            "ciPipelineId": 0,
            "ciMaterialDTOs": null
        }
    }
}

export const filteredData: MultiValue<OptionType> = [
    {
        "value": '1',
        "label": "ajay-app"
    },
    {
        "value": '101',
        "label": "aravind-child"
    },
    {
        "value": '81',
        "label": "docker-hub-test"
    },
    {
        "value": '374',
        "label": "prakash-1mar"
    },
    {
        "value": '23',
        "label": "testing-4"
    },
    {
        "value": '19',
        "label": "testing-app"
    }
]

export async function mockStatusFetch(): Promise<EnvDeploymentStatusType> {
    const response = {
        code: 200,
        status: 'OK',
        result: result(),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}

export async function mockAppStatus(): Promise<any> {
    const response = {
        code: 200,
        status: 'OK',
        result: appListResult(),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}