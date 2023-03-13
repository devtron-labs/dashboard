import React, { Fragment, useContext } from 'react'
import ReactGA from 'react-ga4'
import { NavLink } from 'react-router-dom'
import { SliderButton } from '@typeform/embed-react'
import { DOCUMENTATION, URLS } from '../../../config'
import { InstallationType } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Discord } from '../../../assets/icons/ic-discord-fill.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as EditFile } from '../../../assets/icons/ic-edit-file.svg'
import { ReactComponent as Files } from '../../../assets/icons/ic-files.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as GettingStartedIcon } from '../../../assets/icons/ic-onboarding.svg'
import { ReactComponent as Feedback } from '../../../assets/icons/ic-feedback.svg'
import { HelpNavType, HelpOptionType } from './header.type'
import { mainContext } from '../navigation/NavigationRoutes'
import { stopPropagation } from '../helpers/Helpers'

function HelpNav({
    className,
    setShowHelpCard,
    serverInfo,
    fetchingServerInfo,
    setGettingStartedClicked,
    showHelpCard,
}: HelpNavType) {
    const { currentServerInfo } = useContext(mainContext)
    const isEnterprise = currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
    const FEEDBACK_FORM_ID = `UheGN3KJ#source=${window.location.hostname}`

    const CommonHelpOptions: HelpOptionType[] = [
        {
            name: 'View documentation',
            link: DOCUMENTATION.HOME_PAGE,
            icon: File,
            showSeparator: true,
        },
        
        {
            name: 'Join discord community',
            link: 'https://discord.devtron.ai/',
            icon: Discord,
            showSeparator: isEnterprise,
        },
        
    ]

    const EnterpriseHelpOptions: HelpOptionType[] = [
        
        {
            name: 'Open New Ticket',
            link: 'https://enterprise.devtron.ai/portal/en/newticket',
            icon: EditFile,
        },
        {
            name: 'View All Tickets',
            link: 'https://enterprise.devtron.ai/portal/en/myarea',
            icon: Files,
        },
        
    ]

    const NotEnterpriseHelpOptions: HelpOptionType[] = [
        
        {
            name: 'Chat with support',
            link: 'https://discord.devtron.ai/',
            icon: Chat,
            showSeparator: true,
        },
        
        {
            name: 'Raise an issue/request',
            link: 'https://github.com/devtron-labs/devtron/issues/new/choose',
            icon: EditFile,
        }
    ]

    const onClickGettingStarted = (): void => {
        setGettingStartedClicked(true)
    }

    const onClickHelpOptions = (option: HelpOptionType): void => {
        ReactGA.event({
            category: 'Help Nav',
            action: `${option.name} Clicked`,
        })
    }

    const toggleHelpCard = (): void => {
        setShowHelpCard(!showHelpCard)
    }

    const renderHelpFeedback = (): JSX.Element => {
        return (
            <div onClick={stopPropagation} className="help-card__option help-card__link flex left cn-9">
                <Feedback />
                <SliderButton
                    className="dc__transparent help-card__option-name ml-12 cn-9 fs-14"
                    id={FEEDBACK_FORM_ID}
                    onClose={toggleHelpCard}
                    autoClose={2000}
                >
                    Give feedback
                </SliderButton>
            </div>
        )
    }

    return (
        <div className="dc__transparent-div" onClick={toggleHelpCard}>
            <div className={`help-card pt-4 pb-4 ${className} ${isEnterprise ? `help-grid__feedback` : ''}`}>
                <NavLink
                    to={`/${URLS.GETTING_STARTED}`}
                    className="help-card__option dc__no-decor help-card__link flex left cn-9"
                    activeClassName="active"
                    onClick={onClickGettingStarted}
                >
                    <GettingStartedIcon />
                    <div className="help-card__option-name ml-12 cn-9 fs-14">Getting started</div>
                </NavLink>
                {isEnterprise && CommonHelpOptions.concat(EnterpriseHelpOptions).map((option,index) => {
                    return (
                        <Fragment key={option.name}>
                            <a
                                key={option.name}
                                className="dc__no-decor help-card__option help-card__link flex left cn-9"
                                href={option.link}
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={() => {
                                    onClickHelpOptions(option)
                                }}
                            >
                                <option.icon />
                                <div className="help-card__option-name ml-12 cn-9 fs-14">{option.name}</div>
                            </a>
                            {index===1 && <div className = "help__enterprise">Enterprise Support</div>}
                            {option.showSeparator && <div className="help-card__option-separator" />}
                        </Fragment>
                    )
                })}
                {isEnterprise && renderHelpFeedback()}
                {!isEnterprise && CommonHelpOptions.concat(NotEnterpriseHelpOptions).map((option,index) => {
                    return (
                        <Fragment key={option.name}>
                            <a
                                key={option.name}
                                className="dc__no-decor help-card__option help-card__link flex left cn-9"
                                href={option.link}
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={() => {
                                    onClickHelpOptions(option)
                                }}
                            >
                                <option.icon />
                                <div className="help-card__option-name ml-12 cn-9 fs-14">{option.name}</div>
                            </a>
                            {option.showSeparator && <div className="help-card__option-separator" />}
                        </Fragment>
                    )
                })}

                {serverInfo?.installationType === InstallationType.OSS_HELM && (
                    <div className="help-card__update-option fs-11 fw-6 mt-4">
                        {fetchingServerInfo ? (
                            <span className="dc__loading-dots">Checking current version</span>
                        ) : (
                            <span>version {serverInfo?.currentVersion || ''}</span>
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
