import { getAppListMin, getAppOtherEnvironment } from '../../services/service';
import { ArgumentType } from './Command';

export const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    DOCUMENTATION: 'docs',
    DEPLOYMENT_GROUP: 'deployment-group',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config'
}

export function getArgumentSuggestions(args): Promise<any> {
    if (args.length === 0) return new Promise((resolve, reject) => {
        resolve([{ value: COMMAND.APPLICATIONS, focussable: true, ref: undefined, data: { isValid: true, isClearable: true } },
        { value: COMMAND.CHART, focussable: true, ref: undefined, data: { isValid: true, isClearable: true } },
        { value: COMMAND.DOCUMENTATION, focussable: true, ref: undefined, data: { isValid: true, isClearable: true } },
        { value: COMMAND.DEPLOYMENT_GROUP, focussable: true, ref: undefined, data: { isValid: true, isClearable: true } },
        { value: COMMAND.SECURITY, focussable: true, ref: undefined, data: { isValid: true, isClearable: true } },
        { value: COMMAND.GLOBAL_CONFIG, focussable: true, ref: undefined, data: { isValid: true, isClearable: true } }])
    });

    let arg = args[0];
    switch (arg.value) {
        case 'app': return getAppArguments(args);
        case 'chart': return getChartArguments(args);

        default: return new Promise((resolve, reject) => {
            resolve([])
        });
    }
}

function getAppArguments(args): Promise<any> {
    //["app", "appName", "envName", "pod", "podname"]
    args = args.filter(arg => arg.value !== "/");
    if (args.length === 1) {
        return getAppListMin().then((response) => {
            let list = response.result.map((a) => {
                return {
                    value: a.name,
                    focussable: true,
                    data: {
                        value: a.id,
                        kind: 'appId',
                        isValid: true,
                        url: `/app/${a.id}/details`,
                        isClearable: true,
                    }
                }
            })
            return list;
        })
    }
    else if (args[1] && args.length === 2) { // args[1] --> appName
        return getAppOtherEnvironment(args[1].data.value).then((response) => {
            let list: Array<ArgumentType & { focussable: true }>;
            list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    focussable: true,
                    data: {
                        value: a.environmentId,
                        kind: 'envId',
                        isValid: true,
                        url: `/app/${args[1].data.value}/details/${a.environmentId}/Pod`,
                        isClearable: true,
                    }
                }
            });
            if (!list) list = [];
            list.push({
                value: 'config',
                focussable: true,
                data: {
                    isValid: true,
                    url: `/app/${args[1].data.value}/edit/workflow`,
                    isClearable: true,
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
                    focussable: true,
                    data: {
                        url: `/app/${args[1].data.value}/edit/materials`,
                        isValid: true,
                        isClearable: true,
                    },
                },
                {
                    value: 'docker-config',
                    focussable: true,
                    data: {
                        url: `/app/${args[1].data.value}/edit/docker-build-config`,
                        isClearable: true,
                        isValid: true,
                    }
                },
                {
                    value: 'deployment-template',
                    focussable: true,
                    data: {
                        url: `/app/${args[1].data.value}/edit/deployment-template`,
                        isClearable: true,
                        isValid: true,
                    }
                },
                {
                    value: 'workflow-editor',
                    focussable: true,
                    data: {
                        url: `/app/${args[1].data.value}/edit/workflow`,
                        isClearable: true,
                        isValid: true,
                    }
                },
                {
                    value: 'configmap',
                    focussable: true,
                    data: {
                        url: `/app/${args[1].data.value}/edit/configmap`,
                        isClearable: true,
                        isValid: true,
                    }
                },
                {
                    value: 'secrets',
                    focussable: true,
                    data: {
                        url: `/app/${args[1].data.value}/edit/secrets`,
                        isClearable: true,
                        isValid: true,
                    }
                }
            ])
        })
        else return new Promise((resolve, reject) => {
            resolve([{
                value: 'pod',
                focussable: true,
                data: {
                    url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod`,
                    isValid: true,
                    isClearable: true,
                }
            }])
        })
    }
    else if (args[3] && args.length === 4) { // args[3] --> pod
        if (args[3].value === 'pod') return new Promise((resolve, reject) => {
            resolve([{
                value: 'blobs-dev1-fdfc6b54-prglm',
                focussable: true,
                data: {
                    id: 'blobs-dev1-fdfc6b54-prglm',
                    url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod/EVENTS?kind=Pod`,
                    isValid: true,
                    isClearable: true,
                }
            },
            {
                value: 'blobs-dev1-fdfc6b54-pvphj',
                focussable: true,
                data: {
                    id: 'blobs-dev1-fdfc6b54-pvphj',
                    url: `/app/${args[1].data.value}/details/${args[2].data.value}/Pod/EVENTS?kind=Pod`,
                    isValid: true,
                    isClearable: true,
                }
            },
            ])
        })
    }
    return new Promise((resolve, reject) => {
        resolve([])
    })
}


function getChartArguments(args): Promise<any> {
    args = args.filter(arg => arg.value !== "/");
    if (args.length === 1) {
        return new Promise((resolve, reject) => {
            resolve([
                {
                    value: 'discover',
                    focussable: true,
                    data: {
                        isValid: true,
                    }
                },
                {
                    value: 'deployed',
                    focussable: true,
                    data: {
                        isValid: true,
                    }
                },
            ])
        });
    }
    return new Promise((resolve, reject) => {
        resolve([])
    });
}