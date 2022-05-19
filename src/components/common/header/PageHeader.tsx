import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { SERVER_MODE, URLS } from '../../../config'
import { mainContext } from '../../common/navigation/NavigationRoutes'

export interface PageHeaderType {
    headerName: string
    buttonText: string
    onClickCreateButton: () => void
    serverModeName: string
}

function PageHeader({ headerName, buttonText, onClickCreateButton, serverModeName }: PageHeaderType) {
    const { serverMode } = useContext(mainContext)

    return (
        <div className="flex content-space cn-9  pl-20 pr-20 pt-8 pb-8">
            <h1 className="page-header__title fs-14 fw-6">{headerName}</h1>
            {serverMode == serverModeName && (
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
