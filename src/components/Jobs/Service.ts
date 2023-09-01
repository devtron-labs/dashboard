import moment from 'moment'
import { Moment12HourFormat, Routes, ZERO_TIME_STRING } from '../../config'
import { get, post, APIOptions } from '@devtron-labs/devtron-fe-common-lib'
import { sortOptionsByLabel } from '../common'
import { getProjectList } from '../project/service'
import { JOB_STATUS } from './Constants'
import { JobCIPipeline } from './Types'
import { getEnvironmentListMinPublic } from '../../services/service'

export const getJobs = (request, options?: APIOptions) => {
    return post(Routes.JOB_LIST, request, options)
}

export const createJob = (request) => {
    return post(Routes.JOB, request)
}

export const getJobCIPipelines = (jobId: number) => {
    return get(`${Routes.JOB_CI_PIPELINE_LIST}/${jobId}`)
}

export const getJobsInitData = (payloadParsedFromUrl: Record<string, any>): Promise<any> => {
    return Promise.all([getProjectList(), getEnvironmentListMinPublic()]).then(([projectsRes, environmentsRes]) => {
        const filterApplied = {
            teams: new Set(payloadParsedFromUrl.teams),
            appStatus: new Set(payloadParsedFromUrl.appStatuses),
        }
        const filters = {
            projects: [],
            appStatus: [],
            environments: [],
        }

        // set filter projects starts
        filters.projects = (
            projectsRes.result
                ? projectsRes.result.map((team) => {
                      return {
                          key: team.id,
                          label: team.name.toLocaleLowerCase(),
                          isSaved: true,
                          isChecked: filterApplied.teams.has(team.id),
                      }
                  })
                : []
        ).sort((a, b) => {
            return sortOptionsByLabel(a, b)
        })

        // set filter appStatus starts
        filters.appStatus = Object.entries(JOB_STATUS).map(([keys, values]) => {
            return {
                key: values,
                label: keys,
                isSaved: true,
                isChecked: filterApplied.appStatus.has(values),
            }
        })

        filters.environments = (
            environmentsRes.result
                ? environmentsRes.result.map((team) => {
                      return {
                          key: team.id,
                          label: team.environment_name.toLocaleLowerCase(),
                          isSaved: true,
                          isChecked: filterApplied.teams.has(team.id),
                      }
                  })
                : []
        ).sort((a, b) => {
            return sortOptionsByLabel(a, b)
        })


        return {
            projectsRes: projectsRes,
            environmentsRes: environmentsRes,
            filters: filters,
        }
    })
}

export const getAppListDataToExport = (
    payloadParsedFromUrl: Record<string, any>,
    searchString: string,
    jobCount: number,
) => {
    return getJobs(
        typeof payloadParsedFromUrl === 'object'
            ? {
                  ...payloadParsedFromUrl,
                  appStatuses: payloadParsedFromUrl.appStatuses ?? [],
                  appNameSearch: searchString || '',
                  sortBy: 'appNameSort',
                  sortOrder: 'ASC',
                  size: jobCount,
              }
            : {
                  teams: [],
                  appStatuses: [],
                  appNameSearch: '',
                  sortBy: 'appNameSort',
                  sortOrder: 'ASC',
                  offset: 0,
                  size: jobCount,
              },
    ).then(({ result }) => {
        if (result.jobContainers) {
            const _jobDataList = []
            for (const _job of result.jobContainers) {
                if (_job.ciPipelines?.length > 0) {
                    for (let _pipeline of _job.ciPipelines as JobCIPipeline[]) {
                        _jobDataList.push({
                            jobId: _job.jobId,
                            jobName: _job.jobName,
                            description: _job.description || '-',
                            ciPipelineId: _pipeline.ciPipelineId,
                            ciPipelineName: _pipeline.ciPipelineName,
                            status: _pipeline.status || '-',
                            lastRunAt:
                                _pipeline.lastRunAt && _pipeline.lastRunAt !== ZERO_TIME_STRING
                                    ? moment(_pipeline.lastRunAt).format(Moment12HourFormat)
                                    : '-',
                            lastSuccessAt:
                                _pipeline.lastSuccessAt && _pipeline.lastSuccessAt !== ZERO_TIME_STRING
                                    ? moment(_pipeline.lastSuccessAt).format(Moment12HourFormat)
                                    : '-',
                        })
                    }
                } else {
                    _jobDataList.push({
                        jobId: _job.jobId,
                        jobName: _job.jobName,
                        description: _job.description || '-',
                        ciPipelineId: '-',
                        ciPipelineName: '-',
                        status: '-',
                        lastRunAt: '-',
                        lastSuccessAt: '-',
                    })
                }
            }

            return _jobDataList
        }

        return []
    })
}
