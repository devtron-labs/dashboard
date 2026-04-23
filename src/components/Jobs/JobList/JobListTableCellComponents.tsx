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

import { generatePath, Link } from 'react-router-dom'

import { AppStatus, FiltersTypeEnum, ROUTER_URLS, TableCellComponentProps } from '@devtron-labs/devtron-fe-common-lib'

import { JobTableAdditionalProps, JobTableRowData } from './types'

// Name Cell Component with Job Icon
export const JobNameCellComponent = ({
    row: { data },
    isExpandedRow,
}: TableCellComponentProps<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>) => {
    if (isExpandedRow) {
        // For expanded rows, show pipeline name
        return <div className="flex left dc__truncate-text lh-20 fs-13">{data.pipeline?.ciPipelineName || '-'}</div>
    }

    // For main rows, show job name with icon
    const redirectToJobOverview = generatePath(ROUTER_URLS.JOB_DETAIL.OVERVIEW, { appId: String(data.id) })

    return (
        <Link to={redirectToJobOverview} className="cb-5 dc__truncate-text lh-20 fs-13 flex left">
            {data.name}
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
