import { MultiValue } from "react-select"
import { ModuleConfigResponse } from "../../../../app/details/appDetails/appDetails.type"
import { OptionType } from "../../../../app/types"
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export async function mockCDList(): Promise<ResponseType> {
    const response = {
        code: 200,
        status: 'OK',
        result: {
            "pipelines": [
                {
                    "id": 1,
                    "environmentId": 1,
                    "environmentName": "devtron-demo",
                    "ciPipelineId": 1,
                    "triggerType": "AUTOMATIC",
                    "name": "cd-1-xli3",
                    "strategies": [
                        {
                            "deploymentTemplate": "ROLLING",
                            "config": {
                                "deployment": {
                                    "strategy": {
                                        "rolling": {
                                            "maxSurge": "25%",
                                            "maxUnavailable": 1
                                        }
                                    }
                                }
                            },
                            "default": true
                        }
                    ],
                    "deploymentTemplate": "ROLLING",
                    "preStage": {},
                    "postStage": {},
                    "preStageConfigMapSecretNames": {
                        "configMaps": [],
                        "secrets": []
                    },
                    "postStageConfigMapSecretNames": {
                        "configMaps": [],
                        "secrets": []
                    },
                    "runPreStageInEnv": false,
                    "runPostStageInEnv": false,
                    "isClusterCdActive": false,
                    "parentPipelineId": 1,
                    "parentPipelineType": "CI_PIPELINE",
                    "deploymentAppType": "helm",
                    "appName": "test-1",
                    "deploymentAppDeleteRequest": false,
                    "deploymentAppCreated": false,
                    "appId": 1
                },
                {
                    "id": 2,
                    "environmentId": 1,
                    "environmentName": "devtron-demo",
                    "ciPipelineId": 2,
                    "triggerType": "AUTOMATIC",
                    "name": "cd-1-xli3",
                    "strategies": [
                        {
                            "deploymentTemplate": "ROLLING",
                            "config": {
                                "deployment": {
                                    "strategy": {
                                        "rolling": {
                                            "maxSurge": "25%",
                                            "maxUnavailable": 1
                                        }
                                    }
                                }
                            },
                            "default": true
                        }
                    ],
                    "deploymentTemplate": "ROLLING",
                    "preStage": {},
                    "postStage": {},
                    "preStageConfigMapSecretNames": {
                        "configMaps": [],
                        "secrets": []
                    },
                    "postStageConfigMapSecretNames": {
                        "configMaps": [],
                        "secrets": []
                    },
                    "runPreStageInEnv": false,
                    "runPostStageInEnv": false,
                    "isClusterCdActive": false,
                    "parentPipelineId": 2,
                    "parentPipelineType": "CI_PIPELINE",
                    "deploymentAppType": "helm",
                    "appName": "test-2",
                    "deploymentAppDeleteRequest": false,
                    "deploymentAppCreated": false,
                    "appId": 2
                }
            ]
        },
    }
    return response
}

export async function mockCDModuleConfig(): Promise<ModuleConfigResponse> {
    const response = {
        code: 200,
        status: 'OK',
        result: {
            "enabled": false
        },
    }
    return response
}
