import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'

export interface PageHeaderType {
    headerName: string
    buttonText?: string
    onClickCreateButton?: () => void
    isTippyShown?: boolean
    showCreateButton?: boolean
    tippyRedirectLink?: string
    CreateButtonIcon?: React.FunctionComponent<any>
    showIconBeforeText?: boolean
    postHeaderName?: string
    onClickHeaderName?: () => void
    isHeaderNameClickable?: boolean
}

function PageHeader({
    headerName,
    buttonText,
    onClickCreateButton,
    isTippyShown = false,
    showCreateButton = false,
    tippyRedirectLink,
    CreateButtonIcon,
    showIconBeforeText,
    postHeaderName,
    onClickHeaderName,
    isHeaderNameClickable = false,
}: PageHeaderType) {
    return (
        <div className={`page-header flex content-space cn-9 bcn-0 pl-20 pr-20 page-header__height`}>
            <h1 className="page-header__title flex left fs-16 fw-6 lh-20" onClick={onClickHeaderName}>
                <span className={isHeaderNameClickable ? 'cb-5 cursor' : ''}>{headerName}</span>
                {postHeaderName && (
                    <>
                        <span className="mr-4 ml-4">/</span>
                        <span>{postHeaderName}</span>
                    </>
                )}

                {isTippyShown && (
                    <Tippy
                        className="default-tt "
                        arrow={false}
                        placement="top"
                        content={<span style={{ display: 'block', width: '66px' }}> Learn more </span>}
                    >
                        <a
                            className="learn-more__href flex"
                            href={tippyRedirectLink}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <Question className="icon-dim-20 ml-16 cursor" />
                        </a>
                    </Tippy>
                )}
            </h1>
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
