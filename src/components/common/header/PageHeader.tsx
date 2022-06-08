import React, { useContext, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import HelpNav from '../HelpNav'
import './pageHeader.css'
import LogoutCard from '../LogoutCard'
import { getLoginInfo, getRandomColor } from '../helpers/Helpers'
import { ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { getServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'

export interface PageHeaderType {
    headerName?: string
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
}

function PageHeader({
    headerName,
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
}: PageHeaderType) {
    const [showHelpCard, setShowHelpCard] = useState(false)
    const [showLogOutCard, setShowLogOutCard] = useState(false)
    const [loginInfo, setLoginInfo] = useState(undefined)
    const email: string = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''
    const [currentServerInfo, setCurrentServerInfo] = useState<{ serverInfo: ServerInfo; fetchingServerInfo: boolean }>(
        {
            serverInfo: undefined,
            fetchingServerInfo: false,
        },
    )

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
        getCurrentServerInfo()
    }, [])

    useEffect(() => {
        setLoginInfo(getLoginInfo())
    }, [])

    const renderLogoutHelpSection = () => {
        return (
            <>
                <div
                    className="flex left cursor mr-16"
                    onClick={() => {
                        setShowHelpCard(!showHelpCard)
                        showLogOutCard && setShowLogOutCard(false)
                    }}
                >
                    <span className="icon-dim-24 fcn-9 mr-4 ml-16">
                        <Question />
                    </span>
                    <span className="fs-13 cn-9">Help</span>
                </div>
                <div
                    className="logout-card__initial cursor fs-13 icon-dim-24 flex logout-card__initial--nav"
                    onClick={() => {
                        setShowLogOutCard(!showLogOutCard)
                        showHelpCard && setShowHelpCard(false)
                    }}
                    style={{ backgroundColor: getRandomColor(email) }}
                >
                    {email[0]}
                </div>
            </>
        )
    }

    return (
        <div
            className={`page-header content-space cn-9 bcn-0 pl-20 pr-20 ${
                showTabs ? 'page-header-tabs__height' : 'page-header__height flex'
            }`}
        >
            <h1 className={`page-header__title content-space  flex fs-16 fw-6 lh-20`}>
                <div className="flex left">
                    {showCloseButton && (
                        <button className="transparent flex mr-8" onClick={onClose}>
                            <Close className="icon-dim-24 cursor" />
                        </button>
                    )}
                    <span className="fw-6">{headerName}</span>
                    {isBreadcrumbs && breadCrumbs()}
                    {isTippyShown && (
                        <a
                            className="learn-more__href flex"
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
