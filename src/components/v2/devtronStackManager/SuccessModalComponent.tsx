import { ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'
import { ModuleNameMap } from '../../../config'
import { SuccessModalType } from './DevtronStackManager.type'
import { IMAGE_SCAN_TOOL } from '../../app/details/triggerView/Constants'
import { ReactComponent as UpToDateIcon } from '../../../assets/icons/ic-celebration.svg'
import LatestVersionCelebration from '../../../assets/gif/latest-version-celebration.gif'
import React from 'react'
export function SuccessModalComponent({
    moduleDetails,
    setSuccessState,
    setSelectedModule,
    setStackDetails,
    stackDetails,
    setToggled,
}: SuccessModalType) {
    const enableModuleState = (moduleName: string) => {
        let _moduleList = stackDetails.installedModulesList.map((module) => {
            if (moduleName === ModuleNameMap.SECURITY_TRIVY && module.name === ModuleNameMap.SECURITY) {
                return {
                    ...module,
                    enabled: false,
                }
            } else if (moduleName === ModuleNameMap.SECURITY && module.name === ModuleNameMap.SECURITY_TRIVY) {
                return {
                    ...module,
                    enabled: false,
                }
            }
            if (module.name === moduleName) {
                return {
                    ...module,
                    enabled: true,
                }
            }
            return module
        })
        let _discovermoduleList = stackDetails.discoverModulesList.map((module) => {
            if (moduleName === ModuleNameMap.SECURITY_TRIVY && module.name === ModuleNameMap.SECURITY) {
                return {
                    ...module,
                    enabled: false,
                }
            } else if (moduleName === ModuleNameMap.SECURITY && module.name === ModuleNameMap.SECURITY_TRIVY) {
                return {
                    ...module,
                    enabled: false,
                }
            }
            if (module.name === moduleName) {
                return {
                    ...module,
                    enabled: true,
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
    const enabledTool = moduleDetails.name === ModuleNameMap.SECURITY ? IMAGE_SCAN_TOOL.Clair : IMAGE_SCAN_TOOL.Trivy
    return (
        <ConfirmationDialog>
            <div className="module-details__upgrade-success">
                <div className="flex column mb-40 mt-40">
                    <img src={LatestVersionCelebration} />
                    <UpToDateIcon className="icon-dim-40" />
                </div>
                <ConfirmationDialog.Body title={`${enabledTool} is enabled`} />
                <p className="flex left fs-13 cn-7 lh-1-54 mb-24 mt-16 ml-16 mr-16">
                    {`Devtron will use ${enabledTool} to perform vulnerability scans in the future.`}
                </p>
            </div>
            <div className="flex mt-40">
                <button type="button" className="cta" onClick={handleModuleStatus}>
                    Okay
                </button>
            </div>
        </ConfirmationDialog>
    )
}
