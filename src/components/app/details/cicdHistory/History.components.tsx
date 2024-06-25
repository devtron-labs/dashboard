/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
