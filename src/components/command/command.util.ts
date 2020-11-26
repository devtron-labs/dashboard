import { getAppListMin, getAppOtherEnvironment } from '../../services/service';
import { SuggestedArgumentType } from './Command';

export const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config'
}

export const COMMAND_REV = {
    app: 'Applcations',
    chart: 'Charts',
    security: 'Security',
    'global-config': 'Global Config',
}

export function getArgumentSuggestions(args): Promise<any> {
    if (args.length === 0) return new Promise((resolve, reject) => {
        resolve([{ value: COMMAND.APPLICATIONS, ref: undefined, data: { isValid: true, isClearable: true, isEOC: false } },
        { value: COMMAND.CHART, ref: undefined, data: { isValid: true, isClearable: true, isEOC: false } },
        { value: COMMAND.SECURITY, ref: undefined, data: { isValid: true, isClearable: true, isEOC: false } },
        { value: COMMAND.GLOBAL_CONFIG, ref: undefined, data: { isValid: true, isClearable: true, isEOC: false } }])
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
                        isClearable: true,
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
                        isClearable: true,
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
                    isClearable: true,
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
                        isClearable: true,
                        isEOC: true
                    },
                },
                {
                    value: 'docker-config',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/docker-build-config`,
                        isClearable: true,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'deployment-template',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/deployment-template`,
                        isClearable: true,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'workflow-editor',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/workflow`,
                        isClearable: true,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'configmap',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/configmap`,
                        isClearable: true,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'secrets',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/secrets`,
                        isClearable: true,
                        isValid: true,
                        isEOC: true
                    }
                },
                {
                    value: 'env-override',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/edit/env-override`,
                        isClearable: true,
                        isValid: true,
                        isEOC: false
                    }
                }
            ])
        })
        else return new Promise((resolve, reject) => {
            resolve([
                //     {
                //     value: 'app-details',
                //      
                //     ref: undefined,
                //     data: {
                //         url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod`,
                //         isValid: true,
                //         isClearable: true,
                //         isEOC: false
                //     }
                // },
                {
                    value: 'trigger',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/trigger`,
                        isValid: true,
                        isClearable: true,
                        isEOC: true
                    }
                },
                {
                    value: 'build-history',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/ci-details`,
                        isValid: true,
                        isClearable: true,
                        isEOC: false
                    }
                },
                {
                    value: 'deployment-history',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/cd-details`,
                        isValid: true,
                        isClearable: true,
                        isEOC: false
                    }
                },
                {
                    value: 'deployment-metrics',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/deployment-metrics`,
                        isValid: true,
                        isClearable: true,
                        isEOC: false
                    }
                },
                {
                    value: 'test-report',
                    ref: undefined,
                    data: {
                        url: `/app/${args[1].data.value}/test`,
                        isValid: true,
                        isClearable: true,
                        isEOC: false
                    }
                },
            ])
        })
    }
    else if (args[3] && args.length === 4) { // args[3] --> pod
        if (args[3].value === 'pod') return new Promise((resolve, reject) => {
            resolve([{
                value: 'blobs-dev1-fdfc6b54-prglm',
                ref: undefined,
                data: {
                    value: 'blobs-dev1-fdfc6b54-prglm',
                    url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod/EVENTS?kind=Pod`,
                    isValid: true,
                    isClearable: true,
                    isEOC: true
                }
            },
            {
                value: 'blobs-dev1-fdfc6b54-pvphj',
                ref: undefined,
                data: {
                    value: 'blobs-dev1-fdfc6b54-pvphj',
                    url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod/EVENTS?kind=Pod`,
                    isValid: true,
                    isClearable: true,
                    isEOC: true,
                }
            },
            ])
        })
        else if (args[3].value === "env-override") return getAppOtherEnvironment(args[1].data.value).then((response) => {
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
                        isClearable: true,
                        isEOC: true,
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
                        isClearable: true,
                        isEOC: false,
                    }
                },
                {
                    value: 'deployed',
                    ref: null,
                    data: {
                        isValid: true,
                        isClearable: true,
                        isEOC: true,
                    }
                },
            ])
        });
    }
    else if (args.length === 2) {
        if (args[0].value === "discover") {
            

        }
    }
    return new Promise((resolve, reject) => {
        resolve([])
    });
}


function getSecurityArguments(args): Promise<SuggestedArgumentType[]> {
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve([])
        });
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
                    isClearable: true,
                    isEOC: true,
                }
            }, {
                value: 'cluster-and-environments',
                ref: null,
                data: {
                    url: '/global-config/cluster-env',
                    isValid: true,
                    isClearable: true,
                    isEOC: true,
                }
            },
            {
                value: 'docker-registeries',
                ref: null,
                data: {
                    url: '/global-config/docker',
                    isValid: true,
                    isClearable: true,
                    isEOC: true,
                }
            },
            {
                value: 'projects',
                ref: null,
                data: {
                    url: '/global-config/projects',
                    isValid: true,
                    isClearable: true,
                    isEOC: true,
                }
            },
            {
                value: 'user-access',
                ref: null,
                data: {
                    url: '/global-config/auth/users',
                    isValid: true,
                    isClearable: true,
                    isEOC: false,
                }
            },
            {
                value: 'notification',
                ref: null,
                data: {
                    url: '/global-config/notifier/channels',
                    isValid: true,
                    isClearable: true,
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
                        isClearable: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'groups',
                    ref: null,
                    data: {
                        url: '/global-config/auth/groups',
                        isValid: true,
                        isClearable: true,
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
                        isClearable: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'list',
                    ref: null,
                    data: {
                        url: '/global-config/notifier/channels',
                        isValid: true,
                        isClearable: true,
                        isEOC: true,
                    }
                },
                {
                    value: 'configuration',
                    ref: null,
                    data: {
                        url: '/global-config/notifier/configurations',
                        isValid: true,
                        isClearable: true,
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