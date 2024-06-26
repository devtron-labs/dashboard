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

import React, { Component } from 'react'
import {
    showError,
    Progressing,
    Reload,
    ScanVulnerabilitiesTable,
    VulnerabilityType,
    ScannedByToolModal,
    Drawer,
    ScannedObjectBar,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ViewType, URLS } from '../../../config'
import { getLastExecutionByImageScanDeploy } from '../../../services/service'
import { NoVulnerabilityViewWithTool } from '../../app/details/cIDetails/CIDetails'

interface ScanDetailsModalProps {
    uniqueId: ExecutionId
    showAppInfo: boolean
    name?: string
    close: () => void
}

interface ExecutionId {
    appId: number | string
    envId: number | string
    imageScanDeployInfoId: number
}

interface ScanDetailsModalState {
    view: string
    lastExecution: string
    scanExecutionId?: number
    scanEnabled?: boolean
    scanned?: boolean
    appId?: number
    appName?: string
    envId?: number
    envName?: string
    pod?: string
    replicaSet?: string
    image?: string
    objectType?: 'app' | 'chart'
    severityCount: {
        critical: number
        moderate: number
        low: number
    }
    vulnerabilities: VulnerabilityType[]
    scanToolId?: number
}

export class ScanDetailsModal extends Component<ScanDetailsModalProps, ScanDetailsModalState> {
    scanDetailsRef = null
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            severityCount: {
                critical: 0,
                moderate: 0,
                low: 0,
            },
            scanExecutionId: 0,
            lastExecution: '',
            appId: 0,
            appName: '',
            envId: 0,
            envName: '',
            pod: '',
            replicaSet: '',
            image: '',
            objectType: 'app',
            vulnerabilities: [],
            scanned: false,
            scanEnabled: false,
        }
        this.callGetAPI = this.callGetAPI.bind(this)
        this.scanDetailsRef = React.createRef<HTMLDivElement>()
    }

    componentDidMount() {
        this.callGetAPI()
        document.addEventListener('click', this.outsideClickHandler)
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.outsideClickHandler)
    }
    outsideClickHandler = (evt): void => {
        evt.stopPropagation()
        if (this.scanDetailsRef.current && !this.scanDetailsRef.current.contains(evt.target)) {
            this.props.close()
        }
    }

    callGetAPI() {
        const promise = getLastExecutionByImageScanDeploy(
            this.props.uniqueId.imageScanDeployInfoId,
            this.props.uniqueId.appId,
            this.props.uniqueId.envId,
        )
        promise
            .then((response) => {
                this.setState({
                    ...response.result,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    renderHeader() {
        return (
            <div className="trigger-modal__header">
                <h1 className="modal__title">{this.props.name ? this.props.name : `Security Vulnerabilities`}</h1>
                <button type="button" className="dc__transparent " onClick={this.props.close}>
                    <Close className="icon-dim-20" />
                </button>
            </div>
        )
    }

    renderScannedObjectInfo() {
        let link = `/app/${this.state.appId}/details/${this.state.envId}`
        if (this.state.objectType === 'chart') {
            link = `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${this.state.appId}/env/${this.state.envId}`
        }
        return (
            <div className="scanned-object">
                <div className="flexbox flex-justify">
                    {this.props.showAppInfo ? (
                        <div>
                            {this.state.appId ? (
                                <>
                                    <p className="scanned-object__label">App</p>
                                    <p className="scanned-object__value">
                                        {this.props.showAppInfo && this.state.objectType !== 'chart' ? (
                                            <Link to={link} className="dc__no-decor" onClick={(event) => {}}>
                                                {this.state.appName}
                                            </Link>
                                        ) : null}
                                    </p>
                                </>
                            ) : null}
                            {this.state.envId ? (
                                <>
                                    <p className="scanned-object__label">Environment</p>
                                    <p className="scanned-object__value">{this.state.envName}</p>
                                </>
                            ) : null}
                            {this.state.replicaSet ? (
                                <>
                                    <p className="scanned-object__label">Replica Set</p>
                                    <p className="scanned-object__value">{this.state.replicaSet}</p>
                                </>
                            ) : null}
                            {this.state.pod ? (
                                <>
                                    <p className="scanned-object__label">Pod</p>
                                    <p className="scanned-object__value">{this.state.pod}</p>
                                </>
                            ) : null}
                        </div>
                    ) : null}
                    {this.props.showAppInfo && this.state.objectType !== 'chart' ? (
                        <div className="flexbox dc__content-space pt-3">
                            <div className="flex top">
                                <span className="flex">
                                    <ScannedByToolModal scanToolId={this.state.scanToolId} />
                                </span>
                            </div>
                        </div>
                    ) : null}
                </div>
                {this.props.showAppInfo ? null : (
                    <>
                        <div className="flexbox dc__content-space">
                            <span className="scanned-object__label flex left">Last Scanned</span>
                            <span className="flex right">
                                <ScannedByToolModal scanToolId={this.state.scanToolId} />
                            </span>
                        </div>
                        <p className="scanned-object__value">{this.state.lastExecution}</p>
                    </>
                )}

                <ScannedObjectBar
                    criticalVulnerabilitiesCount={this.state.severityCount.critical}
                    moderateVulnerabilitiesCount={this.state.severityCount.moderate}
                    lowVulnerabilitiesCount={this.state.severityCount.low}
                    objectBarClassName="mb-16"
                />
            </div>
        )
    }

    renderTable() {
        return (
            <div className="scanned-object__results">
                <ScanVulnerabilitiesTable vulnerabilities={this.state.vulnerabilities} />
            </div>
        )
    }

    render() {
        return (
            <Drawer position="right" width="800px" onEscape={this.props.close}>
                <div className="modal-body--scan-details" ref={this.scanDetailsRef} onClick={stopPropagation}>
                    {this.renderHeader()}
                    <div className="trigger-modal__body trigger-modal__body--security-scan">
                        {this.state.view === ViewType.LOADING ? (
                            <Progressing pageLoader />
                        ) : this.state.view === ViewType.ERROR ? (
                            <Reload reload={this.callGetAPI} />
                        ) : this.state.view === ViewType.FORM && this.state.vulnerabilities.length === 0 ? (
                            <NoVulnerabilityViewWithTool scanToolId={this.state.scanToolId} />
                        ) : (
                            <div className="trigger-modal__body trigger-modal__body--security-scan">
                                {this.renderScannedObjectInfo()}
                                {this.renderTable()}
                            </div>
                        )}
                    </div>
                </div>
            </Drawer>
        )
    }
}
