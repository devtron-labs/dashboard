import * as queryString from 'query-string'
import moment from 'moment'
import { AppListViewType } from '../app/config'
import { JobCIPipeline, JobListState, JobListStateAction, JobListStateActionTypes } from './Types'
import { OrderBy, SortBy } from '../app/list/types'
import { handleUTCTime } from '../common'
import { JobPipeline } from '../app/types'
import { DEFAULT_ENV } from '../app/details/triggerView/Constants'
import { ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'

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
                description: job.description.description || '',
                ciPipelines: pipelineModal(job.ciPipelines),
                defaultPipeline: getDefaultPipeline(job.ciPipelines),
            }
        }) ?? []
    )
}

const pipelineModal = (ciPipelines: JobCIPipeline[]) => {
    return (
        ciPipelines?.map((ciPipeline) => {
            if (ciPipeline.status.toLocaleLowerCase() == 'deployment initiated') {
                ciPipeline.status = 'Progressing'
            }

            return {
                ciPipelineId: ciPipeline.ciPipelineId || 0,
                ciPipelineName: ciPipeline.ciPipelineName || '',
                lastRunAt:
                    ciPipeline.lastRunAt && ciPipeline.lastRunAt !== ZERO_TIME_STRING
                        ? handleUTCTime(ciPipeline.lastRunAt, true)
                        : '-',
                lastSuccessAt:
                    ciPipeline.lastSuccessAt && ciPipeline.lastSuccessAt !== ZERO_TIME_STRING
                        ? handleUTCTime(ciPipeline.lastSuccessAt, true)
                        : '-',
                status: ciPipeline.status ? handleDeploymentInitiatedStatus(ciPipeline.status) : 'notdeployed',
                environmentName: ciPipeline.environmentName || '-',
                lastTriggeredEnvironmentName: ciPipeline.lastTriggeredEnvironmentName,
            }
        }) ?? []
    )
}

const getDefaultPipeline = (ciPipelines) => {
    if (ciPipelines?.length > 0) {
        const ciPipeline =
            ciPipelines.find((pipeline) => pipeline.default) || getLastTriggeredJob(ciPipelines) || ciPipelines[0]

        return {
            ciPipelineId: ciPipeline.ciPipelineId || 0,
            ciPipelineName: ciPipeline.ciPipelineName || '',
            lastRunAt:
                ciPipeline.lastRunAt && ciPipeline.lastRunAt !== ZERO_TIME_STRING
                    ? handleUTCTime(ciPipeline.lastRunAt, true)
                    : '-',
            lastSuccessAt:
                ciPipeline.lastSuccessAt && ciPipeline.lastSuccessAt !== ZERO_TIME_STRING
                    ? handleUTCTime(ciPipeline.lastSuccessAt, true)
                    : '-',
            status: ciPipeline.status ? handleDeploymentInitiatedStatus(ciPipeline.status) : 'notdeployed',
            environmentName: ciPipeline.environmentName || '-',
            lastTriggeredEnvironmentName: ciPipeline.lastTriggeredEnvironmentName,
        }
    }
    return {
        ciPipelineId: 0,
        ciPipelineName: '-',
        lastRunAt: '-',
        lastSuccessAt: '-',
        status: 'notdeployed',
    }
}

const getLastTriggeredJob = (jobList) => {
    let selectedJob = jobList[0]
    let ms = moment(new Date(0)).valueOf()
    for (const job of jobList) {
        const time = job.lastDeployedTime && job.lastDeployedTime.length ? job.lastDeployedTime : new Date(0)
        const tmp = moment(time).utc(true).subtract(5, 'hours').subtract(30, 'minutes').valueOf()
        if (tmp > ms) {
            ms = tmp
            selectedJob = job
        }
    }
    return selectedJob
}

const handleDeploymentInitiatedStatus = (status: string): string => {
    if (status.replace(/\s/g, '').toLowerCase() == 'deploymentinitiated') {
        return 'progressing'
    }
    return status
}

export const onRequestUrlChange = (masterFilters, setMasterFilters, searchParams): any => {
    const params = queryString.parse(searchParams)
    const search = params.search || ''
    const appStatus = params.appStatus || ''
    const teams = params.team || ''
    const environments = params.environment || ''
    const teamsArr = teams
        .toString()
        .split(',')
        .filter((team) => team != '')
        .map((team) => Number(team))
    const appStatusArr = appStatus
        .toString()
        .split(',')
        .filter((status) => status != '')
        .map((status) => status)
    const environmentsArr = environments
        .toString()
        .split(',')
        .filter((environment) => environment != '')
        .map((environment) => Number(environment))

    // update master filters data (check/uncheck)
    const filterApplied = {
        teams: new Set<number>(teamsArr),
        appStatus: new Set<string>(appStatusArr),
        environments: new Set<number>(environmentsArr),
    }

    const _masterFilters = { appStatus: [], projects: [], environments: [], clusters: [], namespaces: [] }

    // set projects (check/uncheck)
    _masterFilters.projects = masterFilters.projects.map((project) => {
        return {
            key: project.key,
            label: project.label,
            isSaved: true,
            isChecked: filterApplied.teams.has(project.key),
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

    _masterFilters.environments = masterFilters.environments.map((status) => {
        return {
            key: status.key,
            label: status.label,
            isSaved: true,
            isChecked: filterApplied.environments.has(status.key),
        }
    })
    setMasterFilters(_masterFilters)
    /// /// update master filters data ends (check/uncheck)

    const sortBy = params.orderBy || SortBy.APP_NAME
    const sortOrder = params.sortOrder || OrderBy.ASC
    let offset = +params.offset || 0
    let pageSize: number = +params.pageSize || 20
    const pageSizes = new Set([20, 40, 50])

    if (!pageSizes.has(pageSize)) {
        // handle invalid pageSize
        pageSize = 20
    }
    if (offset % pageSize != 0) {
        // pageSize must be a multiple of offset
        offset = 0
    }

    return {
        teams: teamsArr,
        appNameSearch: search,
        appStatuses: appStatusArr,
        environments: environmentsArr,
        sortBy,
        sortOrder,
        offset,
        size: +pageSize,
    }
}

export const populateQueryString = (searchParams: string): Record<string, any> => {
    const qs = queryString.parse(searchParams)
    const keys = Object.keys(qs)
    const query = {}

    for (const key of keys) {
        query[key] = qs[key]
    }
    return query
}

export const environmentName = (jobPipeline: JobPipeline | JobCIPipeline): string => {
    const status = jobPipeline.status === 'notdeployed' ? '' : jobPipeline.status
    if (status === '') {
        if (jobPipeline.environmentName === '') {
            return DEFAULT_ENV
        }
        return jobPipeline.environmentName
    }
    if (jobPipeline.lastTriggeredEnvironmentName === '') {
        return DEFAULT_ENV
    }
    return jobPipeline.lastTriggeredEnvironmentName
}
