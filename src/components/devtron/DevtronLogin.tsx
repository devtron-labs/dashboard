import React, { Component } from 'react';
import { LoginValidation } from './formValidator';
import { post } from '../../services/api';
import { ServerErrors } from '../../modals/commonTypes';
import { FullRoutes, URLS } from '../../config';
import { DevtronLoginProps, DevtronLoginState } from './types';
import dt from '../../assets/icons/logo/logo-dt.svg';
import { toast } from 'react-toastify'
import './login-dt.css';
import { Progressing, showError } from '../common'
import google from 'patternfly/dist/img/google-logo.svg';
import LoginIcons from '../../assets/icons/logoicons.svg'

const loginList=[
    {
        id: "gmail",
        label: "Login with Google",
        iconClass: "login-google",
        isidShown: false,
    },
    {
        id: "github",
        label: "Login with Github",
        iconClass: "login-github",
        isidShown: false,
    },
    {
        id: "microsoft",
        label: "Login with Microsoft",
        iconClass: "login-microsoft",
        isidShown: false,
    } ,
    {
         id: "openid",
         label: "Login with OpenId Connect",
         iconClass: "login-openid-connect",
         isidShown: false,
    },
    {
        id: "openshift",
        label: "Login with OpenShift",
        iconClass: "login-openshift",
        isidShown: false,
   },
   {
        id: "ldap",
        label: "Login with LDAP",
        iconClass: "login-openshift",
        isidShown: false,
},
]

export default class DevtronLogin extends Component<DevtronLoginProps, DevtronLoginState> {
    validationRules;

    constructor(props) {
        super(props);

        this.state = {
            continueUrl: ""
            
        }
        this.validationRules = new LoginValidation();
       
    }

    componentDidMount() {
       
        const currentPath = window.location.href
        let cont = ""
        if (currentPath.includes('-dt')) {
            cont = currentPath.split('-dt')[1]
            toast.error('Please login again');
        }

       this.setState({
        continueUrl: encodeURI(`${process.env.PUBLIC_URL}${cont}`)})
    }
    
   

    render() {
        return (
            <div className="login">
            <div className="login__bg"><div className="login__image" /></div>
            <div className="login__section">
                <div className="login__control">
                    <img src={dt} alt="login" className="login__dt-logo" width="170px" height="120px" />
                    <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>

                    {loginList.map((item,index)=>{
                       if(item.isidShown=true){
                             return <a href={`/orchestrator/auth/login?return_url=${this.state.continueUrl}`} className="login__google flex">
                                                    <div className="google-icon"><svg className="icon-dim-24"  viewBox="0 0 24 24"><use href={`${LoginIcons}#${item.iconClass}`}></use></svg></div>
                                                    <div>{item.label}</div>
                                     </a> 
                       }
                                            
                    })}
                    <a className="login__link" href={`${window.location.origin}/login?continue=/`}>Login as administrator</a>
                </div>
            </div>
        </div>
        )
    }

}
