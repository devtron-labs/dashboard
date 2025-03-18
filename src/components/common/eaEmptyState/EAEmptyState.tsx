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
import appDetailEmpty from '../../../assets/img/ic-empty-ea-app-detail.png'
import securityEmpty from '../../../assets/img/ic-empty-ea--security.png'
import { ModuleNameMap, URLS } from '../../../config'
import './eaEmptyState.css'
import { NavLink } from 'react-router-dom'

export enum EAEmptyStateType {
    SECURITY = 'security',
    BULKEDIT = 'bulk_edit',
}

interface EAEmptyStateProps {
    title: string
    msg: string
    stateType: EAEmptyStateType
    knowMoreLink: string
    headerText?: string
}

export default function EAEmptyState({ title, msg, stateType, knowMoreLink, headerText }: EAEmptyStateProps) {
    const getImage = () => {
        switch (stateType) {
            case EAEmptyStateType.BULKEDIT:
                return <img className="ea-empty-img" src={appDetailEmpty} width="800" alt="no apps found" />
            case EAEmptyStateType.SECURITY:
                return <img className="ea-empty-img" src={securityEmpty} width="800" alt="no apps found" />
            default:
                return null
        }
    }
    return (
        <div>
            {headerText && (
                <div className="dc__page-header dc__border-bottom pl-20">
                    <div className="dc__page-header__title flex left fs-16 pt-16 pb-16 ">{headerText}</div>
                </div>
            )}
            <div className="ea-empty__wrapper cn-9 dc__text-center">
                <div className="fs-20 fw-6 mb-8">{title}</div>
                <div className="fs-14 dc__m-auto w-600">{msg}</div>
                <div className="pt-20">
                    <NavLink to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=${ModuleNameMap.CICD}`}>
                        <button type="button" className="cta empty__install-btn">
                            View Integration
                        </button>
                    </NavLink>
                </div>
                <div className="m-tb-20 pb-20">{getImage()}</div>
            </div>
        </div>
    )
}
