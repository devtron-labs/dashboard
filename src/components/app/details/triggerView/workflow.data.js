//appId: 80, appName: amit-16-jan-replica, 2 workflows, no linked, no external ci, no CI is parent
import { DEFAULT_STATUS } from '../../../../config';
export const ciConfigResp = {
    "code": 200,
    "status": "OK",
    "result": {
        "id": 77,
        "appId": 80,
        "dockerRegistry": "Devtron Playstation",
        "dockerRepository": "test",
        "dockerBuildConfig": { "gitMaterialId": 80, "dockerfileRelativePath": "Dockerfile" },
        "ciPipelines": [{
                "isManual": true,
                "dockerArgs": {},
                "isExternal": false,
                "parentCiPipeline": 0,
                "parentAppId": 0,
                "externalCiConfig": { "id": 0, "webhookUrl": "", "payload": "", "accessKey": "" },
                "ciMaterial": [{
                    "source": { "type": "SOURCE_TYPE_BRANCH_FIXED", "value": "test" },
                    "gitMaterialId": 80,
                    "id": 107,
                    "gitMaterialName": "getting-started-nodejs"
                }],
                "name": "amit-16-jan-replica-ci-arya-test",
                "id": 106,
                "active": true,
                "linkedCount": 0
            },
            {
                "isManual": true,
                "dockerArgs": {},
                "isExternal": false,
                "parentCiPipeline": 0,
                "parentAppId": 0,
                "externalCiConfig": { "id": 0, "webhookUrl": "", "payload": "", "accessKey": "" },
                "ciMaterial": [{
                    "source": { "type": "SOURCE_TYPE_BRANCH_FIXED", "value": "master" },
                    "gitMaterialId": 80,
                    "id": 97,
                    "gitMaterialName": "getting-started-nodejs"
                }],
                "name": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "id": 96,
                "active": true,
                "linkedCount": 0
            }
        ],
        "appName": "amit-16-jan-replica",
        "version": "abc",
        "materials": [{ "gitMaterialId": 80, "materialName": "getting-started-nodejs" }]
    }
};

export const cdConfigResp = {
    "code": 200,
    "status": "OK",
    "result": {
        "pipelines": [{
                "id": 79,
                "environmentId": 1,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 80,
                "environmentId": 2,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 92,
                "environmentId": 3,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-deploy",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 94,
                "environmentId": 5,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 95,
                "environmentId": 6,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            }
        ],
        "appId": 80
    }
};

export const cdConfigPrePostResp = {
    "code": 200,
    "status": "OK",
    "result": {
        "pipelines": [{
                "id": 92,
                "environmentId": 3,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-deploy",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 94,
                "environmentId": 5,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 79,
                "environmentId": 1,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": { "triggerType": "AUTOMATIC", "name": "Pre-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    beforeStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "postStage": { "triggerType": "AUTOMATIC", "name": "Post-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    afterStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 80,
                "environmentId": 2,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 95,
                "environmentId": 6,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            }
        ],
        "appId": 80
    }
};

export const cdConfigPrePostRespWithPrePostSequential = {
    "code": 200,
    "status": "OK",
    "result": {
        "pipelines": [{
                "id": 92,
                "environmentId": 3,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-deploy",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 94,
                "environmentId": 5,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 79,
                "environmentId": 1,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": { "triggerType": "AUTOMATIC", "name": "Pre-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    beforeStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "postStage": { "triggerType": "AUTOMATIC", "name": "Post-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    afterStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 80,
                "environmentId": 2,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": { "triggerType": "AUTOMATIC", "name": "Pre-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    beforeStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "postStage": { "triggerType": "AUTOMATIC", "name": "Post-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    afterStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 95,
                "environmentId": 6,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": { "triggerType": "AUTOMATIC", "name": "Pre-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    beforeStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                "postStage": { "triggerType": "AUTOMATIC", "name": "Post-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    afterStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
                 "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            }
        ],
        "appId": 80
    }
};

export const workflow = {
    "code": 200,
    "status": "OK",
    "result": {
        "appId": 80,
        "appName": "amit-16-jan-replica",
        "workflows": [{
            "id": 92,
            "name": "first",
            "appId": 80,
            "tree": [{
                "id": 172,
                "appWorkflowId": 92,
                "type": "CI_PIPELINE",
                "componentId": 96,
                "parentId": 0,
                "parentType": ""
            }, {
                "id": 173,
                "appWorkflowId": 92,
                "type": "CD_PIPELINE",
                "componentId": 79,
                "parentId": 96,
                "parentType": "CI_PIPELINE"
            }]
        }, {
            "id": 93,
            "name": "external ci",
            "appId": 80,
            "tree": [{
                "id": 195,
                "appWorkflowId": 93,
                "type": "CI_PIPELINE",
                "componentId": 106,
                "parentId": 0,
                "parentType": ""
            }, {
                "id": 196,
                "appWorkflowId": 93,
                "type": "CD_PIPELINE",
                "componentId": 92,
                "parentId": 106,
                "parentType": "CI_PIPELINE"
            }, {
                "id": 200,
                "appWorkflowId": 93,
                "type": "CD_PIPELINE",
                "componentId": 94,
                "parentId": 106,
                "parentType": "CI_PIPELINE"
            }]
        }]
    }
};

export const workflowsTrigger = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-amit-16-jan-erferf",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 174,
        "width": 1280
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-dep",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 175,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,

            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 325,
        "width": 1280
    }
];

export const workflowsCreate = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 112,
        "width": 840
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "postNode": undefined,
                "preNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 113,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 201,
        "width": 840
    }
];

export const workflowsTriggerPrePostCD = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "PRECD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 126,
                "width": 200,
                "title": "Pre-Deployment",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [
                    "CD-79"
                ],
                "type": "PRECD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentId": 1,
                "environmentName": "",
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false
            },
            {
                "parents": [
                    "96"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-amit-16-jan-erferf",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [
                    "POSTCD-79"
                ],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 800,
                "y": 24,
                "isRoot": false,
                "preNode": {
                    "parents": [
                        "96"
                    ],
                    "height": 126,
                    "width": 200,
                    "title": "Pre-Deployment",
                    "isSource": false,
                    "isGitSource": false,
                    "id": "79",
                    "activeIn": false,
                    "activeOut": false,
                    "downstreams": [
                        "CD-79"
                    ],
                    "type": "PRECD",
                    "status": DEFAULT_STATUS,
                    "triggerType": "Auto",
                    "environmentId": 1,
                    "environmentName": "",
                    "deploymentStrategy": "rolling",
                    "inputMaterialList": [],
                    "rollbackMaterialList": [],
                    "stageIndex": 1,
                    "x": 540,
                    "y": 24,
                    "isRoot": false
                },
                "postNode": {
                    "parents": [
                        "79"
                    ],
                    "height": 126,
                    "width": 200,
                    "title": "Post-Deployment",
                    "isSource": false,
                    "isGitSource": false,
                    "id": "79",
                    "activeIn": false,
                    "activeOut": false,
                    "downstreams": [],
                    "type": "POSTCD",
                    "status": DEFAULT_STATUS,
                    "triggerType": "Auto",
                    "environmentName": "",
                    "environmentId": 1,
                    "deploymentStrategy": "rolling",
                    "inputMaterialList": [],
                    "rollbackMaterialList": [],
                    "stageIndex": 3,
                    "x": 1060,
                    "y": 24,
                    "isRoot": false
                }
            },
            {
                "parents": [
                    "79"
                ],
                "height": 126,
                "width": 200,
                "title": "Post-Deployment",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "POSTCD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 3,
                "x": 1060,
                "y": 24,
                "isRoot": false
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 174,
        "width": 1280
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-dep",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 175,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 325,
        "width": 1280
    }
];

export const workflowsCreatePrePostCD = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 64,
                "width": 240,
                "title": "Pre-deploy, Deploy, Post-deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 112,
        "width": 840
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 113,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 201,
        "width": 840
    }
];

export const cdConfigPostResp = {
    "code": 200,
    "status": "OK",
    "result": {
        "pipelines": [{
            "id": 92,
            "environmentId": 3,
            "environmentName": "dev2",
            "ciPipelineId": 106,
            "triggerType": "MANUAL",
            "name": "amit-16-jan-replica-deploy",
            "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
            "deploymentTemplate": "ROLLING",
            "preStage": {},
            "postStage": {},
            "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
            "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
        }, {
            "id": 94,
            "environmentId": 5,
            "environmentName": "dev4",
            "ciPipelineId": 106,
            "triggerType": "MANUAL",
            "name": "amit-16-jan-replica-dep",
            "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
            "deploymentTemplate": "ROLLING",
            "preStage": {},
            "postStage": {},
            "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
            "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
        }, {
            "id": 79,
            "environmentId": 1,
            "environmentName": "dev",
            "ciPipelineId": 96,
            "triggerType": "MANUAL",
            "name": "amit-16-jan-replica-amit-16-jan-erferf",
            "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
            "deploymentTemplate": "ROLLING",
            "preStage": {},
            "postStage": { "triggerType": "AUTOMATIC", "name": "Post-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    afterStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" },
            "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
            "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
        },
        {
            "id": 80,
            "environmentId": 2,
            "ciPipelineId": 96,
            "triggerType": "AUTOMATIC",
            "name": "amit-16-jan-replica-amit-16-jan-erferf2",
            "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
            "deploymentTemplate": "ROLLING",
            "preStage": {},
            "postStage": {},
            "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
            "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
        },
        {
            "id": 95,
            "environmentId": 6,
            "ciPipelineId": 106,
            "triggerType": "MANUAL",
            "name": "amit-16-jan-replica-dep2",
            "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
            "deploymentTemplate": "ROLLING",
            "preStage": {},
            "postStage": {},
            "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
            "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
        }],
        "appId": 80
    }
};

export const cdConfigPreResp = {
    "code": 200,
    "status": "OK",
    "result": {
        "pipelines": [{
                "id": 92,
                "environmentId": 3,
                "environmentName": "dev2",
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-deploy",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 94,
                "environmentId": 5,
                "environmentName": "dev4",
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 79,
                "environmentId": 1,
                "environmentName": "dev",
                "ciPipelineId": 96,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-amit-16-jan-erferf",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": { "triggerType": "AUTOMATIC", "name": "Pre-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    beforeStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n date \u003e test.report\\necho 'hello2'\\n date \u003e test.report\\necho 'hello3'\\n sleep 2m\\n\"\n        outputLocation: ./test.report" },
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 80,
                "environmentId": 2,
                "ciPipelineId": 96,
                "triggerType": "AUTOMATIC",
                "name": "amit-16-jan-replica-amit-16-jan-erferf2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            },
            {
                "id": 95,
                "environmentId": 6,
                "ciPipelineId": 106,
                "triggerType": "MANUAL",
                "name": "amit-16-jan-replica-dep2",
                "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }],
                "deploymentTemplate": "ROLLING",
                "preStage": {},
                "postStage": {},
                "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] },
                "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }
            }
        ],
        "appId": 80
    }
};

export const workflowsTriggerPreCDResp = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "PRECD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 126,
                "width": 200,
                "title": "Pre-Deployment",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [
                    "CD-79"
                ],
                "type": "PRECD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false
            },
            {
                "parents": [
                    "96"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-amit-16-jan-erferf",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 800,
                "y": 24,
                "isRoot": false,
                "preNode": {
                    "parents": [
                        "96"
                    ],
                    "height": 126,
                    "width": 200,
                    "title": "Pre-Deployment",
                    "isSource": false,
                    "isGitSource": false,
                    "id": "79",
                    "activeIn": false,
                    "activeOut": false,
                    "downstreams": [
                        "CD-79"
                    ],
                    "type": "PRECD",
                    "status": DEFAULT_STATUS,
                    "triggerType": "Auto",
                    "environmentName": "dev",
                    "environmentId": 1,
                    "deploymentStrategy": "rolling",
                    "inputMaterialList": [],
                    "rollbackMaterialList": [],
                    "stageIndex": 1,
                    "x": 540,
                    "y": 24,
                    "isRoot": false
                },
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 174,
        "width": 1280
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev2",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-dep",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev4",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 175,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 325,
        "width": 1280
    }
];

export const workflowsCreatePreCDResp = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 64,
                "width": 240,
                "title": "Pre-deploy, Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 112,
        "width": 840
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev2",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev4",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 113,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 201,
        "width": 840
    }
];

export const workflowsCreatePostCD = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy, Post-deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined,
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 112,
        "width": 840
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev2",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev4",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 113,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 201,
        "width": 840
    }
];

export const workflowsTriggerPostCD = [{
        "id": "92",
        "name": "first",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-96"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "96",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-amit-16-jan-ci-master-original",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-79"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "96"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-amit-16-jan-erferf",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [
                    "POSTCD-79"
                ],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": {
                    "parents": [
                        "79"
                    ],
                    "height": 126,
                    "width": 200,
                    "title": "Post-Deployment",
                    "isSource": false,
                    "isGitSource": false,
                    "id": "79",
                    "activeIn": false,
                    "activeOut": false,
                    "downstreams": [],
                    "type": "POSTCD",
                    "status": DEFAULT_STATUS,
                    "triggerType": "Auto",
                    "environmentName": "dev",
                    "environmentId": 1,
                    "deploymentStrategy": "rolling",
                    "inputMaterialList": [],
                    "rollbackMaterialList": [],
                    "stageIndex": 2,
                    "x": 800,
                    "y": 24,
                    "isRoot": false
                }
            },
            {
                "parents": [
                    "79"
                ],
                "height": 126,
                "width": 200,
                "title": "Post-Deployment",
                "isSource": false,
                "isGitSource": false,
                "id": "79",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "POSTCD",
                "status": DEFAULT_STATUS,
                "triggerType": "Auto",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 800,
                "y": 24,
                "isRoot": false
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 174,
        "width": 1280
    },
    {
        "id": "93",
        "name": "external ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-106"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "test",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "106",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-ci-arya-test",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-92",
                    "CD-94"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 0
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "92",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev2",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            },
            {
                "parents": [
                    "106"
                ],
                "height": 126,
                "width": 200,
                "title": "amit-16-jan-replica-dep",
                "isSource": false,
                "isGitSource": false,
                "id": "94",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev4",
                "environmentId": 5,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 175,
                "isRoot": false,
                "preNode": undefined,
                "postNode": undefined
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 325,
        "width": 1280
    }
];


//appId:1, appName: colored-ci-logs, dataset for linked CI and external CI
export const ciConfigWithLinkedCIResp = { "code": 200, "status": "OK", "result": { "id": 1, "appName": "colored-ci-logs", "material": [{ "name": "getting-started-nodejs", "url": "https://github.com/gautamits/getting-started-nodejs.git", "id": 1, "gitProviderId": 1, "checkoutPath": "./" }], "teamId": 1, "templateId": 0 } };

export const workflows2Resp = { "code": 200, "status": "OK", "result": { "appId": 1, "appName": "colored-ci-logs", "workflows": [{ "id": 1, "name": "wf-1", "appId": 1, "tree": [{ "id": 1, "appWorkflowId": 1, "type": "CI_PIPELINE", "componentId": 1, "parentId": 0, "parentType": "" }, { "id": 3, "appWorkflowId": 1, "type": "CD_PIPELINE", "componentId": 1, "parentId": 1, "parentType": "CI_PIPELINE" }] }, { "id": 52, "name": "ref ci", "appId": 1, "tree": [{ "id": 84, "appWorkflowId": 52, "type": "CI_PIPELINE", "componentId": 47, "parentId": 0, "parentType": "" }, { "id": 85, "appWorkflowId": 52, "type": "CD_PIPELINE", "componentId": 40, "parentId": 47, "parentType": "CI_PIPELINE" }] }] } };

export const cdConfig2Resp = { "code": 200, "status": "OK", "result": { "pipelines": [{ "id": 1, "environmentId": 1, "environmentName": "dev", "ciPipelineId": 1, "triggerType": "MANUAL", "name": "colored-ci-logs-cd-1", "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }], "deploymentTemplate": "ROLLING", "preStage": { "triggerType": "AUTOMATIC", "name": "Pre-Deployment", "config": "version: 0.0.1\ncdPipelineConf:\n  -\n    beforeStages:\n      -\n        name: test-1\n        script: \"date \u003e test.report\\necho 'hello'\\n\"\n        outputLocation: ./test.report\n      -\n        name: test-2\n        script: \"date \u003e test2.report\\n\"\n        outputLocation: ./test2.report" }, "postStage": {}, "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }, "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] } }, { "id": 40, "environmentId": 3, "environmentName": "dev2", "ciPipelineId": 47, "triggerType": "MANUAL", "name": "colored-ci-logs-ref", "strategies": [{ "deploymentTemplate": "ROLLING", "config": { "deployment": { "strategy": { "rolling": { "maxSurge": "25%", "maxUnavailable": 1 } } } }, "default": true }], "deploymentTemplate": "ROLLING", "preStage": {}, "postStage": {}, "preStageConfigMapSecretNames": { "configMaps": [], "secrets": [] }, "postStageConfigMapSecretNames": { "configMaps": [], "secrets": [] } }], "appId": 1 } };

export const workflows2Trigger = [{
        "id": "1",
        "name": "wf-1",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-1"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "1",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 126,
                "width": 200,
                "title": "colored-ci-logs-ci-ci-1",
                "triggerType": "Auto",
                "status": DEFAULT_STATUS,

                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "PRECD-1"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 2
            },
            {
                "parents": [
                    "1"
                ],
                "height": 126,
                "width": 200,
                "title": "Pre-Deployment",
                "isSource": false,
                "isGitSource": false,
                "id": "1",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [
                    "CD-1"
                ],
                "type": "PRECD",
                "status": "Succeeded",
                "triggerType": "Auto",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false
            },
            {
                "parents": [
                    "1"
                ],
                "height": 126,
                "width": 200,
                "title": "colored-ci-logs-cd-1",
                "isSource": false,
                "isGitSource": false,
                "id": "1",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": "Healthy",
                "triggerType": "Manual",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 800,
                "y": 24,
                "isRoot": false,
                "preNode": {
                    "parents": [
                        "1"
                    ],
                    "height": 126,
                    "width": 200,
                    "title": "Pre-Deployment",
                    "isSource": false,
                    "isGitSource": false,
                    "id": "1",
                    "activeIn": false,
                    "activeOut": false,
                    "downstreams": [
                        "CD-1"
                    ],
                    "type": "PRECD",
                    "status": "Succeeded",
                    "triggerType": "Auto",
                    "environmentName": "dev",
                    "environmentId": 1,
                    "deploymentStrategy": "rolling",
                    "inputMaterialList": [],
                    "rollbackMaterialList": [],
                    "stageIndex": 1,
                    "x": 540,
                    "y": 24,
                    "isRoot": false
                }
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 174,
        "width": 1280
    },
    {
        "id": "52",
        "name": "ref ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-47"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "47",
                "x": 280,
                "y": 24,
                "parentAppId": 48,
                "parentCiPipeline": 43,
                "height": 84,
                "width": 200,
                "title": "colored-ci-logs-ci-ref-ci-ci-master",
                "triggerType": "Manual",
                "status": "Succeeded",
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-40"
                ],
                "isExternalCI": true,
                "isLinkedCI": true,
                "linkedCount": 0
            },
            {
                "parents": [
                    "47"
                ],
                "height": 126,
                "width": 200,
                "title": "colored-ci-logs-ref",
                "isSource": false,
                "isGitSource": false,
                "id": "40",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": "Degraded",
                "triggerType": "Manual",
                "environmentName": "dev2",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 540,
                "y": 24,
                "isRoot": false
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 174,
        "width": 1280
    }
];

export const workflows2Create = [{
        "id": "1",
        "name": "wf-1",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-1"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "1",
                "x": 280,
                "y": 24,
                "parentAppId": 0,
                "parentCiPipeline": 0,
                "height": 64,
                "width": 240,
                "title": "colored-ci-logs-ci-ci-1",
                "triggerType": "Auto",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-1"
                ],
                "isExternalCI": false,
                "isLinkedCI": false,
                "linkedCount": 2
            },
            {
                "parents": [
                    "1"
                ],
                "height": 64,
                "width": 240,
                "title": "Pre-deploy, Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "1",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev",
                "environmentId": 1,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 2,
                "x": 580,
                "y": 24,
                "isRoot": false
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 112,
        "width": 840
    },
    {
        "id": "52",
        "name": "ref ci",
        "nodes": [{
                "parents": [],
                "height": 64,
                "width": 200,
                "title": "getting-started-nodejs",
                "isSource": true,
                "isRoot": true,
                "isGitSource": true,
                "url": "",
                "id": "GIT-getting-started-nodejs",
                "downstreams": [
                    "CI-47"
                ],
                "type": "GIT",
                "icon": "git",
                "branch": "master",
                "sourceType": "SOURCE_TYPE_BRANCH_FIXED",
                "x": 20,
                "y": 24
            },
            {
                "isSource": true,
                "isGitSource": false,
                "isRoot": false,
                "parents": [
                    "GIT-getting-started-nodejs"
                ],
                "id": "47",
                "x": 280,
                "y": 24,
                "parentAppId": 48,
                "parentCiPipeline": 43,
                "height": 64,
                "width": 240,
                "title": "colored-ci-logs-ci-ref-ci-ci-master",
                "triggerType": "Manual",
                "status": DEFAULT_STATUS,
                "type": "CI",
                "inputMaterialList": [],
                "downstreams": [
                    "CD-40"
                ],
                "isExternalCI": true,
                "isLinkedCI": true,
                "linkedCount": 0
            },
            {
                "parents": [
                    "47"
                ],
                "height": 64,
                "width": 240,
                "title": "Deploy",
                "isSource": false,
                "isGitSource": false,
                "id": "40",
                "activeIn": false,
                "activeOut": false,
                "downstreams": [],
                "type": "CD",
                "status": DEFAULT_STATUS,
                "triggerType": "Manual",
                "environmentName": "dev2",
                "environmentId": 3,
                "deploymentStrategy": "rolling",
                "inputMaterialList": [],
                "rollbackMaterialList": [],
                "stageIndex": 1,
                "x": 580,
                "y": 24,
                "isRoot": false
            }
        ],
        "startX": 0,
        "startY": 0,
        "height": 112,
        "width": 840
    }
];