import React, { Component } from 'react'


export default function GitProvider({ ...props }) {

    return (
        <section className="git-page">
            <h2 className="form__title">Host URL</h2>
            <h5 className="form__subtitle">Host URL is the domain address at which your devtron dashboard can be reached. &nbsp; </h5>
            <div className="white-wrapper">
                <div className="sso__description">
                    <div>
                       <div>Host URL is the domain address at which your devtron dashboard can be reached.</div>
                       <div>It is used to reach your devtron dashboard from external sources like configured webhooks, e-mail or slack notifications, grafana dashboard, etc.</div>
                </div>
                </div>
             </div>
        </section>
    )
}
