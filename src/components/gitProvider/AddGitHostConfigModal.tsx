import React, { Component } from 'react';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { saveGitHost } from './gitProvider.service'
import { showError } from '@devtron-labs/devtron-fe-common-lib'

interface GitHostConfigModalProps {
    closeGitConfigModal: () => void;
    getHostList: () => void;

}

interface GitHostConfigModalState {
    name: string;
}


export class GitHostConfigModal extends Component<GitHostConfigModalProps, GitHostConfigModalState> {
    constructor(props) {
        super(props)
        this.state = ({
            name: ""
        })
    }

    onSaveGitProviderName = async () => {

        // let gitHostId = gitHost.value.value;
        let gitHostPayload = {
            name: this.state.name,
            active: true
        }
        try {
            const { result } = await saveGitHost(gitHostPayload);
            if (result) {
                this.props.getHostList();
                // gitHostId = result;
                this.props.closeGitConfigModal();
            }

        } catch (error) {
            showError(error)

        }
    }

    handleFilterInput = (event): void => {
        this.setState({
            name: event.target.value,
        });
    }

    render() {
        return (<div className=" modal__body modal__body--p-0 ">
            <div className="modal__header pt-20 pl-20 pr-20 ">
                <h1 className=" modal__title__fs-16 fs-16 fw-6 cn-9">Add git host</h1>
                <button type="button" className="dc__transparent p-0" onClick={this.props.closeGitConfigModal} >
                    <Close className="icon-dim-20" />
                </button>
            </div>
            <div className="pb-6 pl-20 pr-20 dc__required-field">Git host name </div>
            <div className="pb-40 pl-20 pr-20">
                <input className="form__input " type="text" name="app-name" autoComplete="off" value={this.state.name} onChange={this.handleFilterInput} placeholder="Enter name" autoFocus={true} tabIndex={1} />
            </div>
            <div className="flex right pt-12 pb-12 pl-20 pr-20">
                <button type="button" className="cta cancel mr-16" tabIndex={5} onClick={this.props.closeGitConfigModal} >Cancel</button>
                <button type="submit" className="cta" tabIndex={4} onClick={() => this.onSaveGitProviderName()}>Save</button>
            </div>
        </div>)
    }
}