import { getEnvironmentListMin, getTeamListMin, getDockerRegistryList } from '../../../services/service';
import { handleUTCTime } from '../../common';
import { Environment } from './types';
import moment from 'moment';

export const getInitState = (appListPayload): Promise<any> => {
    return Promise.all([getTeamListMin(), getEnvironmentListMin(), getDockerRegistryList()]).then(([teams, environments, dockerRegistryRes]) => {
        let filterApplied = {
            environments: new Set(appListPayload.environments),
            statuses: new Set(appListPayload.statuses),
            teams: new Set(appListPayload.teams),
        }

        let filters = {
            environment: [],
            team: [],
            status: []
        }

        filters.environment = environments.result ? environments.result.map((env) => {
            return {
                key: env.id,
                label: env.environment_name.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.environments.has(env.id)
            }
        }) : [];
        filters.status = getStatus().map((status) => {
            return {
                key: status,
                label: status.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.statuses.has(status)
            }
        })
        filters.team = teams.result ? teams.result.map((team) => {
            return {
                key: team.id,
                label: team.name.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.teams.has(team.id)
            }
        }) : []
        filters.environment = filters.environment.sort((a, b) => { return sortByLabel(a, b) });
        filters.status = filters.status.sort((a, b) => { return sortByLabel(a, b) });
        filters.team = filters.team.sort((a, b) => { return sortByLabel(a, b) });
        let parsedResponse = {
            code: teams.code,
            filters,
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
            isDockerRegistryEmpty: !(dockerRegistryRes.result && dockerRegistryRes.result.length),
        }
        return parsedResponse;
    })
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