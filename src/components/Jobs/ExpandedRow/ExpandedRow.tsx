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

import React from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as Expand } from '../../../assets/icons/ic-dropdown-filled.svg'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { ExpandedRowProps, Job, JobCIPipeline } from '../Types'
import './ExpandedRow.scss'
import { URLS } from '../../../config'
import { environmentName } from '../Utils'
import { DEFAULT_ENV } from '../../app/details/triggerView/Constants'
import { AppStatus } from '@devtron-labs/devtron-fe-common-lib'

export default function ExpandedRow(props: ExpandedRowProps) {
    const handleEditJob = () => {
        props.handleEdit(props.job.id)
    }

    const redirectToJobPipelineDetails = (job: Job, ciPipeline: JobCIPipeline): string => {
        return `${URLS.JOB}/${job.id}/${URLS.APP_CI_DETAILS}/${ciPipeline.ciPipelineId}`
    }

    const renderRows = () => {
        return props.job.ciPipelines.map((ciPipeline) => {
            return (
                <Link
                    key={ciPipeline.ciPipelineId}
                    to={`${redirectToJobPipelineDetails(props.job, ciPipeline)}`}
                    className="app-list__row app-list__row--expanded"
                >
                    <div className="app-list__cell--icon" />
                    <div className="app-list__cell app-list__cell--env cb-5">{ciPipeline.ciPipelineName}</div>
                    <div className="app-list__cell app-list__cell--app_status">
                        <AppStatus appStatus={ciPipeline.status} isJobView />
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <p className="dc__truncate-text m-0">
                            {environmentName(ciPipeline)}
                            {environmentName(ciPipeline) === DEFAULT_ENV && (
                                <span className="fw-4 fs-11 ml-4 dc__italic-font-style">(Default)</span>
                            )}
                        </p>
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <p className="dc__truncate-text m-0">{ciPipeline.lastRunAt}</p>
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <p className="dc__truncate-text  m-0">{ciPipeline.lastSuccessAt}</p>
                    </div>
                </Link>
            )
        })
    }

    return (
        <div className="expanded-row">
            <div className="expanded-row__title">
                <div
                    className="cn-9 expanded-row__close flex left pr-20 pl-20 cursor"
                    data-key={props.job.id}
                    onClick={props.close}
                >
                    <Expand className="icon-dim-24 p-2 mr-16 fcn-7" />
                    <span className="fw-6">{props.job.name}</span>
                </div>
                <button type="button" className="button-edit" onClick={handleEditJob}>
                    <Settings className="button-edit__icon" />
                </button>
            </div>
            {renderRows()}
        </div>
    )
}
