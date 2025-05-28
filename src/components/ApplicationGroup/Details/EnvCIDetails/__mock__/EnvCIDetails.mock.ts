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

import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

import { CIConfigListType } from '../../../AppGroup.types'

export const filteredData: string = '1,2'

export async function mockCIList(): Promise<CIConfigListType> {
    return {
        pipelineList: [
            {
                id: 45,
                appId: 29,
                appName: 'prakash-10april',
                parentCiPipeline: 0,
                parentAppId: 0,
            },
            {
                id: 99,
                appId: 98,
                appName: 'test-dropdown',
                parentCiPipeline: 22,
                parentAppId: 21,
            },
        ],
        securityModuleInstalled: false,
        blobStorageConfigured: false,
    }
}

export async function mockTrigger(): Promise<ResponseType> {
    const response = {
        code: 200,
        status: 'OK',
        result: [
            {
                id: 363,
                name: '363-ci-29-p98f-45-nzfzd',
                status: 'Succeeded',
                podStatus: 'Succeeded',
                message: '',
                startedOn: '2023-04-13T14:38:16.36662Z',
                finishedOn: '2023-04-13T14:42:20Z',
                ciPipelineId: 45,
                namespace: 'devtron-ci',
                logLocation: 'staging-v1/363-ci-29-p98f-45/main.log',
                blobStorageEnabled: true,
                gitTriggers: {
                    '46': {
                        Commit: 'ff91147fb4d25925495874b6596a55c0905836ee',
                        Author: 'Test User <test@devtron.ai>',
                        Date: '2023-04-13T20:06:46+05:30',
                        Message: 'minor fix\n',
                        Changes: null,
                        WebhookData: {
                            Id: 0,
                            EventActionType: '',
                            Data: null,
                        },
                        CiConfigureSourceValue: 'ssh-key-directory-change-filemode',
                        GitRepoUrl: 'https://github.com/devtron-labs/git-sensor.git',
                        GitRepoName: 'git-sensor',
                        CiConfigureSourceType: 'SOURCE_TYPE_BRANCH_FIXED',
                    },
                },
                ciMaterials: [
                    {
                        id: 46,
                        gitMaterialId: 34,
                        gitMaterialUrl: '',
                        gitMaterialName: 'git-sensor',
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'ssh-key-directory-change-filemode',
                        active: true,
                        lastFetchTime: '0001-01-01T00:00:00Z',
                        isRepoError: false,
                        repoErrorMsg: '',
                        isBranchError: false,
                        branchErrorMsg: '',
                        url: 'https://github.com/devtron-labs/git-sensor.git',
                        regex: '',
                    },
                ],
                triggeredBy: 30,
                artifact: 'prakash1001/sams-repository-2:ff91147f-45-363',
                triggeredByEmail: 'test@devtron.ai',
                stage: '',
                artifactId: 301,
                isArtifactUploaded: false,
            },
            {
                id: 359,
                name: '359-ci-29-p98f-45-s2qw2',
                status: 'Succeeded',
                podStatus: 'Succeeded',
                message: '',
                startedOn: '2023-04-13T12:43:12.573505Z',
                finishedOn: '2023-04-13T12:47:00Z',
                ciPipelineId: 45,
                namespace: 'devtron-ci',
                logLocation: 'staging-v1/359-ci-29-p98f-45/main.log',
                blobStorageEnabled: true,
                gitTriggers: {
                    '46': {
                        Commit: '3b0fdd9024e034b838adc530d0943cabd483c154',
                        Author: 'Test User <test@devtron.ai>',
                        Date: '2023-04-13T18:12:49+05:30',
                        Message: 'minor fix in mode permissions for ssh key file\n',
                        Changes: null,
                        WebhookData: {
                            Id: 0,
                            EventActionType: '',
                            Data: null,
                        },
                        CiConfigureSourceValue: 'ssh-key-directory-change-filemode',
                        GitRepoUrl: 'https://github.com/devtron-labs/git-sensor.git',
                        GitRepoName: 'git-sensor',
                        CiConfigureSourceType: 'SOURCE_TYPE_BRANCH_FIXED',
                    },
                },
                ciMaterials: [
                    {
                        id: 46,
                        gitMaterialId: 34,
                        gitMaterialUrl: '',
                        gitMaterialName: 'git-sensor',
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'ssh-key-directory-change-filemode',
                        active: true,
                        lastFetchTime: '0001-01-01T00:00:00Z',
                        isRepoError: false,
                        repoErrorMsg: '',
                        isBranchError: false,
                        branchErrorMsg: '',
                        url: 'https://github.com/devtron-labs/git-sensor.git',
                        regex: '',
                    },
                ],
                triggeredBy: 1,
                artifact: 'prakash1001/sams-repository-2:3b0fdd90-45-359',
                triggeredByEmail: 'system',
                stage: '',
                artifactId: 297,
                isArtifactUploaded: false,
            },
            {
                id: 354,
                name: '354-ci-29-p98f-45-jc6mf',
                status: 'Succeeded',
                podStatus: 'Succeeded',
                message: '',
                startedOn: '2023-04-13T11:03:01.599396Z',
                finishedOn: '2023-04-13T11:05:03Z',
                ciPipelineId: 45,
                namespace: 'devtron-ci',
                logLocation: 'staging-v1/354-ci-29-p98f-45/main.log',
                blobStorageEnabled: true,
                gitTriggers: {
                    '46': {
                        Commit: 'bea4e0e0d49be8df947d5c1de88b36dbe42dbb11',
                        Author: 'Test User <test@devtron.ai>',
                        Date: '2023-04-13T16:21:44+05:30',
                        Message: 'ssh key mode changed\n',
                        Changes: null,
                        WebhookData: {
                            Id: 0,
                            EventActionType: '',
                            Data: null,
                        },
                        CiConfigureSourceValue: 'ssh-key-directory-change-filemode',
                        GitRepoUrl: 'https://github.com/devtron-labs/git-sensor.git',
                        GitRepoName: 'git-sensor',
                        CiConfigureSourceType: 'SOURCE_TYPE_BRANCH_FIXED',
                    },
                },
                ciMaterials: [
                    {
                        id: 46,
                        gitMaterialId: 34,
                        gitMaterialUrl: '',
                        gitMaterialName: 'git-sensor',
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'ssh-key-directory-change-filemode',
                        active: true,
                        lastFetchTime: '0001-01-01T00:00:00Z',
                        isRepoError: false,
                        repoErrorMsg: '',
                        isBranchError: false,
                        branchErrorMsg: '',
                        url: 'https://github.com/devtron-labs/git-sensor.git',
                        regex: '',
                    },
                ],
                triggeredBy: 30,
                artifact: 'prakash1001/sams-repository-2:bea4e0e0-45-354',
                triggeredByEmail: 'test@devtron.ai',
                stage: '',
                artifactId: 290,
                isArtifactUploaded: false,
            },
            {
                id: 353,
                name: '353-ci-29-p98f-45-jl6d2',
                status: 'Failed',
                podStatus: 'Failed',
                message: 'Error (exit code 1)',
                startedOn: '2023-04-13T11:00:46.900724Z',
                finishedOn: '2023-04-13T11:02:26Z',
                ciPipelineId: 45,
                namespace: 'devtron-ci',
                logLocation: 'staging-v1/353-ci-29-p98f-45/main.log',
                blobStorageEnabled: true,
                gitTriggers: {
                    '46': {
                        Commit: 'bea4e0e0d49be8df947d5c1de88b36dbe42dbb11',
                        Author: 'Test User <test@devtron.ai>',
                        Date: '2023-04-13T16:21:44+05:30',
                        Message: 'ssh key mode changed\n',
                        Changes: null,
                        WebhookData: {
                            Id: 0,
                            EventActionType: '',
                            Data: null,
                        },
                        CiConfigureSourceValue: 'ssh-key-directory-change-filemode',
                        GitRepoUrl: 'https://github.com/devtron-labs/git-sensor.git',
                        GitRepoName: 'git-sensor',
                        CiConfigureSourceType: 'SOURCE_TYPE_BRANCH_FIXED',
                    },
                },
                ciMaterials: [
                    {
                        id: 46,
                        gitMaterialId: 34,
                        gitMaterialUrl: '',
                        gitMaterialName: 'git-sensor',
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'ssh-key-directory-change-filemode',
                        active: true,
                        lastFetchTime: '0001-01-01T00:00:00Z',
                        isRepoError: false,
                        repoErrorMsg: '',
                        isBranchError: false,
                        branchErrorMsg: '',
                        url: 'https://github.com/devtron-labs/git-sensor.git',
                        regex: '',
                    },
                ],
                triggeredBy: 30,
                artifact: '',
                triggeredByEmail: 'test@devtron.ai',
                stage: '',
                artifactId: 0,
                isArtifactUploaded: false,
            },
            {
                id: 350,
                name: '350-ci-29-p98f-45-thntv',
                status: 'Failed',
                podStatus: 'Failed',
                message: 'Error (exit code 1)',
                startedOn: '2023-04-13T10:56:48.655247Z',
                finishedOn: '2023-04-13T10:59:34Z',
                ciPipelineId: 45,
                namespace: 'devtron-ci',
                logLocation: 'staging-v1/350-ci-29-p98f-45/main.log',
                blobStorageEnabled: true,
                gitTriggers: {
                    '46': {
                        Commit: 'bea4e0e0d49be8df947d5c1de88b36dbe42dbb11',
                        Author: 'Test User <test@devtron.ai>',
                        Date: '2023-04-13T16:21:44+05:30',
                        Message: 'ssh key mode changed\n',
                        Changes: null,
                        WebhookData: {
                            Id: 0,
                            EventActionType: '',
                            Data: null,
                        },
                        CiConfigureSourceValue: 'ssh-key-directory-change-filemode',
                        GitRepoUrl: 'https://github.com/devtron-labs/git-sensor.git',
                        GitRepoName: 'git-sensor',
                        CiConfigureSourceType: 'SOURCE_TYPE_BRANCH_FIXED',
                    },
                },
                ciMaterials: [
                    {
                        id: 46,
                        gitMaterialId: 34,
                        gitMaterialUrl: '',
                        gitMaterialName: 'git-sensor',
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'ssh-key-directory-change-filemode',
                        active: true,
                        lastFetchTime: '0001-01-01T00:00:00Z',
                        isRepoError: false,
                        repoErrorMsg: '',
                        isBranchError: false,
                        branchErrorMsg: '',
                        url: 'https://github.com/devtron-labs/git-sensor.git',
                        regex: '',
                    },
                ],
                triggeredBy: 30,
                artifact: '',
                triggeredByEmail: 'test@devtron.ai',
                stage: '',
                artifactId: 0,
                isArtifactUploaded: false,
            },
        ],
    }

    return response
}
