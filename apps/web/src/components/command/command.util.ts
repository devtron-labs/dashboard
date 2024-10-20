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

import { APIOptions } from '@devtron-labs/devtron-fe-common-lib'
import { getAppListMin, getAppOtherEnvironmentMin, getAvailableCharts } from '../../services/service'
import { CommandSuggestionType, COMMAND, COMMAND_REV } from './command.types'
import { URLS } from '../../config'

export const AllSuggestedArguments = [
    {
        value: COMMAND.APPLICATIONS,
        ref: undefined,
        data: {
            group: undefined,
            url: '/app',
            isEOC: false,
        },
    },
    {
        value: COMMAND.CHART,
        ref: undefined,
        data: {
            group: undefined,
            url: '/chart-store',
            isEOC: false,
        },
    },
    {
        value: COMMAND.SECURITY,
        ref: undefined,
        data: {
            group: undefined,
            url: '/security',
            isEOC: false,
        },
    },
    {
        value: COMMAND.GLOBAL_CONFIG,
        ref: undefined,
        data: {
            url: '/global-config',
            group: undefined,
            isEOC: false,
        },
    },
    {
        value: COMMAND.STACK_MANAGER,
        ref: undefined,
        data: {
            url: URLS.STACK_MANAGER_DISCOVER_MODULES,
            group: undefined,
            isEOC: false,
        },
    },
]

export function getArgumentSuggestions(args, options: APIOptions): Promise<CommandSuggestionType> {
    if (args.length === 0) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: AllSuggestedArguments,
                groups: [],
            })
        })
    }

    const arg = args[0]

    const obj = {
        app: getAppArguments,
        chart: getChartArguments,
        security: getSecurityArguments,
        'global-config': getGlobalConfigArguments,
        'stack-manager': getStackManagerArguments,
    }

    if (obj[arg.value]) {
        return obj[arg.value](args, options)
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    })
}

function getAppArguments(args, options): Promise<CommandSuggestionType> {
    // ["app", "appName", "envName", "pod", "podname"]
    if (args.length === 1) {
        return getAppListMin(null, options).then((response) => {
            const list = response.result.map((a) => {
                return {
                    value: a.name,
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.app,
                        value: a.id,
                        kind: 'appId',
                        url: `/app/${a.id}/details`,
                        isEOC: false,
                    },
                }
            })
            return {
                allSuggestionArguments: list || [],
                groups: [],
            }
        })
    }
    if (args[1] && args.length === 2) {
        // args[1] --> appName
        return getAppOtherEnvironmentMin(args[1].data.value).then((response) => {
            let list
            list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    ref: undefined,
                    data: {
                        value: a.environmentId,
                        kind: 'envId',
                        url: `/app/${args[1].data.value}/details/${a.environmentId}/Pod`,
                        group: COMMAND_REV.env,
                        isEOC: true,
                    },
                }
            })
            if (!list) {
                list = []
            }
            const l = [
                {
                    value: 'configure',
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.misc,
                        url: `/app/${args[1].data.value}/edit/workflow`,
                        isEOC: false,
                    },
                },
                {
                    value: 'trigger',
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.misc,
                        url: `/app/${args[1].data.value}/trigger`,
                        isEOC: true,
                    },
                },
                {
                    value: 'build-history',
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.misc,
                        url: `/app/${args[1].data.value}/ci-details`,
                        isEOC: true,
                    },
                },
                {
                    value: 'deployment-history',
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.misc,
                        url: `/app/${args[1].data.value}/cd-details`,
                        isEOC: true,
                    },
                },
                {
                    value: 'deployment-metrics',
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.misc,
                        url: `/app/${args[1].data.value}/deployment-metrics`,
                        isEOC: true,
                    },
                },
            ]

            list = list.concat(l)
            return {
                allSuggestionArguments: list,
                groups: [COMMAND_REV.env],
            }
        })
    }
    if (args[2] && args.length === 3) {
        // args[2] --> envName
        return new Promise((resolve, reject) => {
            if (args[2].value === 'configure') {
                resolve({
                    allSuggestionArguments: [
                        {
                            value: 'git-material',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/materials`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'docker-config',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/docker-build-config`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'deployment-template',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/deployment-template`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'workflow-editor',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/workflow`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'configmap',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/configmap`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'secrets',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/secrets`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'env-override',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/app/${args[1].data.value}/edit/env-override`,
                                isEOC: false,
                            },
                        },
                    ],
                    groups: [],
                })
            }
        })
    }
    if (args[3] && args.length === 4) {
        // args[3] --> pod
        if (args[3].value === 'env-override') {
            return getAppOtherEnvironmentMin(args[1].data.value).then((response) => {
                let list = response?.result?.map((a) => {
                    return {
                        value: a.environmentName,
                        ref: undefined,
                        data: {
                            group: COMMAND_REV.env,
                            value: a.environmentId,
                            kind: 'envId',
                            url: `/app/${args[1].data.value}/edit/env-override/${a.environmentId}`,
                            isEOC: true,
                        },
                    }
                })
                if (!list) {
                    list = []
                }
                return {
                    allSuggestionArguments: list,
                    groups: [COMMAND_REV.env],
                }
            })
        }
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    })
}

function getChartArguments(args, options): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [
                    {
                        value: 'discover',
                        ref: null,
                        data: {
                            group: undefined,
                            url: `/chart-store/discover`,
                            isEOC: false,
                        },
                    },
                ],
                groups: [],
            })
        })
    }
    if (args.length === 2) {
        if (args[1].value === 'discover') {
            return getAvailableCharts('', options).then((response) => {
                let list = response?.result?.map((chart) => {
                    return {
                        value: `${chart.chart_name}/${chart.name}`,
                        ref: undefined,
                        data: {
                            group: undefined,
                            value: chart.id,
                            kind: 'chartId',
                            url: `/chart-store/discover/chart/${chart.id}`,
                            isEOC: true,
                        },
                    }
                })
                if (!list) {
                    list = []
                }
                return {
                    allSuggestionArguments: list,
                    groups: [],
                }
            })
        }
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    })
}

function getSecurityArguments(args, options): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [
                    {
                        value: 'scans',
                        ref: undefined,
                        data: {
                            group: undefined,
                            url: `/security/scans`,
                            isEOC: true,
                        },
                    },
                    {
                        value: 'policies',
                        ref: undefined,
                        data: {
                            group: undefined,
                            url: `security/policies/global`,
                            isEOC: false,
                        },
                    },
                ],
                groups: [],
            })
        })
    }
    if (args.length === 2) {
        if (args[1].value === 'policies') {
            return new Promise((resolve, reject) => {
                resolve({
                    allSuggestionArguments: [
                        {
                            value: 'global',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/security/policies/global`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'cluster',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/security/policies/cluster`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'environment',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/security/policies/environments`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'applications',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/security/policies/apps`,
                                isEOC: true,
                            },
                        },
                        {
                            value: 'cve policy',
                            ref: undefined,
                            data: {
                                group: undefined,
                                url: `/security/policies/vulnerability`,
                                isEOC: true,
                            },
                        },
                    ],
                    groups: [],
                })
            })
        }
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    })
}

function getGlobalConfigArguments(args, options): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [
                    {
                        value: 'git-account',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/git',
                            isEOC: true,
                        },
                    },
                    {
                        value: 'cluster-and-environments',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/cluster-env',
                            isEOC: true,
                        },
                    },
                    {
                        value: 'docker-registeries',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/docker',
                            isEOC: true,
                        },
                    },
                    {
                        value: 'chart repository',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/chart-repo',
                            isEOC: true,
                        },
                    },
                    {
                        value: 'projects',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/projects',
                            isEOC: true,
                        },
                    },
                    {
                        value: 'user-access',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/auth/users',
                            isEOC: false,
                        },
                    },
                    {
                        value: 'notification',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/notifier/channels',
                            isEOC: false,
                        },
                    },
                    {
                        value: 'sso login',
                        ref: null,
                        data: {
                            group: undefined,
                            url: '/global-config/auth/login-service',
                            isEOC: false,
                        },
                    },
                ],
                groups: [],
            })
        })
    }
    if (args.length === 2) {
        if (args[1].value === 'user-access') {
            return new Promise((resolve, reject) => {
                resolve({
                    allSuggestionArguments: [
                        {
                            value: 'users',
                            ref: null,
                            data: {
                                group: undefined,
                                url: '/global-config/auth/users',
                                isEOC: true,
                            },
                        },
                        {
                            value: 'groups',
                            ref: null,
                            data: {
                                group: undefined,
                                url: '/global-config/auth/groups',
                                isEOC: true,
                            },
                        },
                    ],
                    groups: [],
                })
            })
        }
        if (args[1].value === 'notification') {
            return new Promise((resolve, reject) => {
                resolve({
                    allSuggestionArguments: [
                        {
                            value: 'add-new',
                            ref: null,
                            data: {
                                group: undefined,
                                url: '/global-config/notifier/edit',
                                isEOC: true,
                            },
                        },
                        {
                            value: 'list',
                            ref: null,
                            data: {
                                group: undefined,
                                url: '/global-config/notifier/channels',
                                isEOC: true,
                            },
                        },
                        {
                            value: 'configuration',
                            ref: null,
                            data: {
                                group: undefined,
                                url: '/global-config/notifier/configurations',
                                isEOC: true,
                            },
                        },
                    ],
                    groups: [],
                })
            })
        }
    }

    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    })
}

function getStackManagerArguments(args, options): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [
                    {
                        value: 'discover integrations',
                        ref: null,
                        data: {
                            group: undefined,
                            url: URLS.STACK_MANAGER_DISCOVER_MODULES,
                            isEOC: false,
                        },
                    },
                    {
                        value: 'installed integrations',
                        ref: null,
                        data: {
                            group: undefined,
                            url: URLS.STACK_MANAGER_INSTALLED_MODULES,
                            isEOC: false,
                        },
                    },
                    {
                        value: 'about devtron',
                        ref: null,
                        data: {
                            group: undefined,
                            url: URLS.STACK_MANAGER_ABOUT,
                            isEOC: false,
                        },
                    },
                ],
                groups: [],
            })
        })
    }

    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    })
}
