import { handleUTCTime } from '../../common';
import { Environment } from './types';
import moment from 'moment';

export const buildInitState = (appListPayload, appCheckListRes): Promise<any> => {
    return new Promise((resolve) => {
        let appChecklist = appCheckListRes.result.appChecklist;
        let chartChecklist = appCheckListRes.result.chartChecklist;
        let appStageArray: number[] = appChecklist && Object.values(appChecklist) || [];
        let chartStageArray: number[] = chartChecklist && Object.values(chartChecklist) || [];
        let appStageCompleted: number = appStageArray.reduce((item, sum) => {
            sum = sum + item;
            return sum;
        }, 0)
        let chartStageCompleted: number = chartStageArray.reduce((item, sum) => {
            sum = sum + item;
            return sum;
        }, 0)

        let parsedResponse = {
            code: appCheckListRes.code,
            apps: [],
            offset: appListPayload.offset,
            size: 0,
            pageSize: appListPayload.size,
            sortRule: {
                key: appListPayload.sortBy,
                order: appListPayload.sortOrder,
            },
            searchQuery: appListPayload.appNameSearch || "",
            searchApplied: !!appListPayload.appNameSearch.length,
            isAppCreated: appCheckListRes.result.isAppCreated,
            appChecklist,
            chartChecklist,
            appStageCompleted,
            chartStageCompleted,
        }
        return resolve(parsedResponse);
    });
}


export const appListModal = (appList) => {
    return appList.map(app => {
        return {
            id: app.appId || 0,
            name: app.appName || 'NA',
            environments: app.environments.map(env => environmentModal(env)) || [],
            defaultEnv: getDefaultEnvironment(app.environments),
        }
    })
}

const environmentModal = (env) => {
    let status = env.status;
    if (env.status.toLocaleLowerCase() == "deployment initiated") {
        status = "Progressing";
    }
    return {
        id: env.environmentId || 0,
        name: env.environmentName || '',
        lastDeployedTime: env.lastDeployedTime ? handleUTCTime(env.lastDeployedTime, false) : "",
        status: env.status ? handleDeploymentInitiatedStatus(env.status) : "notdeployed",
        default: env.default ? env.default : false,
        materialInfo: env.materialInfo || [],
        ciArtifactId: env.ciArtifactId || 0,
        clusterName: env.clusterName || '',
        namespace: env.namespace || ''
    }
}

const getDefaultEnvironment = (envList): Environment => {
    let env = envList.find(env => env.default);
    if (env) {
        return environmentModal(env);;
    }
    if (!env && envList.length == 1) env = envList[0];
    else if (!env && envList.length > 1) {
        env = getLastDeployedEnv(envList);
    }
    let status = env.status;
    if (env.status.toLocaleLowerCase() == "deployment initiated") {
        status = "Progressing";
    }
    return {
        id: env.environmentId as number,
        name: env.environmentName as string,
        lastDeployedTime: env.lastDeployedTime ? handleUTCTime(env.lastDeployedTime, false) : "",
        status: env.status ? handleDeploymentInitiatedStatus(env.status) : "notdeployed",
        materialInfo: env.materialInfo || [],
        ciArtifactId: env.ciArtifactId || 0,
        clusterName: env.clusterName || '',
        namespace: env.namespace || ''
    }
}

const getLastDeployedEnv = (envList: Array<Environment>): Environment => {
    let env = envList[0];
    let ms = moment(new Date(0)).valueOf();
    for (let i = 0; i < envList.length; i++) {
        let time = envList[i].lastDeployedTime && envList[i].lastDeployedTime.length ? envList[i].lastDeployedTime : new Date(0);
        let tmp = moment(time).utc(true).subtract(5, "hours").subtract(30, "minutes").valueOf();
        if (tmp > ms) {
            ms = tmp;
            env = envList[i];
        }
    }
    return env;
}

const sortByLabel = (a, b) => {
    if (a.label < b.label) { return -1; }
    if (a.label > b.label) { return 1; }
    return 0;
}

const getStatus = () => {
    return ["Not Deployed", "Healthy", "Missing", "Unknown", "Progressing", "Suspended", "Degraded"];
}

const handleDeploymentInitiatedStatus = (status: string): string => {
    if (status.replace(/\s/g, '').toLowerCase() == "deploymentinitiated")
        return "progressing";
    else return status;
}