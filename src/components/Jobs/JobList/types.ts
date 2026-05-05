import { Job, JobCIPipeline } from '../Types'

export interface ExportJobDataType {
    jobName: string
    jobId: string
    description: string
    ciPipelineId: string
    ciPipelineName: string
    status: string
    lastRunAt: string
    lastSuccessAt: string
}

export interface JobTableRowData extends Job {
    // For expandable rows
    isExpandedRow?: boolean
    pipeline?: JobCIPipeline
}

export interface JobTableAdditionalProps {
    handleEditJob: (jobId: number) => void
}
