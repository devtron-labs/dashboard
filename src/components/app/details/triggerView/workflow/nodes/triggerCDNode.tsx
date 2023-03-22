import React, { Component } from 'react'
import { DeploymentNodeType, TriggerCDNodeProps, TriggerCDNodeState } from '../../types'
import { statusColor, statusIcon } from '../../../../config'
import { ReactComponent as Rollback } from '../../../../../../assets/icons/ic-rollback.svg'
import { URLS, DEFAULT_STATUS, Routes } from '../../../../../../config'
import Tippy from '@tippyjs/react'
import { Link } from 'react-router-dom'
import { TriggerViewContext } from '../../config'
import { triggerStatus } from '../../../cicdHistory/History.components'
import { get } from '../../../../../../services/api'
// import { cdMaterialListModal } from '../../../../service'
import { getCDMaterialList } from '../../../../service'
let stageMap = {
    PRECD: 'PRE',
    CD: 'DEPLOY',
    POSTCD: 'POST',
}

export class TriggerCDNode extends Component<TriggerCDNodeProps, TriggerCDNodeState> {
    constructor(props) {
        super(props)
        this.redirectToCDDetails = this.redirectToCDDetails.bind(this)
        this.state = {
            ci_artifacts: [],
            latest_ci_artifact_id: 0,
            latest_ci_artifact_status: '',
            status: this.props.status,
            latest_wf_artifact_status: '',
            latest_wf_artifact_id: 0,
        }
    }
    getCDNodeDetailsURL(): string {
        return `${this.props.match.url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}/${
            this.props.environmentId
        }`
    }

    getCDMaterialList(cdMaterialId, stageType: DeploymentNodeType) {
        let URL = `${Routes.CD_MATERIAL_GET}/${cdMaterialId}/material?stage=${stageMap[stageType]}`
        return get(URL).then((response) => {
            // return {
            //     ci_artifacts: response.result.ci_artifacts,
            //     latest_ci_artifact_id: response.result.latest_wf_artifact_id,
            //     latest_wf_artifact_status: response.result.latest_wf_artifact_status,
            // }
            let ci_artifacts = response.result.ci_artifacts

            this.setState({
                ci_artifacts: ci_artifacts,
                latest_ci_artifact_id: ci_artifacts.length > 1 ? ci_artifacts[0].id : 0,
                latest_ci_artifact_status: ci_artifacts.length > 0 ? ci_artifacts[0].deployed : true,
                status: response.result.latest_wf_artifact_status,
                latest_wf_artifact_status: response.result.latest_wf_artifact_status,
                latest_wf_artifact_id: response.result.latest_wf_artifact_id,
            })
        })
    }
    redirectToCDDetails() {
        if (this.props.fromAppGrouping) {
            return
        }
        this.props.history.push(this.getCDNodeDetailsURL())
    }

    componentDidMount() {
        this.getCDMaterialList(this.props.id, DeploymentNodeType[this.props.type])
    }
    componentDidUpdate(
        prevProps: Readonly<TriggerCDNodeProps>,
        prevState: Readonly<TriggerCDNodeState>,
        snapshot?: any,
    ) {
        if (this.state.latest_ci_artifact_id === this.state.latest_wf_artifact_id && this.state.status != '') {
            if (prevState.status !== this.props.status && this.props.status === 'succeeded') {
                this.getCDMaterialList(this.props.id, DeploymentNodeType[this.props.type])
            }
        }
    }
    renderStatus() {
        const url = this.getCDNodeDetailsURL()
        let statusText = this.props.status ? triggerStatus(this.props.status) : ''
        let status = statusText ? statusText.toLowerCase() : ''
        let hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        if (hideDetails)
            return (
                <div className="dc__cd-trigger-status" style={{ color: statusColor[status] }}>
                    <span>{statusText}</span>
                </div>
            )
        else
            return (
                <div className="dc__cd-trigger-status" style={{ color: statusColor[status] }}>
                    <span>
                        <span className={`dc__cd-trigger-status__icon ${statusIcon[status]}`} />
                    </span>
                    <span>{statusText}</span>
                    {!this.props.fromAppGrouping && (
                        <>
                            <span className="mr-5 ml-5">/</span>
                            <Link to={url} className="workflow-node__details-link">
                                Details
                            </Link>
                        </>
                    )}
                </div>
            )
    }

    renderCardContent() {
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <div className="workflow-node">
                            <div className="workflow-node__trigger-type workflow-node__trigger-type--cd">
                                {this.props.triggerType}
                            </div>
                            <div className="workflow-node__title flex">
                                {/* <img src={pipelineDeploy} className="icon-dim-24 mr-16" /> */}
                                <div className="workflow-node__full-width-minus-Icon">
                                    <span className="workflow-node__text-light">
                                        Deploy: {this.props.deploymentStrategy}
                                    </span>
                                    <Tippy
                                        className="default-tt"
                                        arrow={true}
                                        placement="bottom"
                                        content={this.props.environmentName}
                                    >
                                        <span className="dc__ellipsis-right">{this.props.environmentName}</span>
                                    </Tippy>
                                </div>
                                <div className="workflow-node__icon-common ml-8 workflow-node__CD-icon" />
                            </div>
                            {this.renderStatus()}
                            <div className="workflow-node__btn-grp">
                                <Tippy className="default-tt" arrow={true} placement="bottom" content={'Rollback'}>
                                    <button
                                        className="workflow-node__rollback-btn"
                                        onClick={(event) => context.onClickRollbackMaterial(+this.props.id)}
                                    >
                                        <Rollback className="icon-dim-20 dc__vertical-align-middle" />
                                    </button>
                                </Tippy>
                                <button
                                    className="workflow-node__deploy-btn"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        context.onClickCDMaterial(this.props.id, DeploymentNodeType[this.props.type])
                                    }}
                                >
                                    Select Image
                                    {!this.state.latest_ci_artifact_status && <span>Not deplyed</span>}
                                </button>
                            </div>
                        </div>
                    )
                }}
            </TriggerViewContext.Consumer>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                key={`cd-${this.props.id}`}
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{ overflow: 'visible' }}
            >
                {this.renderCardContent()}
            </foreignObject>
        )
    }
}
