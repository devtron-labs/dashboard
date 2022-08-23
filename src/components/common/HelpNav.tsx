import React, { Fragment } from 'react'
import ReactGA from 'react-ga'
import { DOCUMENTATION, URLS } from '../../config'
import { ReactComponent as File } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as Discord } from '../../assets/icons/ic-discord-fill.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Chat } from '../../assets/icons/ic-chat-circle-dots.svg'
import { InstallationType, ServerInfo } from '../v2/devtronStackManager/DevtronStackManager.type'
import { NavLink } from 'react-router-dom'
import { ReactComponent as GettingStartedIcon } from '../../assets/icons/ic-onboarding.svg'

export interface HelpNavType {
    className: string
    showHelpCard: boolean
    setShowHelpCard: React.Dispatch<React.SetStateAction<boolean>>
    serverInfo: ServerInfo
    fetchingServerInfo: boolean
}

function HelpNav({ className, showHelpCard, setShowHelpCard, serverInfo, fetchingServerInfo }: HelpNavType) {
    const HelpOptions = [
        {
            name: 'View documentation',
            link: DOCUMENTATION.HOME_PAGE,
            icon: File,
            showSeparator: true,
        },
        {
            name: 'Chat with support',
            link: 'https://discord.devtron.ai/',
            icon: Chat,
            showSeparator: true,
        },
        {
            name: 'Join discord community',
            link: 'https://discord.devtron.ai/',
            icon: Discord,
            showSeparator: true,
        },
        {
            name: 'Raise an issue/request',
            link: 'https://github.com/devtron-labs/devtron/issues/new/choose',
            icon: Edit,
        },
    ]


    return (
        <div className="transparent-div" onClick={() => setShowHelpCard(!showHelpCard)}>
            <div className={`help-card pt-4 pb-4 ${className}`}>
                <div className="help-card__option" >
                    <NavLink to={`/`} className="no-decor help-card__link flex left cn-9" activeClassName="active" >
                        <GettingStartedIcon />
                        <div  className="help-card__option-name ml-12 cn-9 fs-14">Getting started</div>
                    </NavLink>
                </div>

                {HelpOptions.map((option) => {
                    return (
                        <Fragment key={option.name}>
                            <div className="help-card__option">
                                <a
                                    key={option.name}
                                    className="help-card__link flex left cn-9"
                                    href={option.link}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    onClick={(event) => {
                                        ReactGA.event({
                                            category: 'Main Navigation',
                                            action: `${option.name} Clicked`,
                                        })
                                    }}
                                >
                                    <option.icon />
                                    <div className="help-card__option-name ml-12 cn-9 fs-14">{option.name}</div>
                                </a>
                            </div>
                            {option.showSeparator && <div className="help-card__option-separator" />}
                        </Fragment>
                    )
                })}
                {serverInfo?.installationType === InstallationType.OSS_HELM && (
                    <div className="help-card__update-option fs-11 fw-6 mt-4">
                        {fetchingServerInfo ? (
                            <span className="loading-dots">Checking current version</span>
                        ) : (
                            <span>Devtron {serverInfo?.currentVersion || ''}</span>
                        )}
                        <br />
                        <NavLink to={URLS.STACK_MANAGER_ABOUT}>Check for Updates</NavLink>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HelpNav
