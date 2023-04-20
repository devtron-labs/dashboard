import React, { useContext, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import './pageHeader.css'
import LogoutCard from '../LogoutCard'
import { getLoginInfo, getRandomColor, setActionWithExpiry } from '../helpers/Helpers'
import { InstallationType, ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { getServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import GettingStartedCard from '../gettingStartedCard/GettingStarted'
import { mainContext } from '../navigation/NavigationRoutes'
import ReactGA from 'react-ga4'
import {
    handlePostHogEventUpdate,
    MAX_LOGIN_COUNT,
    POSTHOG_EVENT_ONBOARDING,
} from '../../onboardingGuide/onboarding.utils'
import HelpNav from './HelpNav'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { PageHeaderType } from './header.type'
import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'

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
    markAsBeta,
}: PageHeaderType) {
    const { loginCount, setLoginCount, showGettingStartedCard, setShowGettingStartedCard, setGettingStartedClicked } =
        useContext(mainContext)
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
            const { result } = await getServerInfo(true, true)
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

    const onClickLogoutButton = () => {
        setShowLogOutCard(!showLogOutCard)
        if (showHelpCard) {
            setShowHelpCard(false)
        }
        setActionWithExpiry('clickedOkay', 1)
        hideGettingStartedCard()
    }

    const onClickHelp = (e) => {
      if (!window._env_.K8S_CLIENT && currentServerInfo.serverInfo?.installationType !== InstallationType.ENTERPRISE) {
          getCurrentServerInfo()
      }
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
                <div className="flex left cursor mr-16" onClick={onClickHelp}>
                    <span className="icon-dim-24 fcn-9 mr-4 ml-16">
                        <Question />
                    </span>
                    <span className="fs-13 cn-9" data-testid="go-to-get-started">Help</span>
                    <DropDownIcon
                        style={{ ['--rotateBy' as any]: `${180 * Number(showHelpCard)}deg` }}
                        className="fcn-9 icon-dim-20 rotate pointer"
                    />
                </div>
                {!window._env_.K8S_CLIENT && (
                    <div
                        className="logout-card__initial cursor fs-13 icon-dim-24 flex logout-card__initial--nav"
                        onClick={onClickLogoutButton}
                        style={{ backgroundColor: getRandomColor(email) }}
                        data-testid="profile-button"
                    >
                        {email[0]}
                    </div>
                )}
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

    const renderBetaTag = (): JSX.Element => {
        return <span className="fs-12 fw-4 lh-18 pt-1 pb-1 pl-6 pr-6 ml-8 cn-9 bcy-5 br-4">Beta</span>
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
                    <span className="fw-6" data-testid="main-header">
                        {headerName}
                    </span>
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
                    {markAsBeta && renderBetaTag()}
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
                    className={`help-card__more-option ${window._env_.K8S_CLIENT ? 'k8s-client-view' : ''}`}
                    setShowHelpCard={setShowHelpCard}
                    serverInfo={currentServerInfo.serverInfo}
                    fetchingServerInfo={currentServerInfo.fetchingServerInfo}
                    setGettingStartedClicked={setGettingStartedClicked}
                    showHelpCard={showHelpCard}
                />
            )}
            {!window._env_.K8S_CLIENT &&
                showGettingStartedCard &&
                loginCount >= 0 &&
                loginCount < MAX_LOGIN_COUNT &&
                getExpired() && (
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
        </div>
    )
}

export default PageHeader
