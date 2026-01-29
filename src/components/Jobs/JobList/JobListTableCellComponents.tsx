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

import { Link } from 'react-router-dom'

import { AppStatus, FiltersTypeEnum, TableCellComponentProps } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as JobIcon } from '../../../assets/icons/ic-job-node.svg'
import { URLS } from '../../../config'
import { DEFAULT_ENV } from '../../app/details/triggerView/Constants'
import { Job, JobCIPipeline } from '../Types'
import { environmentName } from '../Utils'

export interface JobTableRowData extends Job {
    // For expandable rows
    isExpandedRow?: boolean
    pipeline?: JobCIPipeline
}

export interface JobTableAdditionalProps {
    handleEditJob: (jobId: number) => void
}

// Name Cell Component with Job Icon
export const JobNameCellComponent = ({
    row: { data },
    isExpandedRow,
}: TableCellComponentProps<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>) => {
    if (isExpandedRow) {
        // For expanded rows, show pipeline name
        return <div className="app-list__cell app-list__cell--env cb-5">{data.pipeline?.ciPipelineName || '-'}</div>
    }

    // For main rows, show job name with icon
    const redirectToJobOverview = `${URLS.AUTOMATION_AND_ENABLEMENT_JOB}/${data.id}/${URLS.APP_OVERVIEW}`

    return (
        <Link to={redirectToJobOverview} className="flex left dc__gap-8">
            <div className="icon-dim-24 dc__icon-bg-color br-4 p-4">
                <JobIcon className="icon-dim-16" />
            </div>
            <p className="dc__truncate-text m-0 value cb-5">{data.name}</p>
        </Link>
    )
}

// Status Cell Component
export const JobStatusCellComponent = ({
    row: { data },
    isExpandedRow,
}: TableCellComponentProps<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>) => {
    const pipeline = isExpandedRow ? data.pipeline : data.defaultPipeline
    return <AppStatus status={pipeline?.status || 'notdeployed'} isJobView />
}

// Environment Cell Component
export const JobEnvironmentCellComponent = ({
    row: { data },
    isExpandedRow,
}: TableCellComponentProps<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>) => {
    const pipeline = isExpandedRow ? data.pipeline : data.defaultPipeline
    const envName = environmentName(pipeline)

    return (
        <p className="dc__truncate-text m-0">
            {envName}
            {envName === DEFAULT_ENV && <span className="fw-4 fs-11 ml-4 dc__italic-font-style">(Default)</span>}
        </p>
    )
}

// Last Run At Cell Component
export const JobLastRunAtCellComponent = ({
    row: { data },
    isExpandedRow,
}: TableCellComponentProps<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>) => {
    const pipeline = isExpandedRow ? data.pipeline : data.defaultPipeline
    return <p className="dc__truncate-text m-0">{pipeline?.lastRunAt || '-'}</p>
}

// Last Success At Cell Component
export const JobLastSuccessAtCellComponent = ({
    row: { data },
    isExpandedRow,
}: TableCellComponentProps<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>) => {
    const pipeline = isExpandedRow ? data.pipeline : data.defaultPipeline
    return <p className="dc__truncate-text m-0">{pipeline?.lastSuccessAt || '-'}</p>
}
