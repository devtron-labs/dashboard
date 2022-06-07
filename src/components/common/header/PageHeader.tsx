import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'

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
}: PageHeaderType) {
    return (
        <div
            className={`page-header content-space cn-9 bcn-0 pl-20 pr-20 ${
                showTabs ? 'page-header-tabs__height' : 'page-header__height flex'
            }`}
        >
            <h1 className={`page-header__title flex left fs-16 fw-6 lh-20`}>
                {showCloseButton && (
                    <button className="transparent flex mr-8" onClick={onClose}>
                        <Close className="page-header__close-icon icon-dim-24 cursor" />
                    </button>
                )}
                <span className="fw-6">{headerName}</span>
                {additionalHeaderInfo && additionalHeaderInfo()}
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
            {typeof renderActionButtons === 'function' && renderActionButtons()}
        </div>
    )
}

export default PageHeader
