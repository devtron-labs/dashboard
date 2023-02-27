import { TagType } from '../app/types'

interface FormType {
    jobId: number
    projectId: number
    jobName: string
    cloneId: number
    jobCreationType: string
}

interface ProjectType {
    id: number
    name: string
}

interface ValidationType {
    projectId: boolean
    jobName: boolean
    cloneJobId: boolean
}

export interface CreateJobViewState {
    view: string
    code: number
    projects: ProjectType[]
    disableForm: boolean
    jobNameErrors: boolean
    showErrors: boolean
    form: FormType
    tags: TagType[]
    isValid: ValidationType
}

export enum CreateJobViewStateActionTypes {
    view = 'view',
    code = 'code',
    projects = 'projects',
    disableForm = 'disableForm',
    jobNameErrors = 'jobNameErrors',
    showErrors = 'showErrors',
    form = 'form',
    tags = 'tags',
    isValid = 'isValid',
    multipleOptions = 'multipleOptions',
}


export interface CreateJobViewStateAction {
    type: CreateJobViewStateActionTypes
    payload: any
}
