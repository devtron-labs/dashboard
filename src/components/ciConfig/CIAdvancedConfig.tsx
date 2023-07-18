import React, { useState } from 'react'
import { ReactComponent as PluginIcon } from '../../assets/icons/ic-plugin.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Cross } from '../../assets/icons/ic-cross.svg'
import { ReactComponent as QuestionIcon } from '../v2/assets/icons/ic-question.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import { CIAdvancedConfigProps } from './types'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import TargetPlatformSelector from './TargetPlatformSelector'

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

    const addArg = (e) => {
        if (updateNotAllowed) {
            return
        }

        setArgs((args) => [{ k: '', v: '', keyError: '', valueError: '' }, ...args])
    }

    const handleArgsChange = (e): void => {
        const _target = e.currentTarget
        if (updateNotAllowed || !_target) {
            return
        }

        const isKey = _target.name === 'arg-key',
            id = _target.dataset.id,
            k = isKey ? _target.value : _target.dataset.value,
            v = isKey ? _target.dataset.value : _target.value

        setArgs((arr) => {
            arr[id] = { k: k, v: v, keyError: '', valueError: '' }
            return Array.from(arr)
        })
    }

    const deleteArgs = (e) => {
        if (updateNotAllowed) {
            return
        }

        const argsTemp = [...args]
        argsTemp.splice(e.currentTarget.dataset.id, 1)
        setArgs(argsTemp)
    }

    const renderBuildArgs = (isDockerArgsSection?: boolean) => {
        return (
            <div>
                <div className="flex left fs-13 fw-6 mb-8">
                    {isDockerArgsSection ? 'Docker Build Arguments' : 'Build Env Arguments'}
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300"
                        placement="top"
                        Icon={HelpIcon}
                        iconClass="fcv-5"
                        heading={isDockerArgsSection ? 'Docker Build Arguments' : 'Build Env Arguments'}
                        infoText={`Key/value pair will be appended as
                                ${
                                    isDockerArgsSection
                                        ? ' docker build arguments (--build-args).'
                                        : ' buildpack env arguments (--env).'
                                }`}
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                    </TippyCustomized>
                </div>
                {!updateNotAllowed && (
                    <div className="add-parameter fs-14 mb-8 cb-5 cursor dc__w-fit-content" onClick={addArg}>
                        <span className="fa fa-plus mr-8"></span>Add{isDockerArgsSection ? ' parameter' : ' argument'}
                    </div>
                )}
                {args &&
                    args.map((arg, idx) => (
                        <div className="flexbox justify-space" key={`build-${idx}`}>
                            <div className="mt-8 w-100">
                                <input
                                    data-testid={`build-pack-build-env-key${idx}`}
                                    name="arg-key"
                                    className={`w-100 dc__top-radius-4 pl-10 pr-10 pt-6 pb-6 en-2 bw-1 ${
                                        updateNotAllowed ? 'cursor-not-allowed' : ''
                                    }`}
                                    autoComplete="off"
                                    placeholder="Key"
                                    type="text"
                                    value={arg.k}
                                    data-id={idx}
                                    data-value={arg.v}
                                    onChange={handleArgsChange}
                                    disabled={updateNotAllowed}
                                />
                                <textarea
                                    data-testid={`build-pack-build-env-value${idx}`}
                                    name="arg-value"
                                    className={`build__value w-100 dc__bottom-radius-4 dc__no-top-border pl-10 pr-10 pt-6 pb-6 en-2 bw-1 ${
                                        updateNotAllowed ? 'cursor-not-allowed' : ''
                                    }`}
                                    value={arg.v}
                                    data-id={idx}
                                    data-value={arg.k}
                                    onChange={handleArgsChange}
                                    placeholder="Value"
                                    disabled={updateNotAllowed}
                                />
                            </div>
                            {!updateNotAllowed && (
                                <Cross data-id={idx} className="icon-dim-24 mt-6 ml-6 cursor" onClick={deleteArgs} />
                            )}
                        </div>
                    ))}
            </div>
        )
    }

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
        renderBuildArgs()
    ) : (
        <>
                <div onClick={toggleCollapse} className="flex left cursor mb-20" data-testid="advanced-option-drop-down-button">
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
                    {renderBuildArgs(true)}
                </>
            )}
        </>
    )
}
