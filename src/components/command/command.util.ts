import { getAppListMin, getAppOtherEnvironment } from '../../services/service';

export function getArgumentSuggestions(args) :Promise<any>{
    if (args.length === 0) return new Promise((resolve, reject)=>{
        resolve([])
    });
    
    let arg = args[0];
    switch (arg.value) {
        case 'app': return getAppArguments(args);
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
                        appId: a.id,
                        value: a.id,
                        kind: 'appId'
                    }
                }
            })
            return list;
        })
    }
    else if (args[1] && args.length === 2) { // args[1] --> appName
        return getAppOtherEnvironment(args[1].data.appId).then((response) => {
            let list = response?.result?.map((a) => {
                return {
                    value: a.environmentName,
                    data: {
                        envId: a.environmentId,
                        value: a.environmentId,
                        kind: 'envId',
                        isEOC: false,
                    }
                }
            });
            if (!list) list = [];
            return list;
        })
    }
    else if (args[2] && args.length === 3) { // args[2] --> envName
        return new Promise((resolve, reject) => {
            resolve([{
                value: 'pod',
            }])
        })
    }
    else if (args[3] && args.length === 4) { // args[3] --> pod
        if (args[3].value === 'pod') return new Promise((resolve, reject) => {
            resolve([{
                value: 'blobs-dev1-fdfc6b54-prglm',
                data: {
                    id: 'blobs-dev1-fdfc6b54-prglm',
                    url: `app/${args[1].data.appId}/details/${args[1].data.envId}/Pod`,
                    isEOC: true,
                }
            },
            {
                value: 'blobs-dev1-fdfc6b54-pvphj',
                data: {
                    id: 'blobs-dev1-fdfc6b54-pvphj',
                    url: `app/${args[1].data.appId}/details/${args[1].data.envId}/Pod`,
                    isEOC: true,
                }
            },
            ])
        })
    }
    else return new Promise((resolve, reject) => {
        resolve([])
    })
}
