import { ViewType } from '../../config'
import { AppListViewType, DEFAULT_TAG_DATA } from '../app/config'
import { JobCreationType } from './Constants'
import { JobCIPipeline, JobListState, JobListStateAction, JobListStateActionTypes } from './Types'
import * as queryString from 'query-string'
import { buildClusterVsNamespace } from '../app/list-new/AppListService'
import { OrderBy, SortBy } from '../app/list/types'
import { handleUTCTime } from '../common'
import moment from 'moment'

export const getInitialJobListState = (payloadParsedFromUrl): JobListState => {
    return {
        code: 0,
        view: AppListViewType.LOADING,
        errors: [],
        jobs: [],
        size: 0,
        sortRule: {
            key: payloadParsedFromUrl.sortBy ?? SortBy.APP_NAME,
            order: payloadParsedFromUrl.sortOrder ?? OrderBy.ASC,
        },
        showCommandBar: false,
        offset: payloadParsedFromUrl.offset ?? 0,
        pageSize: payloadParsedFromUrl.size ?? 20,
        expandedRow: null,
        isAllExpanded: false,
        isAllExpandable: false,
    }
}

export const jobListReducer = (state: JobListState, action: JobListStateAction) => {
    switch (action.type) {
        case JobListStateActionTypes.view:
            return { ...state, view: action.payload }
        case JobListStateActionTypes.code:
            return { ...state, code: action.payload }
        case JobListStateActionTypes.errors:
            return { ...state, errors: action.payload }
        case JobListStateActionTypes.jobs:
            return { ...state, jobs: action.payload }
        case JobListStateActionTypes.size:
            return { ...state, size: action.payload }
        case JobListStateActionTypes.sortRule:
            return { ...state, sortRule: action.payload }
        case JobListStateActionTypes.showCommandBar:
            return { ...state, showCommandBar: action.payload }
        case JobListStateActionTypes.offset:
            return { ...state, offset: action.payload }
        case JobListStateActionTypes.pageSize:
            return { ...state, pageSize: action.payload }
        case JobListStateActionTypes.expandedRow:
            return { ...state, expandedRow: action.payload }
        case JobListStateActionTypes.isAllExpanded:
            return { ...state, isAllExpanded: action.payload }
        case JobListStateActionTypes.isAllExpandable:
            return { ...state, isAllExpandable: action.payload }
        case JobListStateActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}

export const jobListModal = (jobContainers) => {
    return (
        jobContainers?.map((job) => {
            return {
                id: job.jobId || 0,
                name: job.jobName || 'NA',
                description: job.description || '',
                ciPipelines: pipelineModal(job.ciPipelines),
                defaultPipeline: getDefaultPipeline(job.ciPipelines),
            }
        }) ?? []
    )
}

const pipelineModal = (ciPipelines: JobCIPipeline[]) => {
    return (
        ciPipelines?.map((ciPipeline) => {
            let status = ciPipeline.status
            if (ciPipeline.status.toLocaleLowerCase() == 'deployment initiated') {
                status = 'Progressing'
            }

            return {
                ciPipelineId: ciPipeline.ciPipelineId || 0,
                ciPipelineName: ciPipeline.ciPipelineName || '',
                lastRunAt: ciPipeline.lastRunAt ? handleUTCTime(ciPipeline.lastRunAt, false) : '',
                lastSuccessAt: ciPipeline.lastSuccessAt ? handleUTCTime(ciPipeline.lastSuccessAt, false) : '',
                status: ciPipeline.status ? handleDeploymentInitiatedStatus(ciPipeline.status) : 'notdeployed',
            }
        }) ?? []
    )
}

const getDefaultPipeline = (ciPipelines) => {
    if (ciPipelines?.length > 0) {
        const ciPipeline =
            ciPipelines.find((pipeline) => pipeline.default) || getLastTriggeredJob(ciPipelines) || ciPipelines[0]
        let status = ciPipeline.status
        if (ciPipeline.status.toLowerCase() === 'deployment initiated') {
            status = 'Progressing'
        }

        return {
            ciPipelineId: ciPipeline.ciPipelineId || 0,
            ciPipelineName: ciPipeline.ciPipelineName || '',
            lastRunAt: ciPipeline.lastRunAt ? handleUTCTime(ciPipeline.lastRunAt, false) : '',
            lastSuccessAt: ciPipeline.lastSuccessAt ? handleUTCTime(ciPipeline.lastSuccessAt, false) : '',
            status: ciPipeline.status ? handleDeploymentInitiatedStatus(ciPipeline.status) : 'notdeployed',
        }
    }
    return {
        ciPipelineId: 0,
        ciPipelineName: '',
        lastRunAt: '',
        lastSuccessAt: '',
        status: 'notdeployed',
    }
}

const getLastTriggeredJob = (jobList) => {
    let job = jobList[0]
    let ms = moment(new Date(0)).valueOf()
    for (let i = 0; i < jobList.length; i++) {
        let time =
            jobList[i].lastDeployedTime && jobList[i].lastDeployedTime.length
                ? jobList[i].lastDeployedTime
                : new Date(0)
        let tmp = moment(time).utc(true).subtract(5, 'hours').subtract(30, 'minutes').valueOf()
        if (tmp > ms) {
            ms = tmp
            job = jobList[i]
        }
    }
    return job
}

const handleDeploymentInitiatedStatus = (status: string): string => {
    if (status.replace(/\s/g, '').toLowerCase() == 'deploymentinitiated') return 'progressing'
    else return status
}

export const onRequestUrlChange = (
    dataStateType,
    parsedPayloadOnUrlChange,
    masterFilters,
    setMasterFilters,
    _getClusterIdsFromRequestUrl,
    _fetchAndSetNamespaces,
    searchParams,
): any => {
    let params = queryString.parse(searchParams)
    let search = params.search || ''
    let environments = params.environment || ''
    let appStatus = params.appStatus || ''
    let teams = params.team || ''
    let clustersAndNamespaces = params.namespace || ''

    let _clusterVsNamespaceMap = buildClusterVsNamespace(clustersAndNamespaces)
    let environmentsArr = environments
        .toString()
        .split(',')
        .map((env) => +env)
        .filter((item) => item != 0)
    let teamsArr = teams
        .toString()
        .split(',')
        .filter((team) => team != '')
        .map((team) => Number(team))
    let appStatusArr = appStatus
        .toString()
        .split(',')
        .filter((status) => status != '')
        .map((status) => status)

    // update master filters data (check/uncheck)
    let filterApplied = {
        environments: new Set<number>(environmentsArr),
        teams: new Set<number>(teamsArr),
        appStatus: new Set<string>(appStatusArr),
        clusterVsNamespaceMap: _clusterVsNamespaceMap,
    }

    let _masterFilters = { appStatus: [], projects: [], environments: [], clusters: [], namespaces: [] }

    // set projects (check/uncheck)
    _masterFilters.projects = masterFilters.projects.map((project) => {
        return {
            key: project.key,
            label: project.label,
            isSaved: true,
            isChecked: filterApplied.teams.has(project.key),
        }
    })

    // set clusters (check/uncheck)
    _masterFilters.clusters = masterFilters.clusters.map((cluster) => {
        return {
            key: cluster.key,
            label: cluster.label,
            isSaved: true,
            isChecked: filterApplied.clusterVsNamespaceMap.has(cluster.key.toString()),
        }
    })

    // set namespace (check/uncheck)
    _masterFilters.namespaces = masterFilters.namespaces.map((namespace) => {
        return {
            key: namespace.key,
            label: namespace.label,
            isSaved: true,
            isChecked:
                filterApplied.clusterVsNamespaceMap.has(namespace.clusterId.toString()) &&
                filterApplied.clusterVsNamespaceMap
                    .get(namespace.clusterId.toString())
                    .includes(namespace.key.split('_')[1]),
            toShow:
                filterApplied.clusterVsNamespaceMap.size == 0 ||
                filterApplied.clusterVsNamespaceMap.has(namespace.clusterId.toString()),
            actualName: namespace.actualName,
            clusterName: namespace.clusterName,
            clusterId: namespace.clusterId,
        }
    })

    _masterFilters.appStatus = masterFilters.appStatus.map((status) => {
        return {
            key: status.key,
            label: status.label,
            isSaved: true,
            isChecked: filterApplied.appStatus.has(status.key),
        }
    })

    // set environments (check/uncheck)
    _masterFilters.environments = masterFilters.environments.map((env) => {
        return {
            key: env.key,
            label: env.label,
            isSaved: true,
            isChecked: filterApplied.environments.has(env.key),
        }
    })
    setMasterFilters(_masterFilters)
    ////// update master filters data ends (check/uncheck)

    let sortBy = params.orderBy || SortBy.APP_NAME
    let sortOrder = params.sortOrder || OrderBy.ASC
    let offset = +params.offset || 0
    let hOffset = +params.hOffset || 0
    let pageSize: number = +params.pageSize || 20
    let pageSizes = new Set([20, 40, 50])

    if (!pageSizes.has(pageSize)) {
        //handle invalid pageSize
        pageSize = 20
    }
    if (offset % pageSize != 0) {
        //pageSize must be a multiple of offset
        offset = 0
    }
    if (hOffset % pageSize != 0) {
        //pageSize must be a multiple of offset
        hOffset = 0
    }

    let payload = {
        environments: environmentsArr,
        teams: teamsArr,
        namespaces: clustersAndNamespaces
            .toString()
            .split(',')
            .filter((item) => item != ''),
        appNameSearch: search,
        appStatuses: appStatusArr,
        sortBy: sortBy,
        sortOrder: sortOrder,
        offset: offset,
        hOffset: hOffset,
        size: +pageSize,
    }

    // check whether to fetch namespaces from backend if any cluster is selected and not same as old
    // do it only for non page load, as on pageload getInitData is handling this logic
    if (dataStateType == AppListViewType.LIST) {
        let _oldClusterIdsCsv = _getClusterIdsFromRequestUrl(parsedPayloadOnUrlChange)
        let _newClusterIdsCsv = _getClusterIdsFromRequestUrl(payload)
        if (_newClusterIdsCsv) {
            // check if cluster selection is changed
            if (_oldClusterIdsCsv != _newClusterIdsCsv) {
                // fetch namespaces
                _fetchAndSetNamespaces(payload, _newClusterIdsCsv, _masterFilters)
            }
        } else {
            // if all clusters are unselected, then reset namespaces
            _masterFilters.namespaces = []
            setMasterFilters(_masterFilters)
        }
    }

    return payload
}
