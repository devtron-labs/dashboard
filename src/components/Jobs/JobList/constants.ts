import {
    ExportToCsvProps,
    FiltersTypeEnum,
    stringComparatorBySortOrder,
    TableProps,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    JobEnvironmentCellComponent,
    JobLastRunAtCellComponent,
    JobLastSuccessAtCellComponent,
    JobNameCellComponent,
    JobStatusCellComponent,
    JobTableAdditionalProps,
    JobTableRowData,
} from './JobListTableCellComponents'
import { ExportJobDataType } from './types'

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
        size: { range: { startWidth: 200, minWidth: 150, maxWidth: 'infinite' } },
        CellComponent: JobNameCellComponent,
        comparator: stringComparatorBySortOrder,
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
        CellComponent: JobEnvironmentCellComponent,
    },
    {
        label: 'LAST RUN AT',
        field: 'defaultPipeline.lastRunAt',
        isSortable: false,
        size: { fixed: 200 },
        CellComponent: JobLastRunAtCellComponent,
    },
    {
        label: 'LAST SUCCESS AT',
        field: 'defaultPipeline.lastSuccessAt',
        isSortable: false,
        size: { fixed: 200 },
        CellComponent: JobLastSuccessAtCellComponent,
    },
]
