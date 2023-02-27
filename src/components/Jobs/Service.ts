import { Routes } from '../../config'
import { get, post } from '../../services/api'
import { APIOptions } from '../../services/service.types'

export const getJobs = (request, options: APIOptions) => {
    return post(Routes.JOB_LIST, request, options)
}

export const createJob = (request) => {
    return post(Routes.JOB, request)
}

export const getJobCIPipelines = (jobId: number) => {
    return get(`${Routes.JOB_CI_PIPELINE_LIST}/${jobId}`)
}

export const patchJobCIPipeline = (request) => {
    return post(Routes.JOB_CI_PIPELINE_PATCH, request)
}
