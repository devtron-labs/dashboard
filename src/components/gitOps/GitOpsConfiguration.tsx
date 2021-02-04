import React, { Component } from "react";
import { ViewType } from '../../config'
import '../login/login.css'
import './gitops.css';
import  {GitOpsState, GitOpsProps} from './gitops.type'
import { List, CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'



 const SwitchGitItemValues = {
    GitLab: 'gitlab',
    Github: 'github',
   
};

export default class GitOpsConfiguration extends Component<GitOpsProps,GitOpsState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            githost: SwitchGitItemValues.GitLab,
            git: '',
            customGitOpsState: {
                password: { value: "password", error: '' }, 
                username: { value: "userName", error: '' },
            }
        }
        this.handleGitHost= this.handleGitHost.bind(this);
        this.handleOnChange= this.handleOnChange.bind(this);
    }

    handleGitHost(event){
       let newGitOps= event.target.value
       console.log(newGitOps)
       
    }

    handleOnChange(){

    }

    customHandleChange(){

    }

    render() {
        return <section className="git-page">
            <h2 className="form__title">GitOps configuration</h2>
            <h5 className="form__subtitle">Devtron uses Gitops&nbsp;
            </h5>
            <div className="gitops login__sso-wrapper  pr-20">
                    <div className="login__sso-flex">
                          <div>
                                <label className="tertiary-tab__radio ">
                                    <input type="radio" name="status" value="gitlab" checked={this.state.githost === "gitlab"} onClick={this.handleGitHost} />
                                    <span className="tertiary-tab sso-icons">
                                        <aside className="login__icon-alignment"><GitLab/></aside>
                                        <aside className="login__text-alignment"> GitLab</aside>
                                        <label>
                                        </label>
                                    </span>
                                </label>
                         </div>
                         <div>
                                <label className="tertiary-tab__radio ">
                                    <input type="radio" name="status" value="github" checked={this.state.githost === "github"} onClick={this.handleGitHost} />
                                    <span className="tertiary-tab sso-icons">
                                        <aside className="login__icon-alignment"><GitHub /></aside>
                                        <aside className="login__text-alignment"> GitHub</aside>
                                        <label>
                                        </label>
                                    </span>
                                </label>
                         </div>
                    </div>
                   <div className="gitops__id  pl-20">Git host*</div> 
                   <div className="flex column left top  pl-20">
                      <label className="form__label"></label>
                        <input type="text" name= "Git Host*" className="form__input" onChange={e => { e.persist(); this.handleOnChange() }} />
                    </div>
                   <div className="gitops__id  pl-20">GitLab organisation ID*</div>
                   <div className="flex column left top  pl-20">
                      <label className="form__label"></label>
                        <input type="text" name= "Git Host*" className="form__input" onChange={e => { e.persist(); this.handleOnChange() }} />
                    </div>
                   <div className="gitops__caccess  pl-20">Git access credentials</div>
                   <form  className="git-form">
                     <div className="form__row form__row--two-third">
                   <CustomInput value={this.state.customGitOpsState.username.value} onChange={this.customHandleChange} name="username" error={Error} label="GitLab username*" />
                <ProtectedInput value={this.state.customGitOpsState.username.value} onChange={this.customHandleChange} name="password" error={Error} label="GitLab token*" />
                   </div>
                </form>
            </div>
        </section >

    }

}