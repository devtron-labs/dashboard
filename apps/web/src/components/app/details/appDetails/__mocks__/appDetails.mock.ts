/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
            ingress: [{ ip: '127.0.0.1' }],
            externalURLs: ['http://127.0.0.1'],
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
]

export const podMetadata = [
    {
        name: 'colorful-pod-logs-amit-dev-698bcdb789-86ssw',
        uid: '1ead3bab-adad-11ea-9e9f-02d9ecfd9bc6',
        containers: ['colorful-pod-logs'],
        isNew: true,
    },
]
