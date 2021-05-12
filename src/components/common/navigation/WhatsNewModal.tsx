import React, { Component } from 'react';
import { VisibleModal, MarkDown } from '../../common';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import { getReleases } from './navigation.service';

export interface WhatsNewModalState {
    selected: any;
    releases: any[];
}

export interface WhatsNewModalProps {
    currentVersion: string;
    latestVersion: string;
    close: () => void;
}

export class WhatsNewModal extends Component<WhatsNewModalProps, WhatsNewModalState> {

    constructor(props) {
        super(props);
        this.state = {
            selected: 0,
            releases: [],
        }
    }

    componentDidMount() {
        getReleases().then((response) => {
            this.setState({
                releases: response,
                selected: response[0],
            });
        })
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
                        <span className="fw-6">Customers: </span>
                        <a className="cursor cb-5 mr-5" href="mailto:support@devtron.ai?subject=Request for latest version" target="_blank">mail us</a>
                        to request latest version.&nbsp;
                        {/* <span className="fw-6">Open source users: </span><a href="">click here to see how to upgrade.</a> */}
                    </p>
                </div>
                <div className="flexbox whats-new-modal">
                    <div className="whats-new-modal__left pt-8 pb-8 pl-20 pr-20">
                        {this.state.releases.map((release) => {
                            let isLatest = this.props.latestVersion === this.props.currentVersion;
                            let classes = '';
                            if (release.tag_name === this.state.selected.tag_name) classes = 'm-0 pt-8 pb-8 cursor cb-5';
                            else classes = 'm-0 pt-8 pb-8 cursor';
                            return <p className={classes} onClick={() => { this.setState({ selected: release }) }}>
                                {release.tag_name}
                                {this.props.latestVersion === release.tag_name ? " (Latest)" : ""}
                                {!isLatest && this.props.currentVersion === release.tag_name ? " (Current)" : ""}
                            </p>
                        })}
                    </div>
                    <div className="whats-new-modal__right w-100 pl-20 pr-20 pt-8 pb-8">
                        <MarkDown markdown={this.state.selected.body} className="whats-new-modal__release" />
                    </div>
                </div>
            </div>
        </VisibleModal>
    }
}