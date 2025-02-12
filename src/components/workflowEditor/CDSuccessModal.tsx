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
import { VisibleModal, URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { ReactComponent as SuccessIcon } from '../../assets/icons/ic-success-with-light-background.svg'
import { ReactComponent as GotToBuildDeploy } from '../../assets/icons/go-to-buildanddeploy.svg'
import { ReactComponent as GoToEnvOverride } from '../../assets/icons/go-to-envoverride.svg'

interface CDSuccessModalType {
    appId: string
    envId: number
    closeSuccessPopup: () => void
    envName: string
    successTitle: string
}

export default function CDSuccessModal({ appId, envId, closeSuccessPopup, envName, successTitle }: CDSuccessModalType) {
    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body" style={{ width: '600px' }}>
                <div className="flexbox mb-20">
                    <div className="pr-16">
                        <SuccessIcon />
                    </div>
                    <div>
                        <div className="fw-6 fs-16" data-testid="cd-success-modal">
                            {successTitle}
                        </div>
                        <div className="fs-13">What do you want to do next?</div>
                    </div>
                </div>
                <NavLink
                    to={`${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`}
                    data-testid="go-to-build-deploy-link"
                    className="cb-5 dc__no-decor"
                >
                    <div className="flex left br-4 p-15 mb-12 en-2 bw-1 action-card">
                        <div className="cd-success-icon-container ">
                            <GotToBuildDeploy />
                        </div>
                        <div className="ml-16 mr-16 flex-1">
                            <div className="fw-6 fs-13 cn-9">Deploy this app on {envName}</div>
                            <div>Go to Build & Deploy</div>
                        </div>
                    </div>
                </NavLink>
                <NavLink
                    to={`${URLS.APP}/${appId}/${CommonURLS.APP_CONFIG}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}`}
                    data-testid="go-to-environmentOverride-link"
                    className="cb-5 dc__no-decor"
                >
                    <div className="flex left br-4 p-15 mb-12 en-2 bw-1 action-card">
                        <div className="cd-success-icon-container ">
                            <GoToEnvOverride />
                        </div>
                        <div className="ml-16 mr-16 flex-1">
                            <div className="fw-6 fs-13 cn-9">Override deployment configurations for {envName}</div>
                            <div>Go to environment override</div>
                        </div>
                    </div>
                </NavLink>
                <div className="close-button-container">
                    <button
                        type="button"
                        className="fw-6 fs-13 lh-20 cta"
                        onClick={closeSuccessPopup}
                        data-testid="close-build-deploy-button"
                    >
                        Close
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}
