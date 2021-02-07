import React, { Component } from "react";
import { ViewType } from '../../config'
import '../login/login.css'
import './gitops.css';
import  { GitOpsState, GitOpsProps } from './gitops.type'
import {  CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ConfirmationDialog } from '../common'
import warn from '../../assets/icons/ic-warning.svg';
import { getGitOpsConfigurationList } from './service'
import { showError } from '../common';

 const SwitchGitItemValues = {
    GitLab: 'Gitlab.com',
    Github: 'Github.com',
   
};

export default class GitOpsConfiguration extends Component<GitOpsProps,GitOpsState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            gitList: [],
            githost: SwitchGitItemValues.GitLab,
            git: "",
            showToggling: false,
            
        }
        this.handleGitHost= this.handleGitHost.bind(this);
        this.handleOnChange= this.handleOnChange.bind(this);
    }

    componentDidMount() {
        getGitOpsConfigurationList().then((response) => {
          this.setState({ 
                gitList : response[0].result, 
                view: ViewType.FORM, 
             }
            ,()=>console.log(response[0].result));
        }).catch((error) => {
          showError(error);
        })
        
    }

    handleGitHost(event){
       let newGitOps= event.target.value
       console.log(newGitOps)
       this.setState({
           githost: newGitOps
       })
    }

    handleOnChange(){

    }

    customHandleChange(){

    }

    onLoginConfigSave(){
      this.toggleWarningModal()
    }

    toggleWarningModal(): void {
        this.setState({ showToggling: !this.state.showToggling });
    }

    render() {
        return <section className="git-page">
            <h2 className="form__title">GitOps configuration</h2>
            <h5 className="form__subtitle">Devtron uses Gitops&nbsp; </h5>
            <div className="gitops login__sso-wrapper  pr-20">
                    <div className="login__sso-flex">
                          <div>
                                <label className="tertiary-tab__radio ">
                                    <input type="radio" name="status" value="gitlab" checked={this.state.githost === "gitlab"} onClick={this.handleGitHost} />
                                    <span className="tertiary-tab sso-icons">
                                        <aside className="login__icon-alignment"><GitLab/></aside>
                                        <aside className="login__text-alignment"> GitLab</aside>
                                    </span>
                                </label>
                         </div>
                         <div>
                                <label className="tertiary-tab__radio ">
                                    <input type="radio" name="status" value="github" checked={this.state.githost === "github"} onClick={this.handleGitHost} />
                                    <span className="tertiary-tab sso-icons">
                                        <aside className="login__icon-alignment"><GitHub /></aside>
                                        <aside className="login__text-alignment"> GitHub</aside>
                                    </span>
                                </label>
                         </div>
                    </div>
                   <div className="flex column left top  pl-20">
                        <div className="gitops__id pb-6">Git host*</div> 
                        <input value={this.state.githost} type="text" name= "Git Host*" className="form__input" onChange={e => { e.persist(); this.handleOnChange() }} />
                    </div>
                    <div className="flex column left top pt-16 pl-20 pb-6">
                         <div className="gitops__id ">GitLab organisation ID*</div>
                         <input value={this.state.gitList.map((e)=>e.gitLabGroupId)} type="text" name= "Git Host*" className="form__input" onChange={e => { e.persist(); this.handleOnChange() }} />
                    </div>
                    <div className="pl-20"><hr/></div>
                    <div className="gitops__access  pl-20 ">Git access credentials</div>
                    <form  className="  pl-20 pr-20">
                    <div className=" form__row--two-third pt-16 gitops__id ">
                        <CustomInput value={this.state.gitList.map((e)=>e.username)} onChange={this.customHandleChange} name="Enter username" error={Error} label="GitLab username*" labelClassName="gitops__id" />
                        <ProtectedInput value={this.state.gitList.map((e)=>e.token)} onChange={this.customHandleChange} name="Enter token" error={Error} label="GitLab token*" labelClassName="gitops__id"/>
                   </div>
                   <div className="form__buttons mr-24">
                    <button onClick={(e) => { e.preventDefault(); this.onLoginConfigSave() }} tabIndex={5} type="submit" className={`cta`}> Save</button>
                </div>
                </form>
            </div>
            {this.state.showToggling ? <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warn} />
                <div className="modal__title sso__warn-title">GitOps configuration required</div>
                <p className="modal__description sso__warn-description">GitOps configuration is required to perform this action. Please configure GitOps and try again.</p><ConfirmationDialog.ButtonGroup>
                    <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={this.toggleWarningModal}>Cancel</button>
                    <button type="submit" className="cta  sso__warn-button" >Confirm</button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>: ''
            }        </section >

    }

}