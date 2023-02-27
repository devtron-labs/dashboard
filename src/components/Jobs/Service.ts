import { Routes } from '../../config'
import { get, post } from '../../services/api'

export const getJobs = (request) => {
    return post(Routes.JOB_LIST, request)
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
