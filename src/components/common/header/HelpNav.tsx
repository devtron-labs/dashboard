import React, { Fragment } from 'react'
import ReactGA from 'react-ga4'
import { NavLink } from 'react-router-dom'
import { SliderButton } from '@typeform/embed-react'
import { DOCUMENTATION, URLS } from '../../../config'
import { InstallationType } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { ReactComponent as GettingStartedIcon } from '../../../assets/icons/ic-onboarding.svg'
import { ReactComponent as Feedback } from '../../../assets/icons/ic-feedback.svg'
import { HelpNavType, HelpOptionType } from './header.type'
import { stopPropagation } from '../helpers/Helpers'
import { CommonHelpOptions, EnterpriseHelpOptions, FEEDBACK_FORM_ID, NotEnterpriseHelpOptions } from './constants'
import { isEnterprise } from './constants'

function HelpNav({
    className,
    setShowHelpCard,
    serverInfo,
    fetchingServerInfo,
    setGettingStartedClicked,
    showHelpCard,
}: HelpNavType) {

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

    const renderHelpOptions = (helpOptionType): JSX.Element => {
        return <> {CommonHelpOptions.concat(helpOptionType).map((option,index) => {
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
                        {isEnterprise && index===1 && <div className = "help__enterprise pl-8 pb-4-imp pt-4-imp dc__gap-12 flexbox dc__align-items-center h-28">Enterprise Support</div>}
                        {option.showSeparator && <div className="help-card__option-separator" />}
                    </Fragment>
                )
            })}
        </>
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
                {isEnterprise && renderHelpOptions(EnterpriseHelpOptions)}
                {!isEnterprise && renderHelpOptions(NotEnterpriseHelpOptions)}
                {isEnterprise && renderHelpFeedback()}
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
