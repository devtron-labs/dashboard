import { getNamespaceListMin as getNamespaceList, getAppFilters } from '../../../services/service';
import {Routes, SERVER_MODE} from '../../../config';
import {get, ResponseType} from '@devtron-labs/devtron-fe-common-lib';
import { EnvironmentListHelmResult, EnvironmentHelmResult, Cluster, EnvironmentListHelmResponse} from '../../../services/service.types';
import { APP_STATUS } from '../config';
import { getProjectList } from '../../project/service';
import { getClusterList } from '../../cluster/cluster.service';


export interface AppListResponse extends ResponseType{
    result?: AppsListResult
}

interface AppsListResult {
    clusterIds : number[],
    applicationType : string, //DEVTRON-CHART-STORE, DEVTRON-APP ,HELM-APP
    errored: boolean,
    errorMsg : string,
    helmApps : HelmApp[]
}


export interface HelmApp {
    appName: string,
    appId: string,
    isExternal : boolean,
    chartName: string,
    chartVersion: string,
    chartAvatar: string,
    projectId: number,
    lastDeployedAt: string,
    environmentDetail: AppEnvironmentDetail,
    appStatus: string
}

export interface AppEnvironmentDetail {
    environmentName: string,
    environmentId: number,
    namespace: string,
    clusterName: string,
    clusterId: number,
    isVirtualEnvironment?: boolean
}

async function commonAppFilters(serverMode) {
    if(serverMode === SERVER_MODE.FULL){
        return getAppFilters()
    } else {
        return Promise.all([getProjectList(), getClusterList()]).then(([projectListRes, clusterListResp]) => {
            return {result: {Teams: projectListRes?.result, Clusters: clusterListResp?.result }}
        })
    } 
}

export const getInitData = (payloadParsedFromUrl : any, serverMode : string): Promise<any> => {
    // cluster vs namespace
    let _clusterVsNamespaceMap = buildClusterVsNamespace(payloadParsedFromUrl.namespaces.join(','));
    let _clusterIds = [..._clusterVsNamespaceMap.keys()].join(',');

    return Promise.all([commonAppFilters(serverMode), (_clusterIds ? getNamespaceList(_clusterIds) : { result: undefined})]).then(([appFilterList, namespaceListRes]) => {
        const projectList = appFilterList.result?.Teams
        const environmentList = appFilterList.result?.Environments
        const clusterList = appFilterList.result?.Clusters

        // push apps with no projects in project res
        if(projectList && Array.isArray(projectList)){
            projectList.push({
                id : 0,
                name : 'Apps with no projects',
                active : true
            })
        }

        ////// set master filters data starts (check/uncheck)
        let filterApplied = {
            teams: new Set(payloadParsedFromUrl.teams),
            environments: new Set(payloadParsedFromUrl.environments),
            clusterVsNamespaceMap: _clusterVsNamespaceMap,
            appStatus: new Set(payloadParsedFromUrl.appStatuses)
        };

        let filters = {
            projects: [],
            environments: [],
            clusters: [],
            namespaces: [],
            appStatus: []
        };

        // set filter projects starts
        filters.projects = projectList ? projectList.map((team) => {
            return {
                key: team.id,
                label: team.name.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.teams.has(team.id)
            }
        }) : []
        filters.projects = filters.projects.sort((a, b) => { return sortByLabel(a, b) });
        // set filter projects ends

        // set filter environments starts
        filters.environments = environmentList ? environmentList.map((env) => {
            return {
                key: env.id,
                label: env.environment_name.toLocaleLowerCase(),
                isSaved: true,
                isChecked: filterApplied.environments.has(env.id)
            }
        }) : [];
        filters.environments = filters.environments.sort((a, b) => { return sortByLabel(a, b) });
        // set filter environments ends

        // set filter clusters starts
        if(clusterList && Array.isArray(clusterList)){
            clusterList.forEach((cluster : Cluster) => {
                filters.clusters.push({
                    key: cluster.id,
                    label: cluster.cluster_name.toLocaleLowerCase(),
                    isSaved: true,
                    isChecked: filterApplied.clusterVsNamespaceMap.has(cluster.id.toString())
                })
            })
        }
        filters.clusters = filters.clusters.sort((a, b) => { return sortByLabel(a, b) });
        // set filter clusters ends

        // set filter namespace starts
        let _namespaces = _buildNamespaces(namespaceListRes as EnvironmentListHelmResponse, filterApplied.clusterVsNamespaceMap);
        filters.namespaces = _namespaces.sort((a, b) => { return sortByLabel(a, b) });
        //set filter namespace ends

        //set filter appStatus starts

        filters.appStatus = Object.entries(APP_STATUS).map(([keys,values]) => {
            return {
                key: values,
                label: keys,
                isSaved: true,
                isChecked: filterApplied.appStatus.has(values)
            }
        })

        ////// set master filters data ends (check/uncheck)

        // set list data for env cluster & namespace
        const environmentClusterAppListData = new Map()
        const clusterMap = new Map()
        const projectMap = new Map()
        if (clusterList) {
            for (const cluster of clusterList) {
                clusterMap.set(cluster.id, cluster.cluster_name)
            }
        }
        if (projectList) {
            for (const project of projectList) {
                projectMap.set(project.id, project.name)
            }
        }

        if (environmentList) {
            for (const env of environmentList) {
                const envData = {
                    environmentName: env.environment_name,
                    namespace: env.namespace,
                    clusterName: clusterMap.get(env.cluster_id),
                    clusterId: env.cluster_id,
                }
                environmentClusterAppListData.set(env.id, envData)
            }
        }
        

        // end

        return {
            projectsRes: projectList,
            projectMap: projectMap,
            environmentClusterAppListData: environmentClusterAppListData,
            filters: filters,
        }
    })
}

export const getNamespaces = (clusterIdCsv : string, clusterVsNamespaceMap : Map<string|number, any[]>): Promise<any> => {
    return Promise.all([getNamespaceList(clusterIdCsv)]).then(([namespaceListRes]) => {
        return _buildNamespaces(namespaceListRes, clusterVsNamespaceMap)
    })
}

export const getDevtronInstalledHelmApps = (clusterIdsCsv: string, appStatuses?: string) : Promise<AppListResponse> => {
    let url = `${Routes.CHART_INSTALLED}`
    if (clusterIdsCsv) {
        url = `${url}?clusterIds=${clusterIdsCsv}`
    }
    if (appStatuses) {
        url = `${url}${clusterIdsCsv ? '&' : '?'}appStatuses=${appStatuses}`
    }
    return get(url);
}

const sortByLabel = (a, b) => {
    if (a.label < b.label) { return -1; }
    if (a.label > b.label) { return 1; }
    return 0;
}

// cluster vs namespace (sample input : [{clusterId_namespace}])
export const buildClusterVsNamespace = (clustersAndNamespacesCsv : any) : any => {
    let _clusterVsNamespaceMap = new Map();
    if (!clustersAndNamespacesCsv){
        return _clusterVsNamespaceMap;
    }

    let clustersAndNamespacesArr = clustersAndNamespacesCsv.split(",");
    clustersAndNamespacesArr.forEach( (clustersAndNamespacesElem) => {
        let clusterId = clustersAndNamespacesElem.split("_")[0];
        let namespace = clustersAndNamespacesElem.split("_")[1];
        let clusterNamespaces = _clusterVsNamespaceMap.get(clusterId);
        if (!clusterNamespaces) {
            clusterNamespaces = [];
        }
        if (namespace){
            clusterNamespaces.push(namespace);
        }
        _clusterVsNamespaceMap.set(clusterId, clusterNamespaces);
    });

    return _clusterVsNamespaceMap;
}

const _buildNamespaces = (namespaceListRes : EnvironmentListHelmResponse, clusterVsNamespaceMap : Map<string|number, any[]>) : any[] => {
    let _namespaces = [];
    if(!namespaceListRes.result || !Array.isArray(namespaceListRes.result)) {
        return _namespaces;
    }

    namespaceListRes.result.forEach((namespaceObj : EnvironmentListHelmResult) => {
        let _clusterId = namespaceObj.clusterId;
        let _clusterName = namespaceObj.clusterName;
        let _isClusterSelected = clusterVsNamespaceMap.has(_clusterId.toString());
        namespaceObj.environments.forEach((environment : EnvironmentHelmResult) => {
            let _namespace = environment.namespace;
            // avoid pushing same namespace for same cluster multiple times (can be data bug in backend)
            if(!_namespaces.some(_ns => (_ns.clusterId == _clusterId && _ns.actualName == _namespace))){
                _namespaces.push({
                    key: _clusterId + "_" + _namespace,
                    label: '<div><div>'+_namespace+'</div><div class="cn-6 fs-11 fw-n"> cluster: '+_clusterName+'</div></div>',
                    isSaved: true,
                    isChecked: _isClusterSelected && clusterVsNamespaceMap.get(_clusterId.toString()).includes(_namespace),
                    clusterId : _clusterId,
                    actualName : _namespace,
                    clusterName : _clusterName,
                    toShow : clusterVsNamespaceMap.size == 0 || _isClusterSelected
                })
            }
        })
    })

    return _namespaces;
}