import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { styles, portalStyles, DropdownIndicator } from './security.util';
import { VulnerabilityUIMetaData, GetVulnerabilityPolicyResponse, FetchPolicyQueryParams, SeverityPolicy, CvePolicy, VulnerabilityAction, Severity, ResourceLevel, VulnerabilityPolicy } from './security.types';
import { AddCveModal } from './AddCveModal';
import { ReactComponent as Arrow } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { getVulnerabilities, savePolicy, updatePolicy } from './security.service';
import { showError, Progressing } from '../common';
import { ViewType } from '../../config';
import { ReactComponent as Delete } from '../../assets/icons/ic-delete.svg'
import Reload from '../Reload/Reload';
import { NavLink } from 'react-router-dom';

export class SecurityPolicyEdit extends Component<FetchPolicyQueryParams, GetVulnerabilityPolicyResponse & { showWhitelistModal: boolean, view: string; }> {

    private vulnerabilityMetaData: VulnerabilityUIMetaData[] = [
        {
            className: "critical",
            title: "Critical Vulnerabilities",
            subTitle: "Exploitation is straightforward and usually results in system-level compromise."
        },
        {
            className: "moderate",
            title: "Moderate Vulnerabilities",
            subTitle: "Vulnerabilities exist but are not exploitable or require extra step such as social engineering."
        },
        {
            className: "low",
            title: "Low Vulnerabilities",
            subTitle: "Vulnerabilities are non-exploitable but would reduce your organization's attack surface."
        }
    ]

    private permissionText = {
        "block": "Blocked",
        "allow": "Allowed"
    }

    private actions = [
        { label: "block", value: "block" },
        { label: "allow", value: "allow" },
    ]

    constructor(props: FetchPolicyQueryParams) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            showWhitelistModal: false,
            result: {
                level: this.props.level,
                policies: []
            }
        }
        this.toggleAddCveModal = this.toggleAddCveModal.bind(this);
        this.updateSeverity = this.updateSeverity.bind(this);
        this.saveCVE = this.saveCVE.bind(this);
        this.updateCVE = this.updateCVE.bind(this);
    }

    componentDidMount() {
        this.fetchVulnerabilities(this.props.level, this.props.id);
    }

    private fetchVulnerabilities(level: string, id?: number): void {
        this.setState({ view: ViewType.LOADING });
        getVulnerabilities(this.props.level, this.props.id).then((response) => {
            this.setState({
                view: ViewType.FORM,
                result: response.result,
                showWhitelistModal: false,
            })
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    saveCVE(cveId: string, action, envId?: number): void {
        let payload = this.createCVEPayload(this.props.level, cveId, action, envId);
        savePolicy(payload).then((response) => {
            if (response.result) {
                this.fetchVulnerabilities(this.props.level, this.props.id);
            }
        }).catch(error => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    updateCVE(action: string, cve: CvePolicy, envId?: number): void {
        let payload = {};
        let promise;
        if (cve.policy.inherited) { //create 
            payload = this.createCVEPayload(this.props.level, cve.name, action, envId);
            promise = savePolicy(payload)
        }
        else {
            payload = {
                id: cve.id,
                action: action.toLowerCase()
            }
            promise = updatePolicy(payload);
        }

        promise.then((response) => {
            if (response.result) {
                this.fetchVulnerabilities(this.props.level, this.props.id);
            }
        }).catch(error => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    deleteCve(id: number): void {
        let payload = {
            id,
            action: 'inherit',
        }
        updatePolicy(payload).then((response) => {
            if (response.result) {
                this.fetchVulnerabilities(this.props.level, this.props.id);
            }
        }).catch(error => {
            this.setState({ view: ViewType.ERROR });
            showError(error);
        })
    }

    updateSeverity(action: VulnerabilityAction, policy: SeverityPolicy, envId?: number): void {
        let payload = {};
        let promise;

        if (action.toLowerCase() === "inherit") { //update
            payload = {
                id: policy.id,
                action: action.toLowerCase()
            }
            promise = updatePolicy(payload);
        }
        else if (policy.policy.inherited) { //Create if inherited from higher
            payload = this.createSeverityPayload(this.props.level, policy.severity, action, envId);
            promise = savePolicy(payload);
        }
        else {
            payload = {
                id: policy.id,
                action: action.toLowerCase()
            }
            promise = updatePolicy(payload);
        }
        promise.then((response) => {
            if (response.result) {
                this.fetchVulnerabilities(this.props.level, this.props.id);
            }
        }).catch(error => {
            showError(error);
        })
    }

    toggleCollapse(cardIndex: number): void {
        if (this.state.result.policies[cardIndex]) {
            let result = this.state.result;
            result.policies[cardIndex].isCollapsed = !result.policies[cardIndex].isCollapsed;
            this.setState({ result: result });
        }
    }

    toggleAddCveModal(): void {
        this.setState({ showWhitelistModal: !this.state.showWhitelistModal })
    }

    createCVEPayload(level: ResourceLevel, cveId: string, action: string, envId?: number): { action, cveId: string, appId?: number, envId?: number, clusterId?: number } {
        cveId = cveId.trim();
        switch (level) {
            case 'global': return {
                action: action.toLowerCase(),
                cveId: cveId.toUpperCase(),
            }
            case 'cluster': return {
                clusterId: this.props.id,
                action: action.toLowerCase(),
                cveId: cveId.toUpperCase(),
            }
            case 'environment': return {
                envId: this.props.id,
                action: action.toLowerCase(),
                cveId: cveId.toUpperCase(),
            }
            case 'application': return {
                appId: this.props.id,
                envId: envId,
                action: action.toLowerCase(),
                cveId: cveId.toUpperCase(),
            }
        }
    }

    createSeverityPayload(level: ResourceLevel, severity: Severity, action: VulnerabilityAction, envId?: number): { action, severity: Severity, appId?: number, envId?: number, clusterId?: number } {
        switch (level) {
            case 'global': return {
                action: action.toLowerCase(),
                severity,
            }
            case 'cluster': return {
                clusterId: this.props.id,
                action: action.toLowerCase(),
                severity,
            }
            case 'environment': return {
                envId: this.props.id,
                action: action.toLowerCase(),
                severity
            }
            case 'application': return {
                appId: this.props.id,
                envId: envId,
                action: action.toLowerCase(),
                severity,
            }
        }
    }

    private renderVulnerabilitiesCard(v: VulnerabilityPolicy, severities: SeverityPolicy[]) {
        let critical = severities.filter(s => s.severity === "critical")[0]
        let moderate = severities.filter(s => s.severity === "moderate")[0]
        let low = severities.filter(s => s.severity === "low")[0]
        return <>
            {this.renderVulnerability(this.vulnerabilityMetaData[0], v, critical)}
            {this.renderVulnerability(this.vulnerabilityMetaData[1], v, moderate)}
            {this.renderVulnerability(this.vulnerabilityMetaData[2], v, low)}
        </ >
    }

    private renderVulnerability(props: VulnerabilityUIMetaData, v: VulnerabilityPolicy, severity: SeverityPolicy) {
        let actions = this.actions;
        if (this.props.level !== "global") {
            actions = this.actions.concat({ label: "inherit", value: "inherit" });
        }
        let theAction = severity.policy.inherited && !severity.policy.isOverriden ? 'inherit' : severity.policy.action
        let permission = this.permissionText[severity.policy.action];
        return <div key={severity.id} className="vulnerability">
            <div className="flex-1">
                <h3 className={`vulnerability__title vulnerability__title--${props.className}`}>{props.title + " : " + permission}</h3>
                <p className="vulnerability__subtitle">{props.subTitle}</p>
            </div>
            <div className="vulnerability__menu">
                <ReactSelect value={{ 'label': theAction.toLowerCase(), 'value': theAction.toLowerCase() }}
                    onChange={(selected) => { this.updateSeverity((selected as any).value, severity, v.envId) }}
                    placeholder={`${severity.policy.inherited && !severity.policy.isOverriden ? 'INHERITED' : severity.policy.action}`}
                    components={{
                        DropdownIndicator
                    }}
                    styles={{
                        ...styles
                    }}
                    isSearchable={false}
                    options={actions} />
            </div>
        </div>
    }

    private renderPolicyList(cves: CvePolicy[], envId?: number) {
        return <>
            <div className="flexbox flex-justify mt-20">
                <div>
                    <h1 className="security-policy-card__title">CVE Policies</h1>
                    <p className="security-policy-card__subtitle">Block or allow specific Common Vulnerabilities and Exposures (CVEs) policies.
                     <a href={`https://cve.mitre.org/cve/search_cve_list.html`} rel="noopener noreferrer" target="_blank">Search CVE List</a></p>
                </div>
                <button type="button" className="cta small flex" onClick={() => this.toggleAddCveModal()}>
                    <Add className="icon-dim-16 mr-5" />Add CVE Policy
                </button>
            </div>
            <div className="security-policy__table mt-20">
                <table className="w-100">
                    <thead>
                        <tr>
                            <th className="security-policy__header-cell security-policy__cve-cell">CVE</th>
                            <th className="security-policy__header-cell security-policy__severity-cell">Severity</th>
                            <th className="security-policy__header-cell">Policy Last Defined</th>
                            <th className="security-policy__header-cell">Policy</th>
                            <th className="security-policy__header-cell"><span className="icon-dim-20"></span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cves.map((cve) => {
                            //inherited is created at parent level
                            return <tr key={cve.name} className="security-policy__table-row">
                                <td className="security-policy__data-cell security-policy__cve-cell cve-cell">
                                    <a href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve.name}`} rel="noopener noreferrer" target="_blank">
                                        {cve.name}
                                    </a>
                                </td>
                                <td className="security-policy__data-cell">
                                    <span className={`fill-${cve.severity.toLowerCase()}`}>
                                        {cve.severity}
                                    </span>
                                </td>
                                <td className="security-policy__data-cell security-policy__data-cell--policy">{cve.policyOrigin}</td>
                                <td className="security-policy__data-cell">
                                    <ReactSelect menuPortalTarget={document.getElementById('root')}
                                        closeMenuOnScroll={true}
                                        value={{ 'label': cve.policy.action.toLowerCase(), 'value': cve.policy.action.toLowerCase() }}
                                        onChange={(selected) => { this.updateCVE((selected as any).value, cve, envId) }}
                                        components={{
                                            DropdownIndicator
                                        }}
                                        styles={{
                                            ...styles,
                                            ...portalStyles,
                                        }}
                                        isSearchable={false}
                                        options={this.actions} />
                                </td>
                                <td className="security-policy__header-cell">
                                    {/* {!cve.policy.inherited && this.props.level === cve.policyOrigin ? <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="top"
                                        content="Delete Override">
                                        <Close className="icon-dim-20 align-right cursor" onClick={(event) => { this.deleteCve(cve.id) }} />
                                    </Tippy> :
                                     */}
                                    <Delete className={`icon-dim-20 align-right ${this.props.level === cve.policyOrigin ? 'cursor scn-4' : 'scn-2'}`}
                                        onClick={() => { if (this.props.level === cve.policyOrigin) this.deleteCve(cve.id) }} />
                                </td>
                            </tr>
                        }
                        )}
                    </tbody>
                </table>
            </div>
        </>
    }

    renderHeader() {
        switch (this.props.level) {
            case 'global': return <div className="ml-24 mr-24 mt-20 mb-20">
                <h1 className="form__title"> Global Security Policies</h1>
                <p className="form__subtitle">Security policies defined at global level will be applicable to all deployments unless overriden for specific clusters or environments.</p>
            </div>
            case 'cluster': return <div className="ml-24 mr-24 mt-20 mb-20">
                <h1 className="form__title">
                    <NavLink to={`/security/policies/clusters`}>Clusters</NavLink>
                    <span className="ml-5 mr-5">/</span>
                    {this.state.result?.policies[0].name}
                </h1>
            </div>
            case 'environment': return <div className="ml-24 mr-24 mt-20 mb-20">
                <h1 className="form__title">
                    <NavLink to={`/security/policies/environments`}>Environments</NavLink>
                    <span className="ml-5 mr-5">/</span>
                    {this.state.result?.policies[0].name}
                </h1>
            </div>
            case 'application': let i = this.state.result?.policies[0]?.name?.search('/');
                return <div className="ml-24 mr-24 mt-20 mb-20">
                    <h1 className="form__title">
                        <NavLink to={`/security/policies/apps`}>Applications</NavLink>
                        <span className="ml-5 mr-5">/</span>
                        {this.state.result?.policies[0]?.name.substring(0, i)}
                    </h1>
                </div>
        }
    }

    render() {
        if (this.state.view === ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view === ViewType.ERROR) return <Reload />;
        else {
            let isCollapsible = this.props.level === "application";
            return <>
                {this.renderHeader()}
                {this.state.result?.policies.map((v: VulnerabilityPolicy, cardIndex) => {
                    const showCardContent = isCollapsible ? !v.isCollapsed : true;
                    let envNameIndex = v?.name?.search('/');
                    return <div key={v.name} className="security-policy__card mb-20" >
                        <div className="flexbox flex-justify">
                            {isCollapsible ? <p className="security-polic__app-env-name">env{v?.name.substr(envNameIndex)}</p> : null}
                            {isCollapsible ? <Arrow className="icon-dim-24 cursor fwn-9 rotate"
                                style={{ ['--rotateBy' as any]: v.isCollapsed ? '0deg' : '180deg' }}
                                onClick={() => { this.toggleCollapse(cardIndex); }} /> : null}
                        </div>
                        {showCardContent ? <>
                            {isCollapsible ? <div className="mb-20"></div> : null}
                            {this.renderVulnerabilitiesCard(v, v.severities)}
                            {this.renderPolicyList(v.cves, v.envId)}
                        </> : null}
                    </div>
                })}
                {this.state.showWhitelistModal ? <AddCveModal saveCVE={this.saveCVE} close={this.toggleAddCveModal} /> : null}
            </>
        }
    }
}