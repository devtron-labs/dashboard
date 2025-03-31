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

import { ConfirmationDialog, IMAGE_SCAN_TOOL } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ModuleNameMap } from '../../../config'
import { SuccessModalType } from './DevtronStackManager.type'
import { ReactComponent as UpToDateIcon } from '../../../assets/icons/ic-celebration.svg'

export const SuccessModalComponent = ({
    moduleDetails,
    setSuccessState,
    setSelectedModule,
    setStackDetails,
    stackDetails,
    setToggled,
}: SuccessModalType) => {
    const enableModuleState = (moduleName: string) => {
        const _moduleList = stackDetails.installedModulesList.map((module) => {
            if (module.name === moduleName) {
                return {
                    ...module,
                    enabled: true,
                }
            }
            if (
                (moduleName === ModuleNameMap.SECURITY_TRIVY && module.name === ModuleNameMap.SECURITY_CLAIR) ||
                (moduleName === ModuleNameMap.SECURITY_CLAIR && module.name === ModuleNameMap.SECURITY_TRIVY)
            ) {
                return {
                    ...module,
                    enabled: false,
                }
            }

            return module
        })
        const _discovermoduleList = stackDetails.discoverModulesList.map((module) => {
            if (module.name === moduleName) {
                return {
                    ...module,
                    enabled: true,
                }
            }
            if (
                (moduleName === ModuleNameMap.SECURITY_TRIVY && module.name === ModuleNameMap.SECURITY_CLAIR) ||
                (moduleName === ModuleNameMap.SECURITY_CLAIR && module.name === ModuleNameMap.SECURITY_TRIVY)
            ) {
                return {
                    ...module,
                    enabled: false,
                }
            }
            return module
        })
        setStackDetails({
            ...stackDetails,
            installedModulesList: _moduleList,
            discoverModulesList: _discovermoduleList,
        })
        setToggled(false)
    }
    function handleModuleStatus() {
        setSuccessState(false)
        setSelectedModule({ ...moduleDetails, enabled: true })
        enableModuleState(moduleDetails.name)
    }
    const enabledTool =
        moduleDetails.name === ModuleNameMap.SECURITY_CLAIR ? IMAGE_SCAN_TOOL.Clair : IMAGE_SCAN_TOOL.Trivy
    return (
        <ConfirmationDialog>
            <div className="module-details__upgrade-success">
                <div className="flex column mb-40 mt-40">
                    <UpToDateIcon className="icon-dim-48" />
                </div>
                <ConfirmationDialog.Body title={`${enabledTool} is enabled`} />
                <p className="flex left fs-14 cn-7 lh-1-54 mb-24">
                    {`Devtron will use ${enabledTool} to perform vulnerability scans in the future.`}
                </p>
            </div>
            <div className="flex mt-24">
                <button
                    type="button"
                    className="cta h-36 flex"
                    onClick={handleModuleStatus}
                    data-testid="enable-success-okay-button"
                >
                    Okay
                </button>
            </div>
        </ConfirmationDialog>
    )
}
