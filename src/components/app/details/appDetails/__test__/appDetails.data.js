export const nodes = [
    {
        group: 'extensions',
        version: 'v1beta1',
        kind: 'Ingress',
        namespace: 'amit-dev',
        name: 'colorful-pod-logs-amit-dev-ingress',
        uid: '87bcb4e8-a188-11ea-9e9f-02d9ecfd9bc6',
        networkingInfo: {
            targetRefs: [{ kind: 'Service', namespace: 'amit-dev', name: 'colorful-pod-logs-amit-dev-service' }],
            ingress: [{ ip: '3.12.107.88' }],
            externalURLs: ['http://3.12.107.88'],
        },
        resourceVersion: '3654649',
        health: { status: 'Healthy' },
    },
    {
        group: 'argoproj.io',
        version: 'v1alpha1',
        kind: 'Rollout',
        namespace: 'amit-dev',
        name: 'colorful-pod-logs-amit-dev',
        uid: '87d73ad7-a188-11ea-9e9f-02d9ecfd9bc6',
        info: [{ name: 'Revision', value: 'Rev:1' }],
        resourceVersion: '5739792',
        health: { status: 'Healthy', message: 'The rollout has completed canary deployment' },
    },
    {
        group: 'apps',
        version: 'v1',
        kind: 'ReplicaSet',
        namespace: 'amit-dev',
        name: 'colorful-pod-logs-amit-dev-698bcdb789',
        uid: '87e3c24d-a188-11ea-9e9f-02d9ecfd9bc6',
        parentRefs: [
            {
                group: 'argoproj.io',
                kind: 'Rollout',
                namespace: 'amit-dev',
                name: 'colorful-pod-logs-amit-dev',
                uid: '87d73ad7-a188-11ea-9e9f-02d9ecfd9bc6',
            },
        ],
        info: [{ name: 'Revision', value: 'Rev:1' }],
        resourceVersion: '5739030',
        health: { status: 'Healthy' },
    },
    {
        version: 'v1',
        kind: 'Pod',
        namespace: 'amit-dev',
        name: 'colorful-pod-logs-amit-dev-698bcdb789-86ssw',
        uid: '1ead3bab-adad-11ea-9e9f-02d9ecfd9bc6',
        parentRefs: [
            {
                group: 'apps',
                kind: 'ReplicaSet',
                namespace: 'amit-dev',
                name: 'colorful-pod-logs-amit-dev-698bcdb789',
                uid: '87e3c24d-a188-11ea-9e9f-02d9ecfd9bc6',
            },
        ],
        info: [
            { name: 'Status Reason', value: 'Running' },
            { name: 'Containers', value: '1/1' },
        ],
        networkingInfo: {
            labels: {
                app: 'colorful-pod-logs',
                appId: '9',
                envId: '3',
                release: 'colorful-pod-logs-amit-dev',
                'rollouts-pod-template-hash': '698bcdb789',
            },
        },
        resourceVersion: '5738839',
        images: ['686244538589.dkr.ecr.us-east-2.amazonaws.com/devtron:0545ad3a-18-34'],
        health: { status: 'Healthy' },
    },
    {
        version: 'v1',
        kind: 'Service',
        namespace: 'amit-dev',
        name: 'colorful-pod-logs-amit-dev-service',
        uid: '879870bb-a188-11ea-9e9f-02d9ecfd9bc6',
        networkingInfo: { targetLabels: { app: 'colorful-pod-logs' } },
        resourceVersion: '1862134',
        health: { status: 'Healthy' },
    },
    {
        version: 'v1',
        kind: 'Endpoints',
        namespace: 'amit-dev',
        name: 'colorful-pod-logs-amit-dev-service',
        uid: '879aed30-a188-11ea-9e9f-02d9ecfd9bc6',
        parentRefs: [
            {
                kind: 'Service',
                namespace: 'amit-dev',
                name: 'colorful-pod-logs-amit-dev-service',
                uid: '879870bb-a188-11ea-9e9f-02d9ecfd9bc6',
            },
        ],
        resourceVersion: '5738841',
    },
];

export const podMetadata = [
    {
        name: 'colorful-pod-logs-amit-dev-698bcdb789-86ssw',
        uid: '1ead3bab-adad-11ea-9e9f-02d9ecfd9bc6',
        containers: ['colorful-pod-logs'],
        isNew: true,
    },
];

export const appDetails = {
    "code": 200,
    "status": "OK",
    "result": {
        "appId": 1,
        "appName": "dashboard",
        "environmentId": 7,
        "environmentName": "demo-devtroncd",
        "namespace": "devtroncd",
        "lastDeployedTime": "2021-04-16 07:15:04.244687+00",
        "lastDeployedBy": "rashmi@devtron.ai",
        "materialInfo": [
            {
                "author": "rashmirai21 <rashmi@devtron.ai>",
                "branch": "deploy-to-demo",
                "message": "Merge branch 'user-access-onsave' into deploy-to-demo\n",
                "modifiedTime": "2021-04-16T11:27:17+05:30",
                "revision": "f9068dd13f1624c087ae4566396435a70f318d7b",
                "url": "https://github.com/devtron-labs/dashboard.git"
            }
        ],
        "releaseVersion": "221",
        "dataSource": "CI-RUNNER",
        "lastDeployedPipeline": "demo-cd-pipeline",
        "deprecated": false,
        "k8sVersion": "",
        "instanceDetail": null,
        "otherEnvironment": [
            {
                "environmentId": 4,
                "environmentName": "prod-devtroncd",
                "appMetrics": true,
                "infraMetrics": true,
                "prod": false
            },
            {
                "environmentId": 7,
                "environmentName": "demo-devtroncd",
                "appMetrics": false,
                "infraMetrics": true,
                "prod": false
            },
            {
                "environmentId": 12,
                "environmentName": "bp-devtroncd",
                "appMetrics": false,
                "infraMetrics": true,
                "prod": false
            }
        ],
        "resourceTree": {
            "nodes": nodes,
            "newGenerationReplicaSet": "dashboard-demo-devtroncd-f6c57c69b",
            "status": "Healthy",
            "podMetadata": podMetadata,
            "conditions": null
        }
    }
}