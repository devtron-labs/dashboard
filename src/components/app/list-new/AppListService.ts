import { getAppCheckList, getEnvironmentListMin as getEnvironmentList, getTeamListMin as getProjectList , getClusterNamespaceMapping} from '../../../services/service';
import {Routes} from '../../../config';
import {get, post} from '../../../services/api';
import {ResponseType, ClusterEnvironmentDetail} from '../../../services/service.types';



export interface AppListData extends ResponseType {
    result?: AppsList
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
    return Promise.all([getAppCheckList(), getProjectList(), getEnvironmentList(), getClusterNamespaceMapping()]).then(([appCheckListRes, projectsRes, environmentListRes, clusterNamespaceMappingRes]) => {

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
        let _clusterVsNamespaceMap = buildClusterVsNamespace(payloadParsedFromUrl.clustersAndNamespaces);

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
    return Promise.all([getProjectList()]).then(([appList]) => {
        // below mock
        let appListRes: AppListData = JSON.parse('{"result":{"devtronApps" : [{"appName" : "devtronApp1", "environmentDetails" : [{"environmentName" : "e1", "clusterName" : "cluster1", "namespace" : "n1", "lastDeployedAt" : "2021-12-10 11:45:13.859424+00", "isDefault" : true}]},{"appName" : "devtronApp2", "environmentDetails" : [{"environmentName" : "e2", "clusterName" : "cluster1", "namespace" : "n2", "lastDeployedAt" : "2021-12-11 11:45:13.859424+00", "isDefault" : false},{"environmentName" : "e1", "clusterName" : "cluster1", "namespace" : "n1", "lastDeployedAt" : "2021-12-12 11:45:13.859424+00", "isDefault" : true}]}], "helmApps" : [{"appName" : "helmApp1", "chartName" : "chart1", "chartAvatar" : "https://raw.githubusercontent.com/kedacore/keda/master/images/keda-logo-500x500-white.png", "environmentDetail" : {"environmentName" : "e21", "clusterName" : "cluster2", "namespace" : "n21", "lastDeployedAt" : "2021-12-14 11:45:13.859424+00"}},{"appName" : "helmApp2", "chartName" : "chart1", "chartAvatar" : "", "environmentDetail" : {"environmentName" : "e22", "clusterName" : "cluster2", "namespace" : "n22", "lastDeployedAt" : "2021-12-18 11:45:13.859424+00"}}]}}');
        return {
            devtronApps: appListRes.result ? appListRes.result.devtronApps : [],
            helmApps: appListRes.result ? appListRes.result.helmApps : []
        }
    })
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