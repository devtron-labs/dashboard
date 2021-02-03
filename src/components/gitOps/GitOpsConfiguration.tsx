import React, { Component } from "react";
import { ViewType } from '../../config'

export default class GitOpsConfiguration extends Component{
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            lastActiveSSO: undefined,
            saveLoading: false,
            showToggling: false,
            ssoConfig: undefined,
        }
    }
    render(){
        return <section className="git-page">
            <h2 className="form__title"></h2>
            <h5 className="form__subtitle">&nbsp;
            </h5>
            <div className="login__sso-wrapper">
                <div className="login__sso-flex">
                    </div>
                 </div>       
             </section >
    
    }
        
}