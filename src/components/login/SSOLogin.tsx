import React, { useState } from 'react'
import './login.css'
export default function SSOLogin() {
    

    return (
        <section className="git-page">
            <h2 className="form__title">SSO Login Services</h2>
            <h5 className="form__subtitle">Configure and manage login service for your organization. &nbsp;
            <a href={`https://docs.devtron.ai/global-configurations/git-accounts`} rel="noopener noreferrer" target="_blank">
                    Learn more 
            </a>
            </h5>
              <div className= "login__sso-wrapper">
                <div className= "login__title ">Add login service</div>
                    <div className="login__sso-flex">
                            <div className="mr-16 ">
                                    <label className="tertiary-tab__radio sso-icons">
                                        <input type="radio" name="status"  />
                                        <span className="tertiary-tab sso-icons">Aggregate</span>
                                    </label>
                                    <label className="tertiary-tab__radio ">
                                        <input type="radio" name="status"  />
                                        <span className="tertiary-tab sso-icons">Per Pod</span>
                                    </label>
                             </div>
                        </div>
                    <div className="login__description">
                        <div className="login__link flex">
                             <div>Help: See documentation for </div>  <a href="" className=""> Authentication Through Google</a>
                        </div>
                    </div>
                    
             </div>
          { /* {[{ id: null, name: "", active: true, url: "", authMode: null }].concat(result && Array.isArray(result.result) ? result.result : []).sort((a, b) => a.name.localeCompare(b.name)).map(git => <CollapsedList {...git} key={git.id || Math.random().toString(36).substr(2, 5)} reload={reload} />)}*/}
        </section>
    )
}
