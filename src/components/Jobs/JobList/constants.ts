import { ExportToCsvProps } from '@devtron-labs/devtron-fe-common-lib'

import { ExportJobDataType } from './types'

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
