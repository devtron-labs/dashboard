import React, { Component } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { VisibleModal } from '../../common';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';

export interface WhatsNewModalState {
    versions: any[];
    selectedVersion: string;
}

export interface WhatsNewModalProps {
    close: () => void;
}

export default class WhatsNewModal extends Component<WhatsNewModalProps, WhatsNewModalState> {

    constructor(props) {
        super(props);
        this.state = {
            selectedVersion: "",
            versions: [{ name: "v1.9.0", metadata: {} }],
        }
    }

    componentDidMount() {

    }

    render() {
        return <VisibleModal className="">
            <div className="bcn-0 br-8 modal__body modal__body--p-0 w-800-px">
                <div className="pt-16 pb-16 pl-20 pr-20 flexbox flex-justify">
                    <p className="fw-6 fs-20">What's new</p>
                    <button type="button" className="transparent" onClick={this.props.close}>
                        <Close className="icon-dim-20" />
                    </button>
                </div>
                <div className="bcb-1 pl-20 pr-20 version-info">
                    <span className="mt-10 mb-10">
                        <Info className="icon-dim-20" />
                    </span>
                    <p className="m-0 pt-10 pb-10">
                        <span className="fw-6">Customers: </span><span>mail us</span> to request latest version.&nbsp;
                        <span className="fw-6">Open source users: </span><a href="">click here to see how to upgrade.</a>
                    </p>
                </div>
                <div className="flexbox whats-new-modal">
                    <div className="whats-new-modal__left pt-8 pb-8 pl-20 pr-20">
                        {this.state.versions.map((ver) => {
                            return <p className="m-0" onClick={() => { this.setState({ selectedVersion: ver.name }) }}>{ver.name}</p>
                        })}
                    </div>
                    <div className="w-100 pl-20 pr-20 pt-8 pb-8">
                        Right
                    </div>
                </div>
            </div>
        </VisibleModal>
    }
}