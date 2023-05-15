import React, { Component } from 'react';
import { DeploymentTable } from './DeploymentTable';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ViewType } from '../../../../config';
import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib';

export interface DeploymentTableModalProps {
    close: (event) => void;
    rows: any[];
}

export class DeploymentTableModal extends Component<DeploymentTableModalProps, {}>{
    constructor(props) {
        super(props);
        this.escFunction = this.escFunction.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction);
    }

    escFunction(event) {
        if (event.keyCode === 27) {
            this.props.close(event);
        }
    }

    render() {
        return <VisibleModal className="">
            <div className="modal__body" style={{ width: "820px" }}>
                <div className="modal__header">
                    <h1 className="modal__title">Deployments</h1>
                    <button type="button" className="dc__transparent" onClick={this.props.close}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <DeploymentTable rows={this.props.rows} deploymentTableView={ViewType.FORM} />
                <div style={{ marginBottom: "40px" }}></div>
            </div>
        </VisibleModal>
    }
}