import React, { Component } from 'react';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';

interface GitConfigModalProps {
    closeGitConfigModal: (event) => void;
    hostListOption: {value:number, label:string}[]
    onSaveGitProviderName:  void
}

interface GitConfigModalState {
    filterInput: string;
}

export class GitProviderConfigModal extends Component<GitConfigModalProps, GitConfigModalState> {
    constructor(props) {
        super(props)
        this.state = ({
            filterInput: ""
        })
    }

    handleFilterInput =(event): void  => {
        this.setState({
            filterInput: event.target.value,
        });
    }

    render() {
        return (<div className=" modal__body modal__body--p-0 ">
            <div className="modal__header pt-20 pl-20 pr-20 ">
                <h1 className=" modal__title__fs-16 fs-16 fw-6 cn-9">Add git provider</h1>
                <button type="button" className="transparent p-0" onClick={this.props.closeGitConfigModal} >
                    <Close className="icon-dim-20" />
                </button>
            </div>
            <div className="pb-6 pl-20 pr-20">Git provider name <span className="cr-5">*</span></div>
            <div className="pb-40 pl-20 pr-20">
                <input className="form__input " type="text" name="app-name"
                    value={this.state.filterInput} 
                    onChange={this.handleFilterInput}
                    // onBlur={(event) => this.isValid(event, 'configName')}
                    placeholder="Enter name" autoFocus={true} tabIndex={1} />
            </div>
            <div className="flex right pt-12 pb-12 pl-20 pr-20">
                <button type="button" className="cta cancel mr-16" tabIndex={5} onClick={this.props.closeGitConfigModal}
                >Cancel
                    </button>
                <button type="submit" className="cta" tabIndex={4}
                 onClick={()=>this.props.onSaveGitProviderName}
                >Save
                        {/* {this.state.form.isLoading ? <Progressing /> : "Save"} */}
                </button>
            </div>
        </div>)
    }
}