import { getAppCheckList, getEnvironmentListMin as getEnvironmentList, getTeamListMin as getProjectList , getClusterNamespaceMapping} from '../../../services/service';
import {Routes, SERVER_MODE} from '../../../config';
import {get, post} from '../../../services/api';
import {ResponseType, ClusterEnvironmentDetail} from '../../../services/service.types';


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
    return Promise.all([(serverMode == SERVER_MODE.FULL ? getAppCheckList() : { result: undefined}) , getProjectList(), (serverMode == SERVER_MODE.FULL ? getEnvironmentList() : { result: undefined}), getClusterNamespaceMapping()]).then(([appCheckListRes, projectsRes, environmentListRes, clusterNamespaceMappingRes]) => {

        // push apps with no projects in project res
        if(projectsRes.result && Array.isArray(projectsRes.result)){
            projectsRes.result.push({
                id : 0,
                name : 'Apps With No Projects',
                active : true
            })
        }

        ////// set master filters data starts (check/uncheck)

        // cluster vs namespace
        let _clusterVsNamespaceMap = buildClusterVsNamespace(payloadParsedFromUrl.namespaces.join(','));

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

        // set filter clusters|namespace starts
        if(clusterNamespaceMappingRes.result && Array.isArray(clusterNamespaceMappingRes.result)){
            clusterNamespaceMappingRes.result.forEach((clusterNamespaceMapping : ClusterEnvironmentDetail) => {
                let _clusterId = clusterNamespaceMapping.cluster_id;
                let _clusterName = clusterNamespaceMapping.cluster_name;
                let _isClusterSelected = filterApplied.clusterVsNamespaceMap.has(_clusterId.toString());
                let _isClusterAddedInFilter = filters.clusters.some(_cluster => _cluster.key == _clusterId);
                if (!_isClusterAddedInFilter){
                    filters.clusters.push({
                        key: _clusterId,
                        label: _clusterName.toLocaleLowerCase(),
                        isSaved: true,
                        isChecked: _isClusterSelected
                    })
                }

                let _namespace = clusterNamespaceMapping.namespace;
                filters.namespaces.push({
                    key: _clusterId + "_" + _namespace,
                    label: _namespace + " (" + _clusterName + ")",
                    isSaved: true,
                    isChecked: _isClusterSelected && filterApplied.clusterVsNamespaceMap.get(_clusterId.toString()).includes(_namespace),
                    clusterId : _clusterId,
                    toShow : filterApplied.clusterVsNamespaceMap.size == 0 || _isClusterSelected
                })

            })
        }
        // set filter clusters|namespace ends

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

        ////// set master filters data ends (check/uncheck)

        return {
            appCheckListRes: appCheckListRes,
            projectsRes: projectsRes,
            environmentListRes: environmentListRes,
            filters : filters
        };
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