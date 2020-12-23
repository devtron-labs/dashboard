import React, { useState } from 'react'
import './login.css'
import { Progressing, useForm, showError } from '../common'
import Google from '../../assets/icons/ic-google.svg'
import {ReactComponent as Help} from '../../assets/icons/ic-help-outline.svg'
import {ReactComponent as GitHub} from '../../assets/icons/git/github.svg'
import Microsoft from '../../assets/icons/ic-microsoft.svg'
import OIDC from '../../assets/icons/ic-oidc.svg'
import Openshift from '../../assets/icons/ic-openshift.svg'

const ssoConfig=[
    {name : "Google", id: "google"},
    {name : "GitHub", id: "github"},
    {name : "Microsoft", id: "microsoft"},
    {name : "LDAP", id: "google"},
    {name : "SAML  2.0", id: "google"},
    {name : "OIDC", id: "google"},
    {name : "OpenShift", id: "google"},
]

export default function SSOLogin() {
    const [loading, setLoading] = useState(false)
   

    return (
        <section className="git-page">
            <h2 className="form__title">SSO Login Services</h2>
            <h5 className="form__subtitle">Configure and manage login service for your organization. &nbsp;
            <a href={`https://docs.devtron.ai/global-configurations/git-accounts`} rel="noopener noreferrer" target="_blank">
                    Learn more 
            </a>
            </h5>
              <div className= "login__sso-wrapper">
                    <div className="login__sso-flex">
                            <div >
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" id="1" value="1" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><img src={Google}/></aside>  
                                                    <aside className="login__text-alignment"> Google</aside>
                                             </span>
                                    </label>
                             </div>
                             <div >
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><a href=""><GitHub/></a></aside>  
                                                    <aside className="login__text-alignment"> GitHub</aside>
                                             </span>
                                    </label>
                            </div>
                            <div>
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><img src={Microsoft}/></aside>  
                                                    <aside className="login__text-alignment"> Microsoft</aside>
                                             </span>
                                    </label>
                             </div>
                             <div>
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><img src={Google}/></aside>  
                                                    <aside className="login__text-alignment">LDAP</aside>
                                             </span>
                                    </label>
                             </div>
                             <div>
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><img src={Google}/></aside>  
                                                    <aside className="login__text-alignment"> SAML 2.0</aside>
                                             </span>
                                    </label>
                             </div>
                             <div>
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><img src={OIDC}/></aside>  
                                                    <aside className="login__text-alignment">OIDC</aside>
                                             </span>
                                    </label>
                             </div>
                             <div>
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                            <span className="tertiary-tab sso-icons">
                                                    <aside className="login__icon-alignment"><img src={Openshift}/></aside>  
                                                    <aside className="login__text-alignment"> OpenShift</aside>
                                             </span>
                                    </label>
                             </div>
                        </div>
                    <div className="login__description">
                        <div className="login__link flex">
                                <Help className="icon-dim-20 ml-8 vertical-align-middle mr-5"/>
                                <div>Help: See documentation for <a rel="noreferrer noopener" href="https://dexidp.io/docs/connectors/google/" target="_blank" className="login__auth-link "> Authentication Through 
                                        {/*{ssoConfig.map((item)=>{
                                            return  {item}
                                            })}*/}
                                    </a> 
                                </div>
                        </div>
                    </div>
                    <div className="form__buttons mr-24">
                    <button tabIndex={5} type="button" className={`cta`}>Save</button>
                </div>
                    
             </div>
        </section>
    )
}
