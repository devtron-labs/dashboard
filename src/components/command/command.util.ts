import { getAppListMin, getAppOtherEnvironment } from '../../services/service';

export function getSuggestedCommands(args) {
    if (args.length === 0) return undefined;

    let arg = args[0];
    switch (arg.value) {
        case 'app': return getAppArguments(args);
    }
}

function getAppArguments(args): Promise<any> {
    let allArgs = args.filter(arg => arg.value === "/");

    if (!allArgs.length) {
        return getAppListMin().then((response) => {
            let list = response.result.map((a) => {
                return {
                    value: a.name,
                    data: {
                        appId: a.id,
                    }
                }
            })
            return list;
        })
    }
    else if (allArgs[1] && allArgs.length === 2) { // allArgs[1] --> app
        return getAppOtherEnvironment(allArgs[1].data.appId).then((response) => {
            let list = response.result.map((a) => {
                return {
                    value: a.environmentName,
                    data: {
                        envId: a.environmentId
                    }
                }
            })
            return list;
        })
    }
    // else if (allArgs[2] && allArgs.length === 2) { // allArgs[1] --> app
    //     return getAppOtherEnvironment(allArgs[1].data.appId).then((response) => {
    //         let list = response.result.map((a) => {
    //             return {
    //                 value: a.environmentName,
    //                 data: {
    //                     envId: a.environmentId
    //                 }
    //             }
    //         })
    //         return list;
    //     })
    // }

}