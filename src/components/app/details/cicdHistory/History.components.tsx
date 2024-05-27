import React from 'react'
import { NavLink } from 'react-router-dom'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'
import { EmptyViewType } from './types'

export const EmptyView = ({ imgSrc, title, subTitle, link, linkText }: EmptyViewType) => {
    const EmptyViewButton = () => {
        return link ? (
            <NavLink to={link} className="cta cta--ci-details flex" target="_blank">
                <OpenInNew className="mr-5 mr-5 scn-0 fcb-5 icon-fill-blue-imp" />
                {linkText}
            </NavLink>
        ) : null
    }
    return (
        <GenericEmptyState
            image={imgSrc ?? AppNotDeployed}
            classname="w-300 dc__text-center lh-1-4 dc__align-reload-center"
            title={title}
            subTitle={subTitle}
            isButtonAvailable
            renderButton={EmptyViewButton}
        />
    )
}
