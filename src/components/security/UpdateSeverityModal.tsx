import React, { Component } from 'react';
import { VisibleModal } from '../common';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { VulnerabilityAction, Severity } from './security.types';
import { styles, DropdownIndicator } from './security.util';
import ReactSelect from 'react-select';

export interface UpdateSeverityModalProps {
    name: string;
    severity: Severity;
    close: () => void;
    saveSeverity: (severity, policy: VulnerabilityAction) => void;
}

export interface UpdateSeverityModalState {
    policy: { label: string, value: VulnerabilityAction };
}

export class UpdateSeverityModal extends Component<UpdateSeverityModalProps, UpdateSeverityModalState>{

    constructor(props) {
        super(props);
        this.state = {
            policy: { label: "ALLOW", value: "allow" }
        }
        this.handleChangeSeverity = this.handleChangeSeverity.bind(this);
    }

    componentDidMount() {

    }

    handleChangeSeverity(selected): void {
        this.setState({ policy: selected })
    }

    renderHeader() {
        return <div className="modal__header ml-24 mr-24">
            <h1 className="modal__title">
                Security Policy / {this.props.name}
            </h1>
            <button type="button" className="transparent " onClick={this.props.close}>
                <Close className="icon-dim-20" />
            </button>
        </div>
    }

    render() {
        return <VisibleModal className="">
            <div className={`modal__body modal__body--w-600 modal__body--no-padding`}>
                {this.renderHeader()}
                <form className="whitelist-cve ml-24 mr-24" onSubmit={(event) => { event.preventDefault() }}>
                    <ReactSelect className="w-100"
                        autoFocus
                        value={this.state.policy}
                        components={{
                            DropdownIndicator
                        }}
                        // placeholder={`${severity.policy.inherited && !severity.policy.isOverriden ? 'INHERITED' : severity.policy.action}`}
                        styles={{
                            ...styles
                        }}
                        onChange={this.handleChangeSeverity}
                        options={[{ label: "BLOCK", value: "block" }, { label: "ALLOW", value: "allow" }, { label: "INHERIT", value: "inherit" }]} />
                    <div className="flex right form-row mt-24">
                        <button type="button" tabIndex={1} className="cta cancel mb-16 mr-16" onClick={this.props.close}>Cancel</button>
                        <button type="submit" tabIndex={2} className="cta mb-16" onClick={(event) => { this.props.saveSeverity(this.props.severity, this.state.policy.value); }}>Save</button>
                    </div>
                </form>
            </div>
        </VisibleModal>
    }
}