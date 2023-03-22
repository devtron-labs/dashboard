import React, { Component } from 'react'
import { DeploymentNodeType, TriggerPrePostCDNodeProps, TriggerPrePostCDNodeState } from '../../types'
import { TriggerStatus } from '../../../../config'
import { Routes, URLS } from './../../../../../../config'
import { Link } from 'react-router-dom'
import { DEFAULT_STATUS } from '../../../../../../config'
import { TriggerViewContext } from '../../config'
import { get } from '../../../../../../services/api'
let stageMap = {
    PRECD: 'PRE',
    CD: 'DEPLOY',
    POSTCD: 'POST',
}

export class TriggerPrePostCDNode extends Component<TriggerPrePostCDNodeProps, TriggerPrePostCDNodeState> {
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
    componentDidMount() {
        this.getCDMaterialList(this.props.id, DeploymentNodeType[this.props.type])
    }
    componentDidUpdate(
        prevProps: Readonly<TriggerPrePostCDNodeProps>,
        prevState: Readonly<TriggerPrePostCDNodeState>,
        snapshot?: any,
    ): void {
        if (this.state.latest_ci_artifact_id === this.state.latest_wf_artifact_id && this.state.status != '') {
            if (prevState.status !== this.props.status && this.props.status === 'succeeded') {
                this.getCDMaterialList(this.props.id, DeploymentNodeType[this.props.type])
            }
        }
    }

    getCDDetailsURL(): string {
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CD_DETAILS)}/${this.props.environmentId}/${
            this.props.id
        }`
    }

    redirectToCDDetails(e) {
        if (this.props.fromAppGrouping) {
            return
        }
        this.props.history.push(this.getCDDetailsURL())
    }

    renderStatus(isClickable: boolean, status: string) {
        const url = this.getCDDetailsURL()
        if (isClickable) {
            return (
                <div className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    <span>{this.props.status}</span>
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
        } else
            return (
                <div className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    <span>{this.props.status}</span>
                </div>
            )
    }

    renderCardContent() {
        let status = this.props.status ? this.props.status.toLocaleLowerCase() : ''
        let stage = this.props.type === 'PRECD' ? 'Pre-deployment' : 'Post-deployment'
        let isClickable = !(
            status === DEFAULT_STATUS.toLowerCase() ||
            status === 'not triggered' ||
            status === 'not deployed'
        )
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <div
                            className={isClickable ? 'workflow-node cursor' : 'workflow-node'}
                            onClick={(e) => {
                                if (isClickable) this.redirectToCDDetails(e)
                            }}
                        >
                            <div className="workflow-node__trigger-type workflow-node__trigger-type--cd">
                                {this.props.triggerType}
                            </div>
                            <div className="workflow-node__title flex">
                                <div className="workflow-node__full-width-minus-Icon">
                                    <span className="workflow-node__text-light">Stage</span>
                                    <span className="">{stage}</span>
                                </div>
                                <div className="workflow-node__icon-common ml-8 workflow-node__CD-pre-post-icon" />
                            </div>
                            {this.renderStatus(isClickable, status)}
                            <div className="workflow-node__btn-grp">
                                <button
                                    className="workflow-node__deploy-btn"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        context.onClickCDMaterial(this.props.id, this.props.type)
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
