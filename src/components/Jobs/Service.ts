/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import moment from 'moment'
import { get, post, APIOptions, ZERO_TIME_STRING, Teams, getEnvironmentListMinPublic, stringComparatorBySortOrder } from '@devtron-labs/devtron-fe-common-lib'
import { Moment12HourFormat, Routes } from '../../config'
import { sortOptionsByLabel } from '../common'
import { getProjectList } from '../project/service'
import { JobCIPipeline, JobList, JobsMasterFilters } from './Types'
import { JOB_STATUS_OPTIONS } from './Constants'

export const getJobs = async (request, options?: APIOptions) => {
    const response = (await post(Routes.JOB_LIST, request, options)) as JobList

    return {
        ...response,
        result: {
            ...response?.result,
            jobContainers: response?.result?.jobContainers.sort((a, b) =>
                stringComparatorBySortOrder(a.jobName, b.jobName),
            ),
        },
    }
}

export const createJob = (request) => {
    return post(Routes.JOB, request)
}

export const getJobCIPipelines = (jobId: number) => {
    return get(`${Routes.JOB_CI_PIPELINE_LIST}/${jobId}`)
}

export const getJobsInitFilters = (): Promise<JobsMasterFilters> => {
    return Promise.all([getProjectList(), getEnvironmentListMinPublic()]).then(([projectsRes, environmentsRes]) => {
        const filters: JobsMasterFilters = {
            projects: (projectsRes.result
                ? projectsRes.result.map((team: Teams) => {
                      return {
                          label: team.name.toLocaleLowerCase(),
                          value: String(team.id),
                      }
                  })
                : []
            ).sort((a, b) => {
                return sortOptionsByLabel(a, b)
            }),
            status: structuredClone(JOB_STATUS_OPTIONS),
            environments: (environmentsRes.result
                ? environmentsRes.result.map((team) => {
                      return {
                          label: String(team.environment_name.toLocaleLowerCase()),
                          value: String(team.id),
                      }
                  })
                : []
            ).sort((a, b) => {
                return sortOptionsByLabel(a, b)
            }),
        }

        return filters
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
                    for (const _pipeline of _job.ciPipelines as JobCIPipeline[]) {
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
