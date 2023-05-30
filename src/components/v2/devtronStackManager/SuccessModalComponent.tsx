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
            if (moduleName === ModuleNameMap.SECURITY_TRIVY && module.name === ModuleNameMap.SECURITY_CLAIR) {
                return {
                    ...module,
                    enabled: false,
                }
            } else if (moduleName === ModuleNameMap.SECURITY_CLAIR && module.name === ModuleNameMap.SECURITY_TRIVY) {
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
            if (moduleName === ModuleNameMap.SECURITY_TRIVY && module.name === ModuleNameMap.SECURITY_CLAIR) {
                return {
                    ...module,
                    enabled: false,
                }
            } else if (moduleName === ModuleNameMap.SECURITY_CLAIR && module.name === ModuleNameMap.SECURITY_TRIVY) {
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
    const enabledTool =
        moduleDetails.name === ModuleNameMap.SECURITY_CLAIR ? IMAGE_SCAN_TOOL.Clair : IMAGE_SCAN_TOOL.Trivy
    return (
        <ConfirmationDialog>
            <div className="module-details__upgrade-success">
                <div className="flex column mb-40 mt-40">
                    <img src={LatestVersionCelebration} />
                    <UpToDateIcon className="icon-dim-48" />
                </div>
                <ConfirmationDialog.Body title={`${enabledTool} is enabled`} />
                <p className="flex left fs-14 cn-7 lh-1-54 mb-24">
                    {`Devtron will use ${enabledTool} to perform vulnerability scans in the future.`}
                </p>
            </div>
            <div className="flex mt-24">
                <button type="button" className="cta h-36 flex" onClick={handleModuleStatus}>
                    Okay
                </button>
            </div>
        </ConfirmationDialog>
    )
}
