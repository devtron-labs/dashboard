import React, { Component } from 'react';
import { VisibleModal, showError, Progressing } from '../common';
import { getCVEPolicies } from './security.service';
import { ViewType } from '../../config';
import { VulnerabilityAction } from './security.types';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline.svg';

export interface AddCveModalProps {
    close: () => void;
    saveCVE: (cve: string, policy: VulnerabilityAction) => void;
}

export interface AddCveModalState {
    view: string;
    cve: string;
    cveError: boolean;
    policy: VulnerabilityAction;
    clusters: {
        name: string;
        policy: VulnerabilityAction;
        isCollapsed: boolean;
        environments: [{
            name: string;
            isCollapsed: boolean;
            policy: VulnerabilityAction;
            applications: {
                name: string;
                policy: VulnerabilityAction;

            }[];
        }]
    }[];
}

export class AddCveModal extends Component<AddCveModalProps, AddCveModalState>{

    _inputRef;

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.FORM,
            cve: "",
            policy: "allow",
            cveError: false,
            clusters: [],
        }
        this.handleCveChange = this.handleCveChange.bind(this);
        this.handlePolicyChange = this.handlePolicyChange.bind(this);
        this.searchCVE = this.searchCVE.bind(this);
    }

    componentDidMount() {
        if (this._inputRef) {
            this._inputRef.focus();
        }
    }

    handleCveChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ cve: event.target.value });
    }

    handlePolicyChange(event) {
        this.setState({ policy: event.target.value });
    }

    saveCVE() {
        let regex = new RegExp(/^CVE-\d{4}-\d{4,7}/);
        let cve = this.state.cve.toUpperCase();
        if (regex.test(cve)) {
            this.props.saveCVE(this.state.cve, this.state.policy);
        }
        else {
            this.setState({ cveError: true });
        }
    }
    searchCVE(event): void {
        this.setState({ view: ViewType.LOADING });
        getCVEPolicies(this.state.cve).then((response) => {
            this.setState({
                cve: this.state.cve,
                clusters: response.result.clusters,
                view: ViewType.FORM
            });
        }).catch((error) => {
            showError(error);
        })
    }

    renderHeader() {
        return <div className="modal__header ml-24 mr-24">
            <h1 className="modal__title">Add CVE</h1>
            <button type="button" className="transparent " onClick={this.props.close}>
                <Close className="icon-dim-20" />
            </button>
        </div>
    }

    renderList() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="whitelist-cve__empty-state flex column" >
                <Progressing pageLoader />
            </div>
        }
        else if (this.state.clusters.length) {
            return <div className="ml-24 mr-24">
                <h3 className="whitelist-cve__section-name">This CVE policy is overriden at below levels</h3>
                <ul className="whitelist-cve__nested-list nested-list">
                    {this.state.clusters.map((cluster) => {
                        return <li key={cluster.name} className="">
                            <p className="nested-list__item flexbox flex-justify">
                                <span>cluster/{cluster.name}</span>
                                <span >{cluster.policy}</span>
                            </p>
                            {cluster.isCollapsed ? null : <ul className="nested-list">
                                {cluster.environments.map((env) => {
                                    return <li key={env.name} className="nested-list__pl">
                                        <p className="nested-list__item flexbox flex-justify">
                                            <span>env/{env.name}</span>
                                            <span>{env.policy}</span>
                                        </p>
                                        {env.isCollapsed ? null : <ul>
                                            {env.applications.map((app) => {
                                                return <li key={env.name} className="nested-list__pl">
                                                    <p className="nested-list__item flexbox flex-justify">
                                                        <span>app/{app.name}</span>
                                                        <span>{app.policy}</span>
                                                    </p>
                                                </li>
                                            })}
                                        </ul>}
                                    </li>
                                })}
                            </ul>}
                        </li>
                    })}
                </ul>
            </div>
        }
        else {
            return <div className="ml-24 mr-24">
                <div className="whitelist-cve__empty-state flex column" >
                    <Info className="icon-dim-32 mb-8" />
                    <p className="whitelist-cve__empty-state-text">Search CVE-ID to view configured CVE policies</p>
                </div>
            </div>
        }
    }

    render() {
        return <VisibleModal className="">
            <div className={`modal__body modal__body--w-600 modal__body--no-padding`}>
                {this.renderHeader()}
                <form className="whitelist-cve" onSubmit={(event) => { event.preventDefault() }}>
                    <div className="whitelist-cve__cve-id ml-24 mr-24 mb-20">
                        <label className="block flex-1 mb-5 mr-16 ">
                            <span className="form__label">CVE ID</span>
                            <input autoComplete="off" ref={node => this._inputRef = node} type="text" className="form__input" autoFocus tabIndex={1} placeholder="Enter CVE ID" value={this.state.cve} onChange={this.handleCveChange} />
                            <span className="form__error">
                                {this.state.cveError ? <><Error className="form__icon form__icon--error" /> CVE ID not found <br /></>
                                    : null}
                            </span>
                        </label>
                        {/* <button type="submit" className="cta mb-5" tabIndex={2} onClick={this.searchCVE}>Search</button> */}
                    </div>
                    <div className="ml-24 mr-24 flexbox" tabIndex={2}>
                        <label className="form__label form__label--flex cursor mr-8">
                            <input type="radio" name="policy" value="allow" tabIndex={1} onClick={this.handlePolicyChange} checked={this.state.policy === "allow"} /> <span className="ml-10 mr-5">Allow</span>
                        </label>
                        <label className="form__label form__label--flex cursor ml-10">
                            <input type="radio" name="policy" value="block" tabIndex={2} onClick={this.handlePolicyChange} checked={this.state.policy === "block"} /><span className="ml-10 mr-5">Block</span>
                        </label>
                    </div>
                    {/* <hr className="mt-10 mb-20"></hr>
                    {this.renderList()}
                    <hr className="mt-6 mb-16"></hr> */}
                    <div className="flex right form-row">
                        <button type="button" tabIndex={3} className="cta cancel mb-16 mr-16" onClick={this.props.close}>Cancel</button>
                        <button type="submit" tabIndex={4} className="cta mb-16 mr-24" onClick={(event) => { this.saveCVE() }}>Save</button>
                    </div>
                </form>
            </div>
        </VisibleModal>
    }
}