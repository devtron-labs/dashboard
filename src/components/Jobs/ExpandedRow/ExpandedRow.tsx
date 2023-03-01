import React from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as Expand } from '../../../assets/icons/ic-dropdown-filled.svg'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { ExpandedRowProps } from '../Types'
import AppStatus from '../../app/AppStatus'
import './ExpandedRow.scss'

export default function ExpandedRow(props: ExpandedRowProps) {
    const handleEditApp = () => {
        props.handleEdit(props.job.id)
    }

    const renderRows = () => {
        return props.job.ciPipelines.map((ciPipeline) => {
            return (
                <Link
                    key={ciPipeline.ciPipelineId}
                    to={`${props.redirect(props.job)}`}
                    className="app-list__row app-list__row--expanded"
                >
                    <div className="app-list__cell--icon" />
                    <div className="app-list__cell app-list__cell--env cb-5">{ciPipeline.ciPipelineName}</div>
                    <div className="app-list__cell app-list__cell--app_status">
                        <AppStatus appStatus={ciPipeline.status} />
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <p className="dc__truncate-text m-0">{ciPipeline.lastRunAt}</p>
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <p className="dc__truncate-text  m-0">{ciPipeline.lastSuccessAt}</p>
                    </div>
                    <div className="app-list__cell app-list__cell--action" />
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
                <button type="button" className="button-edit button-edit--white" onClick={handleEditApp}>
                    <Settings className="button-edit__icon" />
                </button>
            </div>
            {renderRows()}
        </div>
    )
}
