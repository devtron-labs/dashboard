import { ExportToCsvProps, FiltersTypeEnum, TableProps } from '@devtron-labs/devtron-fe-common-lib'

import { JobNameCellComponent, JobStatusCellComponent } from './JobListTableCellComponents'
import { ExportJobDataType, JobTableAdditionalProps, JobTableRowData } from './types'

export { JobRowActionsComponent } from './JobRowActionsComponent'

export const JOB_LIST_EXPORT_HEADERS: ExportToCsvProps<keyof ExportJobDataType>['headers'] = [
    { label: 'Job Name', key: 'jobName' },
    { label: 'Job ID', key: 'jobId' },
    { label: 'Description', key: 'description' },
    { label: 'Job Pipeline ID', key: 'ciPipelineId' },
    { label: 'Job Pipeline Name', key: 'ciPipelineName' },
    { label: 'Last Run Status', key: 'status' },
    { label: 'Last Run At', key: 'lastRunAt' },
    { label: 'Last Success At', key: 'lastSuccessAt' },
]

export const JOB_LIST_TABLE_COLUMNS: TableProps<
    JobTableRowData,
    FiltersTypeEnum.URL,
    JobTableAdditionalProps
>['columns'] = [
    {
        label: 'NAME',
        field: 'name',
        isSortable: true,
        size: { fixed: 300 },
        CellComponent: JobNameCellComponent,
    },
    {
        label: 'LAST RUN STATUS',
        field: 'defaultPipeline.status',
        isSortable: false,
        size: { fixed: 150 },
        CellComponent: JobStatusCellComponent,
    },
    {
        label: 'RUN IN ENVIRONMENT',
        field: 'defaultPipeline.environmentName',
        isSortable: false,
        size: { fixed: 200 },
    },
    {
        label: 'LAST RUN AT',
        field: 'defaultPipeline.lastRunAt',
        isSortable: false,
        size: { fixed: 200 },
    },
    {
        label: 'LAST SUCCESS AT',
        field: 'defaultPipeline.lastSuccessAt',
        isSortable: false,
        size: { fixed: 200 },
    },
]
