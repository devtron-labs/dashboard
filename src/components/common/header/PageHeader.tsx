import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import HelpNav from '../HelpNav'
import './pageHeader.css'
import LogoutCard from '../LogoutCard'
import { getRandomColor } from '..'
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
    const [loginInfo] = useState(undefined)

    const renderHelpSection = () => {
        return (
            <>
                <div className="flex left cursor mr-16" onClick={() => setShowHelpCard(!showHelpCard)}>
                    <span className="icon-dim-20 mr-8 ml-16">
                        <Question />
                    </span>
                    <span className="fs-13 cn-6">Help</span>
                </div>
                <div
                    className="logout-card__initial cursor fs-13 icon-dim-20 flex"
                    onClick={() => setShowLogOutCard(!showLogOutCard)}
                    style={{ backgroundColor: getRandomColor(email) }}
                >
                    {email[0]}
                </div>
            </>
        )
    }

    const email: string = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''

    return (
        <div
            className={`page-header content-space cn-9 bcn-0 pl-20 pr-20 ${
                showTabs ? 'page-header-tabs__height' : 'page-header__height flex'
            }`}
        >
            <h1 className={`page-header__title flex left fs-16 fw-6 lh-20`}>
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
            </h1>
            {showTabs && renderHeaderTabs()}
            {showHelpCard && <HelpNav className={'help-card__more-option'} />}
            {showLogOutCard && <LogoutCard className={'logout-card__more-option'} />}
            <div className="flex left">
                {typeof renderActionButtons === 'function' && renderActionButtons()}
                {renderHelpSection()}
            </div>
        </div>
    )
}

export default PageHeader
