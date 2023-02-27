import { RouteComponentProps } from 'react-router-dom'
import { ServerError } from '../../modals/commonTypes'
import { TagType } from '../app/types'

interface FormType {
    jobId: number
    projectId: number
    jobName: string
    description: string
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

export enum JobListStateActionTypes {
    view = 'view',
    code = 'code',
    errors = 'errors',
    jobs = 'jobs',
    size = 'size',
    sortRule = 'sortRule',
    showCommandBar = 'showCommandBar',
    offset = 'offset',
    pageSize = 'pageSize',
    expandedRow = 'expandedRow',
    isAllExpanded = 'isAllExpanded',
    isAllExpandable = 'isAllExpandable',
    multipleOptions = 'multipleOptions',
}

export interface JobListStateAction {
    type: JobListStateActionTypes
    payload: any
}

export interface JobCIPipeline {
    ciPipelineId: number
    ciPipelineName: string
    lastRunAt: string
    lastSuccessAt: string
    status: string
}

export interface Job {
    id: number
    name: string
    description: string
    ciPipelines: JobCIPipeline[]
    defaultPipeline: JobCIPipeline
}

export interface JobListState {
    code: number
    view: string
    errors: ServerError[]
    jobs: Job[]
    showCommandBar: boolean
    sortRule: {
        key: string
        order: string
    }
    size: number
    offset: number
    pageSize: number
    expandedRow: Record<number, boolean>
    isAllExpanded: boolean
    isAllExpandable: boolean
}

export interface ExpandedRowProps {
    job: Job
    handleEdit: (jobId: number) => void
    redirect: (job: Job) => string
    close: (e: any) => void
    isArgoInstalled: boolean
}

export interface JobListProps {
    payloadParsedFromUrl?: any
    serverMode?: string
    clearAllFilters: () => void
    sortApplicationList: (key: string) => void
    jobListCount: number
    isSuperAdmin: boolean
    openDevtronAppCreateModel: (event) => void
    setJobCount: React.Dispatch<React.SetStateAction<number>>
    updateDataSyncing: (loading: boolean) => void
    isArgoInstalled: boolean
}

export interface JobListViewProps extends JobListState, RouteComponentProps<{}> {
    expandRow: (id: number | null) => void
    closeExpandedRow: (id: number | null) => void
    sort: (key: string) => void
    handleEditApp: (jobId: number) => void
    redirectToAppDetails: (job: Job) => string
    clearAll: () => void
    changePage: (pageNo: number) => void
    changePageSize: (size: number) => void
    appListCount: number
    isSuperAdmin: boolean
    openDevtronAppCreateModel: (e) => void
    updateDataSyncing: (loading: boolean) => void
    toggleExpandAllRow: () => void
    isArgoInstalled: boolean
}

export interface JobSelectorType {
    onChange: ({ label, value }) => void
    jobId: number
    jobName: string
}
