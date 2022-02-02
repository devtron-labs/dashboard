import { getAppCheckList, getEnvironmentListMin as getEnvironmentList, getTeamListMin as getProjectList, getClusterListMinWithoutAuth as getClusterList, getNamespaceListMin as getNamespaceList } from '../../../services/service';
import {Routes, SERVER_MODE} from '../../../config';
import {get, post} from '../../../services/api';
import {ResponseType, ClusterEnvironmentDetail, EnvironmentListHelmResult, EnvironmentHelmResult, ClusterListResponse, Cluster, EnvironmentListHelmResponse} from '../../../services/service.types';


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
    environmentDetail: AppEnvironmentDetail
}

export interface AppEnvironmentDetail {
    environmentName: string,
    environmentId: number,
    namespace: string,
    clusterName: string,
    clusterId: number
}

export const getInitData = (payloadParsedFromUrl : any, serverMode : string): Promise<any> => {
    // cluster vs namespace
    let _clusterVsNamespaceMap = buildClusterVsNamespace(payloadParsedFromUrl.namespaces.join(','));
    let _clusterIds = [..._clusterVsNamespaceMap.keys()].join(',');

    return Promise.all([(serverMode == SERVER_MODE.FULL ? getAppCheckList() : { result: undefined}) , getProjectList(), (serverMode == SERVER_MODE.FULL ? getEnvironmentList() : { result: undefined}), getClusterList(), (_clusterIds ? getNamespaceList(_clusterIds) : { result: undefined})]).then(([appCheckListRes, projectsRes, environmentListRes, clusterListRes, namespaceListRes]) => {

        // push apps with no projects in project res
        if(projectsRes.result && Array.isArray(projectsRes.result)){
            projectsRes.result.push({
                id : 0,
                name : 'Apps with no projects',
                active : true
            })
        }

        ////// set master filters data starts (check/uncheck)
        let filterApplied = {
            teams: new Set(payloadParsedFromUrl.teams),
            environments: new Set(payloadParsedFromUrl.environments),
            clusterVsNamespaceMap : _clusterVsNamespaceMap
        }

        let filters = {
            projects: [],
            clusters: [],
            namespaces: [],
            environments: []
        }

        // set filter projects starts
        filters.projects = projectsRes.result ? projectsRes.result.map((team) => {
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
        filters.environments = environmentListRes.result ? environmentListRes.result.map((env) => {
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
        if(clusterListRes.result && Array.isArray(clusterListRes.result)){
            clusterListRes.result.forEach((cluster : Cluster) => {
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
        let _namespaces = _buildNamespaces(namespaceListRes, filterApplied.clusterVsNamespaceMap);
        filters.namespaces = _namespaces.sort((a, b) => { return sortByLabel(a, b) });
        //set filter namespace ends

        ////// set master filters data ends (check/uncheck)

        return {
            appCheckListRes: appCheckListRes,
            projectsRes: projectsRes,
            environmentListRes: environmentListRes,
            filters : filters
        };
    })
}

export const getNamespaces = (clusterIdCsv : string, clusterVsNamespaceMap : Map<string|number, any[]>): Promise<any> => {
    return Promise.all([getNamespaceList(clusterIdCsv)]).then(([namespaceListRes]) => {
        return _buildNamespaces(namespaceListRes, clusterVsNamespaceMap)
    })
}

export const getDevtronInstalledHelmApps = (clusterIdsCsv: string) : Promise<AppListResponse> => {
    let url = `${Routes.CHART_INSTALLED}`
    if (clusterIdsCsv) {
        url = `${url}?clusterIds=${clusterIdsCsv}`
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