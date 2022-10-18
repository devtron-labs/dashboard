import React, { useContext, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import HelpNav from '../HelpNav'
import './pageHeader.css'
import LogoutCard from '../LogoutCard'
import { getLoginInfo, getRandomColor, setActionWithExpiry } from '../helpers/Helpers'
import { ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { getServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import GettingStartedCard from '../gettingStartedCard/GettingStarted'
import { mainContext } from '../navigation/NavigationRoutes'
import ReactGA from 'react-ga4'
import { handlePostHogEventUpdate, MAX_LOGIN_COUNT, POSTHOG_EVENT_ONBOARDING } from '../../onboardingGuide/onboarding.utils'
import AnnouncementBanner from '../AnnouncementBanner'
export interface PageHeaderType {
    headerName?: string
    additionalHeaderInfo?: () => JSX.Element
    isTippyShown?: boolean
    tippyRedirectLink?: string
    showTabs?: boolean
    renderHeaderTabs?: () => JSX.Element
    isBreadcrumbs?: boolean
    breadCrumbs?: () => JSX.Element
    TippyIcon?: React.FunctionComponent<any>
    tippyMessage?: string
    onClickTippybutton?: () => void
    renderActionButtons?: () => JSX.Element
    showCloseButton?: boolean
    onClose?: () => void
    showAnnouncementHeader?: boolean
}

function PageHeader({
    headerName,
    additionalHeaderInfo,
    isTippyShown = false,
    tippyRedirectLink,
    showTabs = false,
    renderHeaderTabs,
    isBreadcrumbs = false,
    breadCrumbs,
    TippyIcon,
    tippyMessage,
    onClickTippybutton,
    renderActionButtons,
    showCloseButton = false,
    onClose,
    showAnnouncementHeader,
}: PageHeaderType) {
    const {
        loginCount,
        setLoginCount,
        showGettingStartedCard,
        setShowGettingStartedCard,
        isGettingStartedClicked,
        setGettingStartedClicked,
    } = useContext(mainContext)
    const [showHelpCard, setShowHelpCard] = useState(false)
    const [showLogOutCard, setShowLogOutCard] = useState(false)
    const loginInfo = getLoginInfo()
    const email: string = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''
    const [currentServerInfo, setCurrentServerInfo] = useState<{ serverInfo: ServerInfo; fetchingServerInfo: boolean }>(
        {
            serverInfo: undefined,
            fetchingServerInfo: false,
        },
    )
    const [expiryDate, setExpiryDate] = useState(0)

    const getCurrentServerInfo = async () => {
        try {
            const { result } = await getServerInfo()
            setCurrentServerInfo({
                serverInfo: result,
                fetchingServerInfo: false,
            })
        } catch (err) {
            setCurrentServerInfo({
                serverInfo: currentServerInfo.serverInfo,
                fetchingServerInfo: false,
            })
            console.error('Error in fetching server info')
        }
    }

    useEffect(() => {
        setExpiryDate(+localStorage.getItem('clickedOkay'))
    }, [])

    useEffect(() => {
        getCurrentServerInfo()
    }, [])

    const onClickLogoutButton = () => {
        setShowLogOutCard(!showLogOutCard)
        if (showHelpCard) {
            setShowHelpCard(false)
        }
        setActionWithExpiry('clickedOkay', 1)
        hideGettingStartedCard()
    }

    const onClickHelp = (e) => {
        setShowHelpCard(!showHelpCard)
        if (showLogOutCard) {
            setShowLogOutCard(false)
        }
        setActionWithExpiry('clickedOkay', 1)
        hideGettingStartedCard()
        handlePostHogEventUpdate(e, POSTHOG_EVENT_ONBOARDING.HELP)
        ReactGA.event({
            category: 'Main Navigation',
            action: `Help Clicked`,
        })
    }

    const renderLogoutHelpSection = () => {
        return (
            <>
                <div
                    className="flex left cursor mr-16"
                    onClick={onClickHelp}
                >
                    <span className="icon-dim-24 fcn-9 mr-4 ml-16">
                        <Question />
                    </span>
                    <span className="fs-13 cn-9">Help</span>
                </div>
                <div
                    className="logout-card__initial cursor fs-13 icon-dim-24 flex logout-card__initial--nav"
                    onClick={onClickLogoutButton}
                    style={{ backgroundColor: getRandomColor(email) }}
                >
                    {email[0]}
                </div>
            </>
        )
    }

    const hideGettingStartedCard = (count?: string) => {
        setShowGettingStartedCard(false)
        if (count) {
            setLoginCount(+count)
        }
    }

    const getExpired = (): boolean => {
        // Render Getting started tippy card if the time gets expired
        const now = new Date().valueOf()
        return now > expiryDate
    }

    return (
        <div
            className={`dc__page-header dc__content-space cn-9 bcn-0 pl-20 pr-20 ${
                showTabs ? 'dc__page-header-tabs__height' : 'dc__page-header__height flex'
            }`}
        >
            <h1 className={`dc__page-header__title dc__content-space  flex fs-16 fw-6 lh-20`}>
                <div className="flex left">
                    {showCloseButton && (
                        <button className="dc__transparent flex mr-8" onClick={onClose}>
                            <Close className="dc__page-header__close-icon icon-dim-24 cursor" />
                        </button>
                    )}
                    <span className="fw-6">{headerName}</span>
                    {additionalHeaderInfo && additionalHeaderInfo()}
                    {isBreadcrumbs && breadCrumbs()}
                    {isTippyShown && (
                        <a
                            className="dc__link flex"
                            target="_blank"
                            href={tippyRedirectLink}
                            onClick={onClickTippybutton}
                        >
                            <Tippy
                                className="default-tt "
                                arrow={false}
                                placement="top"
                                content={<span style={{ display: 'block', width: '66px' }}> {tippyMessage} </span>}
                            >
                                <TippyIcon className="icon-dim-20 ml-16 cursor fcn-5" />
                            </Tippy>
                        </a>
                    )}
                </div>
                {showTabs && (
                    <div className="flex left">
                        {typeof renderActionButtons === 'function' && renderActionButtons()}
                        {renderLogoutHelpSection()}
                    </div>
                )}
            </h1>
            {showTabs && renderHeaderTabs()}
            {showHelpCard && (
                <HelpNav
                    className={'help-card__more-option'}
                    showHelpCard={showHelpCard}
                    setShowHelpCard={setShowHelpCard}
                    serverInfo={currentServerInfo.serverInfo}
                    fetchingServerInfo={currentServerInfo.fetchingServerInfo}
                    setGettingStartedClicked={setGettingStartedClicked}
                />
            )}
            {showGettingStartedCard && loginCount >= 0 && loginCount < MAX_LOGIN_COUNT && getExpired() && (
                <GettingStartedCard
                    className="w-300"
                    showHelpCard={false}
                    hideGettingStartedCard={hideGettingStartedCard}
                    loginCount={loginCount}
                />
            )}
            {showLogOutCard && (
                <LogoutCard
                    className={'logout-card__more-option'}
                    userFirstLetter={email}
                    setShowLogOutCard={setShowLogOutCard}
                    showLogOutCard={showLogOutCard}
                />
            )}
            {!showTabs && (
                <div className="flex left">
                    {typeof renderActionButtons === 'function' && renderActionButtons()}
                    {renderLogoutHelpSection()}
                </div>
            )}
            {showAnnouncementHeader && <AnnouncementBanner parentClassName="page-header-banner" />}
        </div>
    )
}

export default PageHeader
