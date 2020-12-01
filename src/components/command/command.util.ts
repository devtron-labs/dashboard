import { getAppListMin, getAppOtherEnvironment, getAvailableCharts } from '../../services/service';
import { CommandSuggestionType, COMMAND, COMMAND_REV } from './command.types';

export function getArgumentSuggestions(args): Promise<CommandSuggestionType> {
    if (args.length === 0) return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [
                {
                    value: COMMAND.APPLICATIONS,
                    ref: undefined,
                    data: {
                        group: undefined,

                        isValid: true,
                        isEOC: false
                    }
                },
                {
                    value: COMMAND.CHART,
                    ref: undefined,
                    data: {
                        group: undefined,

                        isValid: true,
                        isEOC: false
                    }
                },
                {
                    value: COMMAND.SECURITY,
                    ref: undefined,
                    data: {
                        group: undefined,

                        isValid: true,
                        isEOC: false
                    }
                },
                {
                    value: COMMAND.GLOBAL_CONFIG,
                    ref: undefined,
                    data: {
                        group: undefined,

                        isValid: true,
                        isEOC: false
                    }
                }],
            groups: [],
        })
    });

    let arg = args[0];
    switch (arg.value) {
        case 'app': return getAppArguments(args);
        case 'chart': return getChartArguments(args);
        case 'security': return getSecurityArguments(args);
        case 'global-config': return getGlobalConfigArguments(args);
        default: return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [],
                groups: [],
            })
        });
    }
}


function getAppArguments(args): Promise<CommandSuggestionType> {
    //["app", "appName", "envName", "pod", "podname"]
    if (args.length === 1) {
        return getAppListMin().then((response) => {
            let list = response.result.map((a) => {
                return {
                    value: a.name,
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.app,

                        value: a.id,
                        kind: 'appId',
                        isValid: true,
                        url: `/app/${a.id}/details`,
                        isEOC: false,
                    }
                }
            })
            return {
                allSuggestionArguments: list || [],
                groups: []
            }
        })
    }
    else if (args[1] && args.length === 2) { // args[1] --> appName
        return getAppOtherEnvironment(args[1].data.value).then((response) => {
            let list;
            list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    ref: undefined,
                    data: {
                        value: a.environmentId,
                        kind: 'envId',
                        isValid: true,
                        url: `/app/${args[1].data.value}/details/${a.environmentId}/Pod`,
                        group: COMMAND_REV.env,
                        isEOC: false,
                    }
                }
            });
            if (!list) list = [];
            list.push({
                value: 'configure',
                ref: undefined,
                data: {
                    group: COMMAND_REV.misc,

                    isValid: true,
                    url: `/app/${args[1].data.value}/edit/workflow`,
                    isEOC: false
                }
            })
            return {
                allSuggestionArguments: list,
                groups: [COMMAND_REV.env]
            }
        })
    }
    else if (args[2] && args.length === 3) { // args[2] --> envName/config
        if (args[2].value === 'configure') return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [{
                    value: 'git-material',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/materials`,
                        isValid: true,
                        isEOC: true
                    },
                },
                {
                    value: 'docker-config',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/docker-build-config`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'deployment-template',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/deployment-template`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'workflow-editor',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/workflow`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'configmap',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/configmap`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'secrets',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/secrets`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'env-override',
                    ref: undefined,
                    data: {
                        group: undefined,
                        url: `/app/${args[1].data.value}/edit/env-override`,
                        isValid: true,
                        isEOC: false
                    }
                }],
                groups: [],
            })
        })
        else return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [
                    {
                        value: 'trigger',
                        ref: undefined,
                        data: {
                            group: undefined,
                            url: `/app/${args[1].data.value}/trigger`,
                            isValid: true,
                            isEOC: true
                        }
                    },
                    {
                        value: 'build-history',
                        ref: undefined,
                        data: {
                            group: undefined,
                            url: `/app/${args[1].data.value}/ci-details`,
                            isValid: true,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'deployment-history',
                        ref: undefined,
                        data: {
                            group: undefined,
                            url: `/app/${args[1].data.value}/cd-details`,
                            isValid: true,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'deployment-metrics',
                        ref: undefined,
                        data: {
                            group: undefined,
                            url: `/app/${args[1].data.value}/deployment-metrics/${args[2].data.value}`,
                            isValid: true,
                            isEOC: true,
                        }
                    }],
                groups: [],
            })
        })
    }
    else if (args[3] && args.length === 4) { // args[3] --> pod
        if (args[3].value === "env-override") return getAppOtherEnvironment(args[1].data.value).then((response) => {
            let list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    ref: undefined,
                    data: {
                        group: COMMAND_REV.env,
                        value: a.environmentId,
                        kind: 'envId',
                        isValid: true,
                        url: `/app/${args[1].data.value}/edit/env-override/${a.environmentId}`,
                        isEOC: true,
                    }
                }
            });
            if (!list) list = [];
            return {
                allSuggestionArguments: list,
                groups: [COMMAND_REV.env]
            }
        })
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: []
        })
    })
}


function getChartArguments(args): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [{
                    value: 'discover',
                    ref: null,
                    data: {
                        group: undefined,
                        isValid: true,
                        isEOC: false,
                    }
                },
                {
                    value: 'deployed',
                    ref: null,
                    data: {
                        group: undefined,
                        url: `/chart-store/deployed`,
                        isValid: true,
                        isEOC: true,
                    }
                }],
                groups: []
            })
        });
    }
    else if (args.length === 2) {
        if (args[1].value === 'discover') {
            return getAvailableCharts().then((response) => {
                let list = response?.result?.map((chart) => {
                    return {
                        value: `${chart.chart_name}/${chart.name}`,
                        ref: undefined,
                        data: {
                            group: undefined,
                            value: chart.id,
                            kind: 'chartId',
                            isValid: true,
                            url: `/chart-store/discover/chart/${chart.id}`,
                            isEOC: true,
                        }
                    }
                })
                if (!list) list = [];
                return {
                    allSuggestionArguments: list,
                    groups: []
                }
            })
        }
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: []
        })
    });
}


function getSecurityArguments(args): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [{
                    value: 'scans',
                    ref: undefined,
                    data: {
                        group: undefined,


                        isValid: true,
                        url: `/security/scans`,
                        isEOC: true,
                    }
                }, {
                    value: 'policies',
                    ref: undefined,
                    data: {
                        group: undefined,


                        isValid: true,
                        url: `security/policies/global`,
                        isEOC: false,
                    }
                }
                ],
                groups: []
            })
        });
    }
    else if (args.length === 2) {
        if (args[1].value === 'policies') {
            return new Promise((resolve, reject) => {
                resolve({
                    allSuggestionArguments: [{
                        value: 'global',
                        ref: undefined,
                        data: {
                            group: undefined,


                            isValid: true,
                            url: `security/policies/global`,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'cluster',
                        ref: undefined,
                        data: {
                            group: undefined,


                            isValid: true,
                            url: `security/policies/cluster`,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'environment',
                        ref: undefined,
                        data: {
                            group: undefined,


                            isValid: true,
                            url: `security/policies/environments`,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'applications',
                        ref: undefined,
                        data: {
                            group: undefined,


                            isValid: true,
                            url: `security/policies/apps`,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'cve policy',
                        ref: undefined,
                        data: {
                            group: undefined,


                            isValid: true,
                            url: `security/policies/vulnerability`,
                            isEOC: true,
                        }
                    }],
                    groups: []
                })
            });
        }
    }
    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    });
}


function getGlobalConfigArguments(args): Promise<CommandSuggestionType> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve({
                allSuggestionArguments: [{
                    value: 'git-account',
                    ref: null,
                    data: {
                        group: undefined,


                        url: '/global-config/git',
                        isValid: true,
                        isEOC: true,
                    }
                }, {
                    value: 'cluster-and-environments',
                    ref: null,
                    data: {
                        group: undefined,


                        url: '/global-config/cluster-env',
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'docker-registeries',
                    ref: null,
                    data: {
                        group: undefined,


                        url: '/global-config/docker',
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'projects',
                    ref: null,
                    data: {
                        group: undefined,


                        url: '/global-config/projects',
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'user-access',
                    ref: null,
                    data: {
                        group: undefined,


                        url: '/global-config/auth/users',
                        isValid: true,
                        isEOC: false,
                    }
                },
                {
                    value: 'notification',
                    ref: null,
                    data: {
                        group: undefined,


                        url: '/global-config/notifier/channels',
                        isValid: true,
                        isEOC: false,
                    }
                }],
                groups: []
            })
        });
    }
    else if (args.length === 2) {
        if (args[1].value === "user-access") {
            return new Promise((resolve, reject) => {
                resolve({
                    allSuggestionArguments: [{
                        value: 'users',
                        ref: null,
                        data: {
                            group: undefined,


                            url: '/global-config/auth/users',
                            isValid: true,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'groups',
                        ref: null,
                        data: {
                            group: undefined,


                            url: '/global-config/auth/groups',
                            isValid: true,
                            isEOC: true,
                        }
                    }],
                    groups: [],
                })
            });
        }
        else if (args[1].value === "notification") {
            return new Promise((resolve, reject) => {
                resolve({
                    allSuggestionArguments: [{
                        value: 'add-new',
                        ref: null,
                        data: {
                            group: undefined,


                            url: '/global-config/notifier/edit',
                            isValid: true,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'list',
                        ref: null,
                        data: {
                            group: undefined,


                            url: '/global-config/notifier/channels',
                            isValid: true,
                            isEOC: true,
                        }
                    },
                    {
                        value: 'configuration',
                        ref: null,
                        data: {
                            group: undefined,


                            url: '/global-config/notifier/configurations',
                            isValid: true,
                            isEOC: true,
                        }
                    }
                    ],
                    groups: []
                })
            });
        }
    }

    return new Promise((resolve, reject) => {
        resolve({
            allSuggestionArguments: [],
            groups: [],
        })
    });
}