import { getAppListMin, getAppOtherEnvironment, getAvailableCharts } from '../../services/service';
import { SuggestedArgumentType } from './Command';

export const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config'
}

export const COMMAND_REV = {
    app: 'Applications',
    chart: 'Charts',
    security: 'Security',
    env: 'environments',
    'global-config': 'Global Config',
}

export function getArgumentSuggestions(args): Promise<any> {
    if (args.length === 0) return new Promise((resolve, reject) => {
        resolve([{ value: COMMAND.APPLICATIONS, ref: undefined, data: { isValid: true, isEOC: false } },
        { value: COMMAND.CHART, ref: undefined, data: { isValid: true, isEOC: false } },
        { value: COMMAND.SECURITY, ref: undefined, data: { isValid: true, isEOC: false } },
        { value: COMMAND.GLOBAL_CONFIG, ref: undefined, data: { isValid: true, isEOC: false } }])
    });

    let arg = args[0];
    switch (arg.value) {
        case 'app': return getAppArguments(args);
        case 'chart': return getChartArguments(args);
        case 'security': return getSecurityArguments(args);
        case 'global-config': return getGlobalConfigArguments(args);
        default: return new Promise((resolve, reject) => {
            resolve([])
        });
    }
}


function getAppArguments(args): Promise<SuggestedArgumentType[]> {
    //["app", "appName", "envName", "pod", "podname"]
    if (args.length === 1) {
        return getAppListMin().then((response) => {
            let list = response.result.map((a) => {
                return {
                    value: a.name,
                    ref: undefined,
                    data: {
                        value: a.id,
                        kind: 'appId',
                        isValid: true,
                        url: `/app/${a.id}/details`,
                        group: COMMAND_REV.app,
                        isEOC: false,
                    }
                }
            })
            return list;
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
                value: 'config',
                ref: undefined,
                data: {
                    isValid: true,
                    url: `/app/${args[1].data.value}/edit/workflow`,
                    isEOC: false
                }
            })
            return list;
        })
    }
    else if (args[2] && args.length === 3) { // args[2] --> envName/config
        if (args[2].value === 'config') return new Promise((resolve, reject) => {
            resolve([
                {
                    value: 'git-material',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/materials`,
                        isValid: true,
                        isEOC: true
                    },
                },
                {
                    value: 'docker-config',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/docker-build-config`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'deployment-template',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/deployment-template`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'workflow-editor',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/workflow`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'configmap',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/configmap`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'secrets',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/secrets`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'env-override',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/env-override`,
                        isValid: true,
                        isEOC: false
                    }
                }
            ])
        })
        else return new Promise((resolve, reject) => {
            resolve([
                {
                    value: 'app-details',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod`,
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'trigger',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/trigger`,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'build-history',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/ci-details`,
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'deployment-history',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/cd-details`,
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'deployment-metrics',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/deployment-metrics`,
                        isValid: true,
                        isEOC: true,
                    }
                },
            ])
        })
    }
    else if (args[3] && args.length === 4) { // args[3] --> pod
        if (args[3].value === "env-override") return getAppOtherEnvironment(args[1].data.value).then((response) => {
            let list;
            list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    ref: undefined,
                    data: {
                        value: a.environmentId,
                        kind: 'envId',
                        isValid: true,
                        url: `/app/${args[1].data.value}/edit/env-override/${a.environmentId}`,
                        isEOC: true,
                        group: COMMAND_REV.env
                    }
                }
            });
            if (!list) list = [];
            return list;
        })
    }
    return new Promise((resolve, reject) => {
        resolve([])
    })
}


function getChartArguments(args): Promise<SuggestedArgumentType[]> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve([
                {
                    value: 'discover',
                    ref: null,
                    data: {
                        isValid: true,
                        isEOC: false,
                    }
                },
                {
                    value: 'deployed',
                    ref: null,
                    data: {
                        isValid: true,
                        isEOC: true,
                    }
                },
            ])
        });
    }
    else if (args.length === 2) {
        if (args[1].value === "discover") {
            return getAvailableCharts().then((response) => {
                let list = response?.result?.map((chart) => {
                    return {
                        value: `${chart.chart_name}/${chart.name}`,
                        ref: undefined,
                        data: {
                            value: chart.id,
                            kind: 'chartId',
                            isValid: true,
                            url: `/chart-store/discover/chart/${chart.id}`,
                            isEOC: true,
                            group: COMMAND_REV.chart
                        }
                    }
                })
                return list;
            })
        }
    }
    return new Promise((resolve, reject) => {
        return new Promise((resolve, reject) => {
            resolve([])
        });
    });
}


function getSecurityArguments(args): Promise<SuggestedArgumentType[]> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve([{
                value: 'scans',
                ref: undefined,
                data: {
                    isValid: true,
                    url: `/security/scans`,
                    isEOC: true,
                    group: COMMAND_REV["global-config"]
                }
            }, {
                value: 'policies',
                ref: undefined,
                data: {
                    isValid: true,
                    url: `security/policies/global`,
                    isEOC: false,
                    group: COMMAND_REV["global-config"]
                }
            }
            ])
        });
    }
    else if (args.length === 2) {
        if (args[1].value === 'policies') {
            return new Promise((resolve, reject) => {
                resolve([{
                    value: 'global',
                    ref: undefined,
                    data: {
                        isValid: true,
                        url: `security/policies/global`,
                        isEOC: true,
                    }
                },
                {
                    value: 'cluster',
                    ref: undefined,
                    data: {
                        isValid: true,
                        url: `security/policies/cluster`,
                        isEOC: true,
                    }
                },
                {
                    value: 'environment',
                    ref: undefined,
                    data: {
                        isValid: true,
                        url: `security/policies/environments`,
                        isEOC: true,
                    }
                },
                {
                    value: 'applications',
                    ref: undefined,
                    data: {
                        isValid: true,
                        url: `security/policies/apps`,
                        isEOC: true,
                    }
                },
                {
                    value: 'cve',
                    ref: undefined,
                    data: {
                        isValid: true,
                        url: `security/policies/vulnerability`,
                        isEOC: true,
                    }
                }])
            });
        }
    }
    return new Promise((resolve, reject) => {
        resolve([])
    });
}


function getGlobalConfigArguments(args): Promise<SuggestedArgumentType[]> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve([{
                value: 'git-account',
                ref: null,
                data: {
                    url: '/global-config/git',
                    isValid: true,
                    isEOC: true,
                }
            }, {
                value: 'cluster-and-environments',
                ref: null,
                data: {
                    url: '/global-config/cluster-env',
                    isValid: true,
                    isEOC: true,
                }
            },
            {
                value: 'docker-registeries',
                ref: null,
                data: {
                    url: '/global-config/docker',
                    isValid: true,
                    isEOC: true,
                }
            },
            {
                value: 'projects',
                ref: null,
                data: {
                    url: '/global-config/projects',
                    isValid: true,
                    isEOC: true,
                }
            },
            {
                value: 'user-access',
                ref: null,
                data: {
                    url: '/global-config/auth/users',
                    isValid: true,
                    isEOC: false,
                }
            },
            {
                value: 'notification',
                ref: null,
                data: {
                    url: '/global-config/notifier/channels',
                    isValid: true,
                    isEOC: false,
                }
            }])
        });
    }
    else if (args.length === 2) {
        if (args[1].value === "user-access") {
            return new Promise((resolve, reject) => {
                resolve([{
                    value: 'users',
                    ref: null,
                    data: {
                        url: '/global-config/auth/users',
                        isValid: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'groups',
                    ref: null,
                    data: {
                        url: '/global-config/auth/groups',
                        isValid: true,
                        isEOC: true,
                    }
                }])
            });
        }
        else if (args[1].value === "notification") {
            return new Promise((resolve, reject) => {
                resolve([{
                    value: 'add-new',
                    ref: null,
                    data: {
                        url: '/global-config/notifier/edit',
                        isValid: true,

                        isEOC: true,
                    }
                },
                {
                    value: 'list',
                    ref: null,
                    data: {
                        url: '/global-config/notifier/channels',
                        isValid: true,

                        isEOC: true,
                    }
                },
                {
                    value: 'configuration',
                    ref: null,
                    data: {
                        url: '/global-config/notifier/configurations',
                        isValid: true,

                        isEOC: true,
                    }
                }
                ])
            });
        }

    }
    return new Promise((resolve, reject) => {
        resolve([])
    });
}