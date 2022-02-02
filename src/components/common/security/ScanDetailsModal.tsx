import React, { Component } from 'react';
import { VisibleModal, showError, Progressing, VulnerabilityType, ScanVulnerabilitiesTable } from '../index';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import { ViewType, URLS } from '../../../config';
import { getLastExecutionByImageScanDeploy } from '../../../services/service';
import EmptyState from '../../EmptyState/EmptyState';
import NoVulnerabilities from '../../../assets/img/ic-vulnerability-not-found.svg'
import Reload from '../../Reload/Reload';
import { Link } from 'react-router-dom';

interface ScanDetailsModalProps {
    uniqueId: ExecutionId;
    showAppInfo: boolean;
    name?: string;
    close: () => void;
}

interface ExecutionId {
    appId: number | string;
    envId: number | string;
    imageScanDeployInfoId: number;
}

interface ScanDetailsModalState {
    view: string;
    lastExecution: string;
    scanExecutionId?: number;
    scanEnabled: boolean;
    scanned: boolean;
    appId?: number;
    appName?: string;
    envId?: number;
    envName?: string;
    pod?: string;
    replicaSet?: string;
    image?: string;
    objectType: 'app' | 'chart';
    severityCount: {
        critical: number;
        moderate: number;
        low: number;
    },
    vulnerabilities: VulnerabilityType[];
}

export class ScanDetailsModal extends Component<ScanDetailsModalProps, ScanDetailsModalState>{

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            severityCount: {
                critical: 0,
                moderate: 0,
                low: 0,
            },
            scanExecutionId: 0,
            lastExecution: "",
            appId: 0,
            appName: "",
            envId: 0,
            envName: "",
            pod: "",
            replicaSet: "",
            image: "",
            objectType: 'app',
            vulnerabilities: [],
            scanned: false,
            scanEnabled: false,
        }
        this.callGetAPI = this.callGetAPI.bind(this);
    }

    componentDidMount() {
        this.callGetAPI();
    }

    callGetAPI() {
        let promise = getLastExecutionByImageScanDeploy(this.props.uniqueId.imageScanDeployInfoId, this.props.uniqueId.appId, this.props.uniqueId.envId)
        promise.then((response) => {
            this.setState({
                ...response.result,
                view: ViewType.FORM,
            });
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    renderHeader() {
        return <div className="trigger-modal__header">
            <h1 className="modal__title">{this.props.name ? this.props.name : `Security Vulnerabilities`}</h1>
            <button type="button" className="transparent " onClick={this.props.close}>
                <Close className="icon-dim-20" />
            </button>
        </div>
    }

    renderScannedObjectInfo() {
        let link = `/app/${this.state.appId}/details/${this.state.envId}`;
        if (this.state.objectType === 'chart') {
            link = `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${this.state.appId}/env/${this.state.envId}`;
        }
        return <div className="scanned-object">
            <div className="flexbox flex-justify">
                {this.props.showAppInfo ? <div>
                    {this.state.appId ? <>
                        <p className="scanned-object__label">App</p>
                        <p className="scanned-object__value">{this.state.appName}</p>
                    </> : null}
                    {this.state.envId ? <>
                        <p className="scanned-object__label">Environment</p>
                        <p className="scanned-object__value">{this.state.envName}</p>
                    </> : null}
                    {this.state.replicaSet ? <>
                        <p className="scanned-object__label">Replica Set</p>
                        <p className="scanned-object__value">{this.state.replicaSet}</p>
                    </> : null}
                    {this.state.pod ? <>
                        <p className="scanned-object__label">Pod</p>
                        <p className="scanned-object__value">{this.state.pod}</p>
                    </> : null}
                </div> : null}
                {this.props.showAppInfo && this.state.objectType !== "chart" ? <Link to={link} className="cta small cancel no-decor" onClick={(event) => {
                }}> View Application
                </Link> : null}
            </div>
            {this.props.showAppInfo ? null : <>
                <p className="scanned-object__label">Last Scanned</p>
                <p className="scanned-object__value">{this.state.lastExecution}</p>
            </>}
            {this.renderCount()}
        </div>
    }


    renderCount() {
        let total = this.state.severityCount.critical + this.state.severityCount.moderate + this.state.severityCount.low;
        return <>
            <div className="scanned-object__bar mb-16">
                <div className="scanned-object__critical-count" style={{ width: `${100 * this.state.severityCount.critical / total}%` }}></div>
                <div className="scanned-object__moderate-count" style={{ width: `${100 * this.state.severityCount.moderate / total}%` }}></div>
                <div className="scanned-object__low-count" style={{ width: `${100 * this.state.severityCount.low / total}%` }}></div>
            </div>
            <div className="flexbox">
                <p className="scanned-object__counts">
                    <span className="scanned-object__icon scanned-object__critical-count"></span>Critical<span className="fw-6 ml-5 mr-20">{this.state.severityCount.critical}</span>
                </p>
                <p className="scanned-object__counts">
                    <span className="scanned-object__icon scanned-object__moderate-count"></span>Moderate<span className="fw-6 ml-5 mr-20">{this.state.severityCount.moderate}</span>
                </p>
                <p className="scanned-object__counts">
                    <span className="scanned-object__icon scanned-object__low-count"></span>Low<span className="fw-6 ml-5 mr-20">{this.state.severityCount.low}</span>
                </p>
            </div>
        </>
    }
    renderTable() {
        return <div className="scanned-object__results">
            <ScanVulnerabilitiesTable vulnerabilities={this.state.vulnerabilities} />
        </div>
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <VisibleModal className="">
                <div className="modal-body--scan-details">
                    {this.renderHeader()}
                    <div className="trigger-modal__body trigger-modal__body--security-scan">
                        <Progressing pageLoader />
                    </div>
                </div>
            </VisibleModal>
        }
        else if (this.state.view === ViewType.ERROR) {
            return <VisibleModal className="">
                <div className="modal-body--scan-details">
                    {this.renderHeader()}
                    <div className="trigger-modal__body trigger-modal__body--security-scan">
                        <Reload reload={this.callGetAPI} />
                    </div>
                </div>
            </VisibleModal>
        }
        else if (this.state.view === ViewType.FORM && this.state.vulnerabilities.length === 0) {
            return <VisibleModal className="">
                <div className="modal-body--scan-details">
                    {this.renderHeader()}
                    <div className="trigger-modal__body trigger-modal__body--security-scan">
                        <EmptyState>
                            <EmptyState.Image><img src={NoVulnerabilities} alt="" /></EmptyState.Image>
                            <EmptyState.Title><h4>No vulnerabilities Found</h4></EmptyState.Title>
                            {this.state.scanEnabled && this.state.scanned && (
                                    <EmptyState.Subtitle>
                                        <span>Last scanned on {this.state.lastExecution}</span>
                                    </EmptyState.Subtitle>
                                )}
                        </EmptyState>
                    </div>
                </div>
            </VisibleModal>
        }
        else return <VisibleModal className="">
            <div className="modal-body--scan-details">
                {this.renderHeader()}
                <div className="trigger-modal__body trigger-modal__body--security-scan">
                    {this.renderScannedObjectInfo()}
                    {this.renderTable()}
                </div>
            </div>
        </VisibleModal >
    }
}