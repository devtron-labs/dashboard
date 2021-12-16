import { getAppCheckList, getEnvironmentListMin, getTeamListMin } from '../../../services/service';
import {Routes} from '../../../config';
import {get, post} from '../../../services/api';
import {ResponseType} from '../../../services/service.types';

export interface ClusterFilterForAppList extends ResponseType {
    result?: ClusterFilterList[]
}

export interface AppListData extends ResponseType {
    result?: AppsList
}

interface ClusterFilterList {
    id: number,
    name: string,
    namespaces: ClusterNamespaceList[]
}

interface ClusterNamespaceList {
    namespace: string,
    environmentName: string,
    environmentId: number
}

export interface AppsList {
    devtronApps: DevtronAppList[],
    helmApps: HelmAppList[]
}

export interface DevtronAppList {
    appName: string,
    appId: string | number,
    projectId: number,
    isExpanded: boolean,
    environmentDetails: AppEnvironmentDetail[]
}

interface HelmAppList {
    appName: string,
    appId: string | number,
    chartName: string,
    chartAvatar: string,
    projectId: number,
    environmentDetail: AppEnvironmentDetail
}

interface AppEnvironmentDetail {
    environmentName: string,
    environmentId: number,
    namespace: string,
    clusterName: string,
    lastDeployedAt: string,
    isDefault: boolean
}

export const getInitData = (payloadParsedFromUrl : any): Promise<any> => {
    // TODO : call getClusterListForAppListFilter below
    return Promise.all([getAppCheckList(), getTeamListMin(), getEnvironmentListMin()]).then(([appCheckListRes, projectsRes, environmentListRes]) => {

        // below mock
        let clusterMasterDataRes: ClusterFilterForAppList = JSON.parse('{"result":[{"id":1,"name":"cluster1","namespaces":[{"namespace":"n1","environmentName":"e1", "environmentId" : 1},{"namespace":"n2","environmentName":"e2", "environmentId" : 2},{"namespace":"n3","environmentName":"", "environmentId" : 0}]},{"id":2,"name":"cluster2","namespaces":[{"namespace":"n21","environmentName":"e21", "environmentId" : 21},{"namespace":"n22","environmentName":"e22", "environmentId" : 22},{"namespace":"n23","environmentName":"", "environmentId" : 0}]}]}');

        // set projects
        let _projects = projectsRes.result ? projectsRes.result.map((projectRes) => {
            return {
                key: projectRes.id,
                label: projectRes.name.toLocaleLowerCase()
            }
        }) : []
        _projects.push({
            key: -1,
            label: "Apps With No Projects"
        });

        // set others
        let _clusters = []
        let _namespaces = []
        let _environments = []

        if (clusterMasterDataRes.result && Array.isArray(clusterMasterDataRes.result)) {
            clusterMasterDataRes.result.forEach((clusterObj) => {
                // set clusters
                _clusters.push({
                    key: clusterObj.id,
                    label: clusterObj.name.toLocaleLowerCase()
                })
                // set namespaces
                clusterObj.namespaces.forEach((namespaceObj) => {
                    _namespaces.push({
                        key: clusterObj.id + namespaceObj.namespace,
                        label: namespaceObj.namespace.toLocaleLowerCase(),
                        clusterId: clusterObj.id,
                        name: namespaceObj.namespace
                    })
                    // set envs
                    if (namespaceObj.environmentId > 0) {
                        _environments.push({
                            key: namespaceObj.environmentId,
                            label: namespaceObj.environmentName.toLocaleLowerCase()
                        })
                    }
                });
            });
        }

        // set master filters data (check/uncheck)
        let filterApplied = {
            environments: new Set(payloadParsedFromUrl.environments),
            teams: new Set(payloadParsedFromUrl.teams),
        }
        let filters = {
            projects: [],
            environments: []
        }
        filters.projects = projectsRes.result ? projectsRes.result.map((team) => {
            return {
                key: team.id,
                label: team.name.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.teams.has(team.id)
            }
        }) : []
        filters.projects = filters.projects.sort((a, b) => { return sortByLabel(a, b) });

        filters.environments = environmentListRes.result ? environmentListRes.result.map((env) => {
            return {
                key: env.id,
                label: env.environment_name.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.environments.has(env.id)
            }
        }) : [];
        filters.environments = filters.environments.sort((a, b) => { return sortByLabel(a, b) });
        // set master filters data ends (check/uncheck)

        return {
            projects: _projects.sort((a, b) => a.label.localeCompare(b.label)),
            clusters: _clusters.sort((a, b) => a.label.localeCompare(b.label)),
            namespaces: _namespaces.sort((a, b) => a.label.localeCompare(b.label)),
            environments: _environments.sort((a, b) => a.label.localeCompare(b.label)),
            appCheckListRes: appCheckListRes,
            projectsRes: projectsRes,
            environmentListRes: environmentListRes,
            filters : filters,
        };
    })
}

export const getApplicationList = (projectIds: number[], clusterIds: number[], namespaces: string[], environmentIds: number[]): Promise<AppsList> => {
    let requestPayload = {
        projectIds: projectIds,
        clusterIds: clusterIds,
        namespaces: namespaces,
        environmentIds: environmentIds
    }

    // getNewAppListFromApi(requestPayload)
    return Promise.all([getTeamListMin()]).then(([appList]) => {
        // below mock
        let appListRes: AppListData = JSON.parse('{"result":{"devtronApps" : [{"appName" : "devtronApp1", "environmentDetails" : [{"environmentName" : "e1", "clusterName" : "cluster1", "namespace" : "n1", "lastDeployedAt" : "2021-12-10 11:45:13.859424+00", "isDefault" : true}]},{"appName" : "devtronApp2", "environmentDetails" : [{"environmentName" : "e2", "clusterName" : "cluster1", "namespace" : "n2", "lastDeployedAt" : "2021-12-11 11:45:13.859424+00", "isDefault" : false},{"environmentName" : "e1", "clusterName" : "cluster1", "namespace" : "n1", "lastDeployedAt" : "2021-12-12 11:45:13.859424+00", "isDefault" : true}]}], "helmApps" : [{"appName" : "helmApp1", "chartName" : "chart1", "chartAvatar" : "https://raw.githubusercontent.com/kedacore/keda/master/images/keda-logo-500x500-white.png", "environmentDetail" : {"environmentName" : "e21", "clusterName" : "cluster2", "namespace" : "n21", "lastDeployedAt" : "2021-12-14 11:45:13.859424+00"}},{"appName" : "helmApp2", "chartName" : "chart1", "chartAvatar" : "", "environmentDetail" : {"environmentName" : "e22", "clusterName" : "cluster2", "namespace" : "n22", "lastDeployedAt" : "2021-12-18 11:45:13.859424+00"}}]}}');
        return {
            devtronApps: appListRes.result ? appListRes.result.devtronApps : [],
            helmApps: appListRes.result ? appListRes.result.helmApps : []
        }
    })
}

const getClusterListForAppListFilterFromApi = (): Promise<ClusterFilterForAppList> => {
    const URL = `${Routes.CLUSTER}/app-list/autocomplete`;
    return get(URL);
}

const getNewAppListFromApi = (requestPayload: any): Promise<any> => {
    //const URL = `${Routes.APP_NEW_LIST}`;
    const URL = "";
    return post(URL, requestPayload);
}

const sortByLabel = (a, b) => {
    if (a.label < b.label) { return -1; }
    if (a.label > b.label) { return 1; }
    return 0;
}