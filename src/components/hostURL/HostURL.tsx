import React, { Component } from 'react'


export default function GitProvider({ ...props }) {

    return (
        <section className="git-page">
            <h2 className="form__title">Git accounts</h2>
            <h5 className="form__subtitle">Manage your organization’s git accounts. &nbsp;
            <a className="learn-more__href" href={`https://docs.devtron.ai/global-configurations/git-accounts`} rel="noopener noreferrer" target="_blank">
                    Learn more about git accounts
            </a>
            </h5>
        </section>
    )
}
