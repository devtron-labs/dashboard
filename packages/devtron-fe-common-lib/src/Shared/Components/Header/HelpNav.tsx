/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Fragment } from 'react'
import ReactGA from 'react-ga4'
import { NavLink } from 'react-router-dom'
import { SliderButton } from '@typeform/embed-react'
import { stopPropagation, DOCUMENTATION_HOME_PAGE, URLS, DISCORD_LINK } from '../../../Common'
import { InstallationType, HelpNavType, HelpOptionType } from './types'
import { EnterpriseHelpOptions, OSSHelpOptions } from './constants'
import { ReactComponent as GettingStartedIcon } from '../../../Assets/Icon/ic-onboarding.svg'
import { ReactComponent as Feedback } from '../../../Assets/Icon/ic-feedback.svg'
import { ReactComponent as Discord } from '../../../Assets/Icon/ic-discord-fill.svg'
import { ReactComponent as File } from '../../../Assets/Icon/ic-file-text.svg'
import { useMainContext } from '../../Providers'

const HelpNav = ({
    className,
    setShowHelpCard,
    serverInfo,
    fetchingServerInfo,
    setGettingStartedClicked,
    showHelpCard,
}: HelpNavType) => {
    const { currentServerInfo } = useMainContext()
    const isEnterprise = currentServerInfo?.serverInfo?.installationType === InstallationType.ENTERPRISE
    const FEEDBACK_FORM_ID = `UheGN3KJ#source=${window.location.hostname}`

    const CommonHelpOptions: HelpOptionType[] = [
        {
            name: 'View documentation',
            link: DOCUMENTATION_HOME_PAGE,
            icon: File,
            showSeparator: true,
        },

        {
            name: 'Join discord community',
            link: DISCORD_LINK,
            icon: Discord,
            showSeparator: isEnterprise,
        },
        ...(isEnterprise ? EnterpriseHelpOptions : OSSHelpOptions),
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

    const renderHelpFeedback = (): JSX.Element => (
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

    const handleHelpOptions = (e) => {
        const option = CommonHelpOptions[e.currentTarget.dataset.index]
        onClickHelpOptions(option)
    }

    const renderHelpOptions = (): JSX.Element => (
        <>
            {' '}
            {CommonHelpOptions.map((option, index) => (
                <Fragment key={option.name}>
                    <a
                        key={option.name}
                        className="dc__no-decor help-card__option help-card__link flex left cn-9"
                        href={option.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-index={index}
                        onClick={handleHelpOptions}
                    >
                        <option.icon />
                        <div className="help-card__option-name ml-12 cn-9 fs-14">{option.name}</div>
                    </a>
                    {isEnterprise && index === 1 && (
                        <div className="help__enterprise pl-8 pb-4-imp pt-4-imp dc__gap-12 flexbox dc__align-items-center h-28">
                            Enterprise Support
                        </div>
                    )}
                </Fragment>
            ))}
        </>
    )

    return (
        <div className="dc__transparent-div" onClick={toggleHelpCard}>
            <div className={`help-card pt-4 pb-4 ${className} ${isEnterprise ? `help-grid__feedback` : ''}`}>
                {!window._env_.K8S_CLIENT && (
                    <NavLink
                        to={`/${URLS.GETTING_STARTED}`}
                        className="help-card__option dc__no-decor help-card__link flex left cn-9"
                        activeClassName="active"
                        onClick={onClickGettingStarted}
                    >
                        <GettingStartedIcon />
                        <div className="help-card__option-name ml-12 cn-9 fs-14" data-testid="getting-started-link">
                            Getting started
                        </div>
                    </NavLink>
                )}
                {renderHelpOptions()}
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
