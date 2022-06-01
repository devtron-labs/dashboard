import React from 'react'
import Tippy from '@tippyjs/react'
export interface PageHeaderType {
    headerName?: string
    onClickCreateButton?: () => void
    isTippyShown?: boolean
    showCreateButton?: boolean
    tippyRedirectLink?: string
    showTabs?: boolean
    renderHeaderTabs?: () => JSX.Element
    isBreadcrumbs?: boolean
    breadCrumbs?: () => JSX.Element
    TippyIcon?: React.FunctionComponent<any>
    tippyMessage?: string
    onClickTippybutton?: () => void
    renderCreateButton?: () => JSX.Element
}

function PageHeader({
    headerName,
    isTippyShown = false,
    showCreateButton = false,
    tippyRedirectLink,
    showTabs = false,
    renderHeaderTabs,
    isBreadcrumbs = false,
    breadCrumbs,
    TippyIcon,
    tippyMessage,
    onClickTippybutton,
    renderCreateButton,
}: PageHeaderType) {
    return (
        <div
            className={`page-header content-space cn-9 bcn-0 pl-20 pr-20 ${
                showTabs ? 'page-header-tabs__height' : 'page-header__height flex'
            }`}
        >
            <h1 className="page-header__title flex left fs-16 fw-6 lh-20">
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
            {showCreateButton && renderCreateButton()}
        </div>
    )
}

export default PageHeader
