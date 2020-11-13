import { getAppListMin, getAppOtherEnvironment } from '../../services/service';
import { ArgumentType } from './Command';

export function getArgumentSuggestions(args): Promise<any> {
    if (args.length === 0) return new Promise((resolve, reject) => {
        resolve([])
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
                    data: {
                        value: a.id,
                        kind: 'appId',
                        isValid: true,
                        url: `app/${a.id}/details`,
                    }
                }
            })
            return list;
        })
    }
    else if (args[1] && args.length === 2) { // args[1] --> appName
        return getAppOtherEnvironment(args[1].data.value).then((response) => {
            let list: ArgumentType[];
            list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    data: {
                        value: a.environmentId,
                        kind: 'envId',
                        isValid: true,
                        url: `app/${args[1].data.value}/details/${a.environmentId}/Pod`,
                    }
                }
            });
            if (!list) list = [];
            list.push({
                value: 'config',
                data: {
                    isValid: true,
                    url: `app/${args[1].data.value}/edit/workflow`,
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
                    data: {
                        url: `app/${args[1].data.value}/edit/materials`,
                        isValid: true,
                    },
                },
                {
                    value: 'docker-config',
                    data: {
                        url: `app/${args[1].data.value}/edit/docker-build-config`,
                        isValid: true,
                    }
                },
                {
                    value: 'deployment-template',
                    data: {
                        url: `app/${args[1].data.value}/edit/deployment-template`,
                        isValid: true,
                    }
                },
                {
                    value: 'workflow-editor',
                    data: {
                        url: `app/${args[1].data.value}/edit/workflow`,
                        isValid: true,
                    }
                }
            ])
        })
        else return new Promise((resolve, reject) => {
            resolve([{
                value: 'pod',
                data: {
                    isValid: true,
                }
            }])
        })
    }
    else if (args[3] && args.length === 4) { // args[3] --> pod
        if (args[3].value === 'pod') return new Promise((resolve, reject) => {
            resolve([{
                value: 'blobs-dev1-fdfc6b54-prglm',
                data: {
                    id: 'blobs-dev1-fdfc6b54-prglm',
                    url: `app/${args[1].data.value}/details/${args[2].data.value}/Pod`,
                    isValid: true,
                }
            },
            {
                value: 'blobs-dev1-fdfc6b54-pvphj',
                data: {
                    id: 'blobs-dev1-fdfc6b54-pvphj',
                    url: `app/${args[1].data.value}/details/${args[2].data.value}/Pod`,
                    isValid: true,
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
                    data: {
                        isValid: true,
                    }
                },
                {
                    value: 'deployed',
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