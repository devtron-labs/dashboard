import { ViewType } from '../../config'
import { DEFAULT_TAG_DATA } from '../app/config'
import { JobCreationType } from './Constants'
import { CreateJobViewState, CreateJobViewStateAction, CreateJobViewStateActionTypes } from './Types'

export const initialState: CreateJobViewState = {
    view: ViewType.FORM,
    code: 0,
    projects: [],
    disableForm: false,
    jobNameErrors: false,
    showErrors: false,
    form: {
        jobId: 0,
        projectId: 0,
        jobName: '',
        cloneId: 0,
        jobCreationType: JobCreationType.Blank,
    },
    tags: [DEFAULT_TAG_DATA],
    isValid: {
        projectId: false,
        jobName: false,
        cloneJobId: true,
    },
}

export const createJobReducer = (state: CreateJobViewState, action: CreateJobViewStateAction) => {
    switch (action.type) {
        case CreateJobViewStateActionTypes.view:
            return { ...state, view: action.payload }
        case CreateJobViewStateActionTypes.code:
            return { ...state, code: action.payload }
        case CreateJobViewStateActionTypes.projects:
            return { ...state, projects: action.payload }
        case CreateJobViewStateActionTypes.disableForm:
            return { ...state, disableForm: action.payload }
        case CreateJobViewStateActionTypes.jobNameErrors:
            return { ...state, jobNameErrors: action.payload }
        case CreateJobViewStateActionTypes.showErrors:
            return { ...state, showErrors: action.payload }
        case CreateJobViewStateActionTypes.form:
            return { ...state, form: action.payload }
        case CreateJobViewStateActionTypes.tags:
            return { ...state, tags: action.payload }
        case CreateJobViewStateActionTypes.isValid:
            return { ...state, isValid: action.payload }
        case CreateJobViewStateActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}
