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
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import {
    showError,
    Progressing,
    Reload,
    ScanVulnerabilitiesTable,
    VulnerabilityType,
    ScannedByToolModal,
    Drawer,
    stopPropagation,
    SeverityCount,
    SegmentedBarChart,
    DATE_TIME_FORMATS,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as ICClock } from '../../../assets/icons/ic-clock.svg'
import { ViewType, URLS } from '../../../config'
import { getLastExecutionByImageScanDeploy } from '../../../services/service'
import { NoVulnerabilityViewWithTool } from '../../app/details/cIDetails/CIDetails'

interface ScanDetailsModalProps {
    showAppInfo?: boolean
    uniqueId: ExecutionId
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
    severityCount: SeverityCount
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
                high: 0,
                medium: 0,
                low: 0,
                unknown: 0,
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
                <h2 className="fs-16 lh-24 fw-6 cn-9 m-0-imp">Security Vulnerabilities</h2>
                <button type="button" className="dc__transparent p-0 h-20" onClick={this.props.close}>
                    <Close className="icon-dim-20" />
                </button>
            </div>
        )
    }

    renderAppEnvInfo = () => {
        const appEnvConfig = [
            {
                label: 'App',
                value: this.state?.appName || '',
                link:
                    this.state.objectType === 'chart'
                        ? `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${this.state.appId}/env/${this.state.envId}`
                        : `${URLS.APP}/${this.state.appId}${URLS.DETAILS}/${this.state.envId}`,
            },
            { label: 'Env', value: this.state?.envName || '' },
            { label: 'Pod', value: this.state?.pod || '' },
            { label: 'ReplicaSet', value: this.state?.replicaSet || '' },
        ]
        return (
            <div className="px-20 py-10 flexbox dc__align-items-center dc__gap-12 justify-start dc__border-bottom-n1 dc__position-sticky dc__top-0 bcn-0">
                {appEnvConfig.map((data) =>
                    data.value ? (
                        <div className="flexbox dc__align-items-center dc__gap-4" key={data.label}>
                            <span className="fw-6 fs-13 lh-20 cn-9">{`${data.label}:`}</span>
                            {data.link ? (
                                <Link to={data.link} className="dc__no-decor">
                                    <span className="fs-14 fw-4 lh-20 cb-5">{`${data.value}`}</span>
                                </Link>
                            ) : (
                                <span className="fs-14 fw-4 lh-20 cn-9 dc__mxw-180 dc__ellipsis-right">{`${data.value}`}</span>
                            )}
                        </div>
                    ) : null,
                )}
            </div>
        )
    }

    renderScannedObjectInfo = () => {
        const entities = [
            { label: 'Critical', color: '#B21212', value: this.state.severityCount.critical },
            { label: 'High', color: '#F33E3E', value: this.state.severityCount.high },
            { label: 'Medium', color: '#FF7E5B', value: this.state.severityCount.medium },
            { label: 'Low', color: '#FFB549', value: this.state.severityCount.low },
            { label: 'Unknown', color: '#B1B7BC', value: this.state.severityCount.unknown },
        ]
        return (
            <div className="scanned-object dc__border br-8">
                <SegmentedBarChart entities={entities} rootClassName="pb-16 fs-13" countClassName="fw-6" />
                <div className="flexbox dc__content-space">
                    <div className="flex dc__gap-8">
                        <ICClock className="icon-dim-16 dc__no-shrink" />
                        <span className="fw-4 fs-12 h-20 cn-8">
                            Scanned On {dayjs(this.state.lastExecution).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                        </span>
                    </div>
                    <ScannedByToolModal scanToolId={this.state.scanToolId} />
                </div>
            </div>
        )
    }

    renderTable() {
        return (
            <div className="scanned-object__results">
                <ScanVulnerabilitiesTable vulnerabilities={this.state.vulnerabilities} shouldStick />
            </div>
        )
    }

    render() {
        return (
            <Drawer position="right" width="800px" onEscape={this.props.close}>
                <div
                    className="modal-body--scan-details security-scan-container"
                    ref={this.scanDetailsRef}
                    onClick={stopPropagation}
                >
                    {this.renderHeader()}
                    {this.renderAppEnvInfo()}
                    <div className="flexbox-col dc__overflow-auto p-0 bcn-0 trigger-modal__body--security-scan">
                        {this.state.view === ViewType.LOADING ? (
                            <Progressing pageLoader />
                        ) : this.state.view === ViewType.ERROR ? (
                            <Reload reload={this.callGetAPI} />
                        ) : this.state.view === ViewType.FORM && this.state.vulnerabilities.length === 0 ? (
                            <NoVulnerabilityViewWithTool scanToolId={this.state.scanToolId} />
                        ) : (
                            <>
                                {this.renderScannedObjectInfo()}
                                {this.renderTable()}
                            </>
                        )}
                    </div>
                </div>
            </Drawer>
        )
    }
}
