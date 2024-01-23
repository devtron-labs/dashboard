import React, { useState } from 'react'
import { ReactComponent as PluginIcon } from '../../assets/icons/ic-plugin.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { CIAdvancedConfigProps } from './types'
import TargetPlatformSelector from './TargetPlatformSelector'
import DockerArgs from '../CIPipelineN/DockerArgs'
import { DockerArgsAction, HandleDockerArgsUpdateType } from '../CIPipelineN/types'

export default function CIAdvancedConfig({
    configOverrideView,
    allowOverride,
    args,
    setArgs,
    isBuildpackType,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    targetPlatformMap,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
}: CIAdvancedConfigProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const updateNotAllowed = configOverrideView && !allowOverride

    const toggleCollapse = (): void => {
        setIsCollapsed(!isCollapsed)
    }

    const handleDockerArgsUpdate = ({ action, argData }: HandleDockerArgsUpdateType) => {
        if (updateNotAllowed) {
            return
        }

        let _args = [...args]

        switch (action) {
            case DockerArgsAction.ADD:
                _args.unshift({ k: '', v: '', valueError: '', keyError: '' })
                break

            case DockerArgsAction.UPDATE_KEY:
                _args[argData.index].k = argData.value
                _args[argData.index].keyError = ''
                _args[argData.index].valueError = ''
                break

            case DockerArgsAction.UPDATE_VALUE:
                _args[argData.index].v = argData.value
                _args[argData.index].keyError = ''
                _args[argData.index].valueError = ''
                break

            case DockerArgsAction.DELETE:
                _args = _args.filter((_, index) => index !== argData.index)
                break
        }

        setArgs(_args)
    }

    const mapArgsToDockerArgs = () =>
        args.map((arg) => ({
            key: arg.k,
            value: arg.v,
        }))

    const renderTargetPlatform = () => {
        return (
            <div className="pb-8">
                <TargetPlatformSelector
                    selectedTargetPlatforms={selectedTargetPlatforms}
                    setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                    showCustomPlatformWarning={showCustomPlatformWarning}
                    setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                    targetPlatformMap={targetPlatformMap}
                    configOverrideView={false}
                />
            </div>
        )
    }

    if (configOverrideView && !isBuildpackType) {
        return null
    }

    return isBuildpackType ? (
        <DockerArgs
            args={mapArgsToDockerArgs()}
            handleDockerArgsUpdate={handleDockerArgsUpdate}
            fromBuildPack
            readOnly={updateNotAllowed}
        />
    ) : (
        <>
            <div
                onClick={toggleCollapse}
                className="flex left cursor mb-20"
                data-testid="advanced-option-drop-down-button"
            >
                <div className="icon-dim-40 mr-16">
                    <PluginIcon />
                </div>
                <div>
                    <div className="fs-14 fw-6 ">Advanced options</div>
                    <div className="form-row__add-parameters">
                        <span className="fs-13 fw-4 cn-7">Set target platform for build, Docker build arguments</span>
                    </div>
                </div>
                <span className="ml-auto">
                    <Dropdown
                        className="icon-dim-32 rotate "
                        style={{ ['--rotateBy' as any]: isCollapsed ? '180deg' : '0deg' }}
                    />
                </span>
            </div>
            {isCollapsed && (
                <>
                    {renderTargetPlatform()}

                    <DockerArgs
                        args={mapArgsToDockerArgs()}
                        handleDockerArgsUpdate={handleDockerArgsUpdate}
                        readOnly={updateNotAllowed}
                    />
                </>
            )}
        </>
    )
}
