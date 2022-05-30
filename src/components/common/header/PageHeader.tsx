import React from 'react'
import Tippy from '@tippyjs/react'
import './page-headers.css'
export interface PageHeaderType {
    headerName: string
    buttonText?: string
    onClickCreateButton?: () => void
    isTippyShown?: boolean
    showCreateButton?: boolean
    tippyRedirectLink?: string
    CreateButtonIcon?: React.FunctionComponent<any>
    showIconBeforeText?: boolean
    showTabs?: boolean
    renderHeaderTabs?: () => void
    isBreadcrumbs?: boolean
    breadCrumbs?: () => void
    TippyIcon?: React.FunctionComponent<any>
    tippyMessage?: string
    onClickTippybutton?: () => void
}

function PageHeader({
    headerName,
    buttonText,
    onClickCreateButton,
    isTippyShown = false,
    showCreateButton = false,
    CreateButtonIcon,
    showIconBeforeText,
    showTabs = false,
    renderHeaderTabs,
    isBreadcrumbs = false,
    breadCrumbs,
    TippyIcon,
    tippyMessage,
    onClickTippybutton,
    tippyRedirectLink,
}: PageHeaderType) {
    return (
        <div
            className={`page-header flex content-space cn-9 bcn-0 pl-20 pr-20 ${
                showTabs ? 'page-header-tabs__height' : 'page-header__height'
            }`}
        >
            <h1 className="page-header__title flex left fs-16 fw-6 lh-20">
                <span className="fw-6">{headerName}</span>
                {isBreadcrumbs && breadCrumbs()}
                {isTippyShown && (
                    <a className="learn-more__href flex" target="_blank" href={tippyRedirectLink}>
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
            {showCreateButton && (
                <button type="button" className="flex cta h-32 lh-n" onClick={() => onClickCreateButton()}>
                    {showIconBeforeText && CreateButtonIcon && <CreateButtonIcon className="icon-dim-20" />}
                    Create {buttonText}
                    {!showIconBeforeText && CreateButtonIcon && <CreateButtonIcon className="icon-dim-20" />}
                </button>
            )}
        </div>
    )
}

export default PageHeader
