import { MultiValue } from 'react-select' 
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { OptionType } from '../../../../app/types'
import { CIConfigListType } from '../../../AppGroup.types'

export const filteredData: MultiValue<OptionType> = [
    {
        value: '1',
        label: 'test-1',
    },
    {
        value: '2',
        label: 'test-2',
    },
]

export const ciResult: CIConfigListType = {
    pipelineList: [
        {
            isManual: false,
            dockerArgs: new Map(),
            isExternal: false,
            parentCiPipeline: 0,
            parentAppId: 0,
            appId: '1',
            externalCiConfig: {
                id: 1,
                webhookUrl: '',
                payload: '',
                accessKey: 'string'
            },
            ciMaterial: [
                {
                    source: {
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'main',
                        regex: '',
                    },
                    gitMaterialId: 1,
                    id: 1,
                    gitMaterialName: 'getting-started-nodejs',
                    isRegex: false,
                },
            ],
            name: 'ci-1-zxju',
            id: 1,
            active: true,
            linkedCount: 0,
            scanEnabled: false,
            isDockerConfigOverridden: false,
            appName: 'test-1',
        },
        {
            isManual: false,
            isExternal: false,
            parentCiPipeline: 0,
            parentAppId: 0,
            appId: '2',
            externalCiConfig: {
                id: 0,
                webhookUrl: '',
                payload: '',
                accessKey: '',
            },
            ciMaterial: [
                {
                    source: {
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'main',
                        regex: '',
                    },
                    gitMaterialId: 2,
                    id: 2,
                    gitMaterialName: 'getting-started-nodejs',
                    isRegex: false,
                },
            ],
            name: 'ci-1-zxju',
            id: 2,
            active: true,
            linkedCount: 0,
            scanEnabled: false,
            isDockerConfigOverridden: false,
            appName: 'test-2',
        },
    ],
    securityModuleInstalled: false,
    blobStorageConfigured: false,
}

export async function mockCIList(): Promise<any> {
    const response = {
        code: 200,
        status: 'OK',
        result: ciResult,
    }
    return response
}

export async function mockTrigger(): Promise<ResponseType> {
    const response = {
        code: 200,
        status: 'OK',
        result: [
            {
                "id": 23,
                "name": "23-ci-1-kebc-8-dnrr2",
                "status": "Succeeded",
                "podStatus": "Succeeded",
                "message": "",
                "startedOn": "2023-03-16T08:03:28.547601Z",
                "finishedOn": "2023-03-16T08:04:26Z",
                "ciPipelineId": 8,
                "namespace": "devtron-ci",
                "logLocation": "",
                "blobStorageEnabled": false,
                "gitTriggers": {
                    "8": {
                        "Commit": "1bd84eba5ebdd6b1451ffd6c0734c2ad52edcdj9",
                        "Author": "svc <dev@Devs-MacBook-Pro.local>",
                        "Date": "2022-11-04T16:57:46+05:30",
                        "Message": "my cloned app\n",
                        "Changes": null,
                        "WebhookData": {
                            "Id": 0,
                            "EventActionType": "",
                            "Data": null
                        },
                        "CiConfigureSourceValue": "main",
                        "GitRepoUrl": "https://github.com/test/qatest.git",
                        "GitRepoName": "qatest",
                        "CiConfigureSourceType": "SOURCE_TYPE_BRANCH_FIXED"
                    }
                },
                "ciMaterials": [
                    {
                        "id": 8,
                        "gitMaterialId": 7,
                        "gitMaterialUrl": "",
                        "gitMaterialName": "qatest",
                        "type": "SOURCE_TYPE_BRANCH_FIXED",
                        "value": "main",
                        "active": true,
                        "lastFetchTime": "0001-01-01T00:00:00Z",
                        "isRepoError": false,
                        "repoErrorMsg": "",
                        "isBranchError": false,
                        "branchErrorMsg": "",
                        "url": "https://github.com/test/qatest.git",
                        "regex": ""
                    }
                ],
                "triggeredBy": 2,
                "artifact": "test/test:1bd84eba-8-23",
                "triggeredByEmail": "admin",
                "stage": "",
                "artifactId": 12,
                "isArtifactUploaded": true
            },
            {
                "id": 22,
                "name": "22-ci-1-kebc-8-m8hh2",
                "status": "Succeeded",
                "podStatus": "Succeeded",
                "message": "",
                "startedOn": "2023-03-16T08:03:07.284686Z",
                "finishedOn": "2023-03-16T08:04:08Z",
                "ciPipelineId": 8,
                "namespace": "devtron-ci",
                "logLocation": "",
                "blobStorageEnabled": false,
                "gitTriggers": {
                    "8": {
                        "Commit": "cb47d9e2a0ef8dd491eb8fb8debaadfcsdc00bc1b10",
                        "Author": "test test tes <84236481+test@users.noreply.github.com>",
                        "Date": "2023-03-15T16:37:16+05:30",
                        "Message": "Update README.md",
                        "Changes": null,
                        "WebhookData": {
                            "Id": 0,
                            "EventActionType": "",
                            "Data": null
                        },
                        "CiConfigureSourceValue": "main",
                        "GitRepoUrl": "https://github.com/test/qatest.git",
                        "GitRepoName": "qatest",
                        "CiConfigureSourceType": "SOURCE_TYPE_BRANCH_FIXED"
                    }
                },
                "ciMaterials": [
                    {
                        "id": 8,
                        "gitMaterialId": 7,
                        "gitMaterialUrl": "",
                        "gitMaterialName": "qatest",
                        "type": "SOURCE_TYPE_BRANCH_FIXED",
                        "value": "main",
                        "active": true,
                        "lastFetchTime": "0001-01-01T00:00:00Z",
                        "isRepoError": false,
                        "repoErrorMsg": "",
                        "isBranchError": false,
                        "branchErrorMsg": "",
                        "url": "https://github.com/test/qatest.git",
                        "regex": ""
                    }
                ],
                "triggeredBy": 2,
                "artifact": "test/test:cb47d9e2-8-22",
                "triggeredByEmail": "admin",
                "stage": "",
                "artifactId": 11,
                "isArtifactUploaded": true
            },
            {
                "id": 21,
                "name": "21-ci-1-kebc-8-rzjzd",
                "status": "Succeeded",
                "podStatus": "Succeeded",
                "message": "",
                "startedOn": "2023-03-16T07:48:00.003595Z",
                "finishedOn": "2023-03-16T07:48:58Z",
                "ciPipelineId": 8,
                "namespace": "devtron-ci",
                "logLocation": "",
                "blobStorageEnabled": false,
                "gitTriggers": {
                    "8": {
                        "Commit": "cb47d9e2a0ef8doa91eb8fb8debaa50900bc1b10",
                        "Author": "test <84236481+test@users.noreply.github.com>",
                        "Date": "2023-03-15T16:37:16+05:30",
                        "Message": "Update README.md",
                        "Changes": null,
                        "WebhookData": {
                            "Id": 0,
                            "EventActionType": "",
                            "Data": null
                        },
                        "CiConfigureSourceValue": "main",
                        "GitRepoUrl": "https://github.com/test/qatest.git",
                        "GitRepoName": "qatest",
                        "CiConfigureSourceType": "SOURCE_TYPE_BRANCH_FIXED"
                    }
                },
                "ciMaterials": [
                    {
                        "id": 8,
                        "gitMaterialId": 7,
                        "gitMaterialUrl": "",
                        "gitMaterialName": "qatest",
                        "type": "SOURCE_TYPE_BRANCH_FIXED",
                        "value": "main",
                        "active": true,
                        "lastFetchTime": "0001-01-01T00:00:00Z",
                        "isRepoError": false,
                        "repoErrorMsg": "",
                        "isBranchError": false,
                        "branchErrorMsg": "",
                        "url": "https://github.com/test/qatest.git",
                        "regex": ""
                    }
                ],
                "triggeredBy": 2,
                "artifact": "test/test:cb47d9e2-8-21",
                "triggeredByEmail": "admin",
                "stage": "",
                "artifactId": 10,
                "isArtifactUploaded": true
            }
        ]
    }

    return response
}
