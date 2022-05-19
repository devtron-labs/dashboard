import Tippy from '@tippyjs/react'
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { DOCUMENTATION, SERVER_MODE, URLS } from '../../../config'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg'

export interface PageHeaderType {
    headerName: string
    buttonText?: string
    onClickCreateButton?: () => void
    serverModeName: string
    isTippyShown?: boolean
    isShownCreatedButton?: boolean
}

function PageHeader({
    headerName,
    buttonText = '',
    onClickCreateButton,
    serverModeName,
    isTippyShown = false,
    isShownCreatedButton = false,
}: PageHeaderType) {
    const { serverMode } = useContext(mainContext)

    return (
        <div className="flex content-space cn-9 bcn-0 pl-20 pr-20 pt-8 pb-8 border-bottom">
            <h1 className="page-header__title flex left fs-14 fw-6">
                {headerName}
                {isTippyShown && (
                    <Tippy
                        className="default-tt "
                        arrow={false}
                        placement="top"
                        content={<span style={{ display: 'block', width: '66px' }}> Learn more </span>}
                    >
                        <a
                            className="learn-more__href flex"
                            href={DOCUMENTATION.BULK_UPDATE}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <Question className="icon-dim-20 ml-16 cursor" />
                        </a>
                    </Tippy>
                )}
            </h1>
            {isShownCreatedButton && serverMode == serverModeName && (
                <button type="button" className="cta h-32 lh-n" onClick={() => onClickCreateButton()}>
                    Create {buttonText}
                    <span className="round-button__icon">
                        <i className="fa fa-caret-down" aria-hidden="true"></i>
                    </span>
                </button>
            )}
        </div>
    )
}

export default PageHeader
