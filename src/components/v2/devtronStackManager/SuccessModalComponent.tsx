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

import { ConfirmationModal, ConfirmationModalVariantType, IMAGE_SCAN_TOOL } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as UpToDateIcon } from '@Icons/ic-celebration.svg'

import { ModuleNameMap } from '../../../config'
import { SuccessModalType } from './DevtronStackManager.type'

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

    const handleModuleStatus = () => {
        setSuccessState(false)
        setSelectedModule({ ...moduleDetails, enabled: true })
        enableModuleState(moduleDetails.name)
    }

    const enabledTool =
        moduleDetails.name === ModuleNameMap.SECURITY_CLAIR ? IMAGE_SCAN_TOOL.Clair : IMAGE_SCAN_TOOL.Trivy

    return (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.custom}
            Icon={<UpToDateIcon />}
            title={`${enabledTool} is enabled`}
            subtitle={`Devtron will use ${enabledTool} to perform vulnerability scans in the future.`}
            handleClose={handleModuleStatus}
            buttonConfig={{
                secondaryButtonConfig: {
                    onClick: handleModuleStatus,
                    text: 'Okay',
                },
            }}
        />
    )
}
