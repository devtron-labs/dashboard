export const CiPipelineMonoGit = {
    "code": 200,
    "status": "OK",
    "result": {
        "isManual": false,
        "dockerArgs": {},
        "isExternal": false,
        "parentCiPipeline": 0,
        "parentAppId": 0,
        "externalCiConfig": {
            "id": 0,
            "webhookUrl": "",
            "payload": "",
            "accessKey": ""
        },
        "ciMaterial": [
            {
                "source": {
                    "type": "SOURCE_TYPE_BRANCH_FIXED",
                    "value": "master"
                },
                "gitMaterialId": 20,
                "id": 20,
                "gitMaterialName": "django-repo",
                "gitHostId": 1
            }
        ],
        "name": "ci-22-uot4",
        "id": 20,
        "active": true,
        "beforeDockerBuildScripts": [
            {
                "id": 2,
                "index": 1,
                "name": "erferf",
                "script": "git rev-parse  HEAD\ngit rev-parse --short HEAD\n",
                "outputLocation": ""
            }
        ],
        "linkedCount": 0,
        "scanEnabled": false,
        "appWorkflowId": 19
    }
}

export const CiPipelineWebhook = {
    "code": 200,
    "status": "OK",
    "result": {
        "isManual": false,
        "dockerArgs": {},
        "isExternal": false,
        "parentCiPipeline": 0,
        "parentAppId": 0,
        "externalCiConfig": {
            "id": 0,
            "webhookUrl": "",
            "payload": "",
            "accessKey": ""
        },
        "ciMaterial": [
            {
                "source": {
                    "type": "Webhook",
                    "value": '[{"eventId":1,"condition":{"1":"abc","2":"def"}}]'
                },
                "gitMaterialId": 20,
                "id": 20,
                "gitMaterialName": "django-repo",
                "gitHostId": 1
            }
        ],
        "name": "ci-22-uot4",
        "id": 20,
        "active": true,
        "beforeDockerBuildScripts": [
            {
                "id": 2,
                "index": 1,
                "name": "erferf",
                "script": "git rev-parse  HEAD\ngit rev-parse --short HEAD\n",
                "outputLocation": ""
            }
        ],
        "linkedCount": 0,
        "scanEnabled": false,
        "appWorkflowId": 19
    }
}

const GitMaterialMonoGit = {
    "code": 200,
    "status": "OK",
    "result": {
        "id": 22,
        "appName": "app6",
        "material": [
            {
                "name": "django-repo",
                "url": "https://github.com/vikramdevtron/django-repo.git",
                "id": 20,
                "gitProviderId": 1,
                "checkoutPath": "./"
            }
        ],
        "teamId": 2,
        "templateId": 0
    }
}

export const WebhookEvents = {
    "code": 200,
    "status": "OK",
    "result": {
        "events": [
            {
                "id": 1,
                "name": "pull_request",
                "selectors": [
                    {
                        "id": 1,
                        "name": "prTitle",
                        "value": "a.b.c"
                    },
                    {
                        "id": 2,
                        "name": "prUrl",
                        "value": "a.b.d"
                    }
                ]
            }
        ]
    }
} 
