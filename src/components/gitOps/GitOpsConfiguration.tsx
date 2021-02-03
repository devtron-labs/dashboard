import React, { Component } from "react";
import { ViewType } from '../../config'
import '../login/login.css'
import './gitops.css';
import { List, CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'

export default class GitOpsConfiguration extends Component<{}> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            githost:"",
        }
    }
    render() {
        return <section className="git-page">
            <h2 className="form__title">GitOps configuration</h2>
            <h5 className="form__subtitle">Devtron uses Gitops&nbsp;
            </h5>
            <div className="gitops login__sso-wrapper pt-20 pl-20">
                
                   <div className="gitops__id">Git host*</div> 
              {/* <CustomInput autoComplete="off" value={this.state.githost}  onChange={handleOnChange} name="name" error={state.name.error} label="Name*"  />*/}

                   <div className="gitops__id">GitLab organisation ID*</div>
                   <div>Git access credentials</div>
                   <div className="gitops__id">GitLab username*</div>
                   <div className="gitops__id">GitLab token*</div>
                
            </div>
        </section >

    }

}