import React, { useState } from 'react'
import { ReactComponent as CaretIcon } from '../../assets/icons/ic-chevron-down.svg'

export function CIBuildConfigDiff({
    _configOverridenWorkflows,
    wfId,
    configOverridenPipelines,
    materials,
    globalCIConfig,
}) {
    const [showOverrides, setShowOverrides] = useState(false)
    const _currentWorkflow = _configOverridenWorkflows?.find((_wf) => +wfId === _wf.id)
    const _currentPipelineOverride = configOverridenPipelines?.find(
        (_ci) => _currentWorkflow.ciPipelineId === _ci.id,
    )?.dockerConfigOverride
    const changedDockerRegistryBGColor = globalCIConfig.dockerRegistry !== _currentPipelineOverride?.dockerRegistry
    const changedDockerRepositoryBGColor =
        globalCIConfig.dockerRepository !== _currentPipelineOverride?.dockerRepository
    const changedDockerfileRelativePathBGColor =
        globalCIConfig.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath !==
        _currentPipelineOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath
    const changedGitMaterialBGColor =
        globalCIConfig.ciBuildConfig?.gitMaterialId !== _currentPipelineOverride?.ciBuildConfig?.gitMaterialId

    let globalGitMaterialName, currentMaterialName
    if (materials) {
        for (const gitMaterial of materials) {
            if (gitMaterial.gitMaterialId === globalCIConfig.ciBuildConfig?.gitMaterialId) {
                globalGitMaterialName = gitMaterial.materialName
            }

            if (gitMaterial.gitMaterialId === _currentPipelineOverride?.ciBuildConfig?.gitMaterialId) {
                currentMaterialName = gitMaterial.materialName
            }
        }
    }

    const renderDetailedValue = (parentClassName: string, value: string): JSX.Element => {
        return (
            <div className={`${parentClassName} cn-9 fs-13 fw-4 lh-20 pt-8 pb-8 pl-16 pr-16 dc__ellipsis-right`}>
                {value}
            </div>
        )
    }

    const renderValueDiff = (
        baseValue: string,
        currentValue: string,
        changedBGColor: boolean,
        configName: string,
        isLastItem?: boolean,
    ): JSX.Element => {
        const borderClass = isLastItem ? 'dc__border-right' : 'dc__border-right dc__border-bottom'
        const lastColumnClass = isLastItem ? '' : 'dc__border-bottom'
        return (
            <>
                <div className={`fs-13 fw-4 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__ellipsis-right ${borderClass}`}>
                    {configName}
                </div>
                {baseValue ? (
                    renderDetailedValue(`${borderClass} ${changedBGColor ? 'code-editor-red-diff' : ''}`, baseValue)
                ) : (
                    <div className={borderClass} />
                )}
                {currentValue ? (
                    renderDetailedValue(
                        `${lastColumnClass} ${changedBGColor ? 'code-editor-green-diff' : ''}`,
                        currentValue,
                    )
                ) : (
                    <div className={lastColumnClass} />
                )}
            </>
        )
    }

    const renderHeader = () => {
        return (
            <>
                <div className="fs-12 fw-6 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__border-right dc__border-bottom dc__uppercase">
                    Build Configs
                </div>
                <div className="fs-12 fw-6 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__border-right dc__border-bottom dc__uppercase">
                    Basic
                </div>
                <div className="fs-12 fw-6 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__border-bottom dc__uppercase">
                    Overriden
                </div>
            </>
        )
    }

    const toggleOverridesVisibility = () => {
        setShowOverrides(!showOverrides)
    }

    return (
        <div className="dc__border dc__bottom-radius-4">
            {showOverrides && (
                <div className="config-override-diff__values">
                    {renderHeader()}
                    {renderValueDiff(
                        globalCIConfig.dockerRegistry,
                        _currentPipelineOverride.dockerRegistry,
                        changedDockerRegistryBGColor,
                        'Container registry',
                    )}
                    {renderValueDiff(
                        globalCIConfig.dockerRepository,
                        _currentPipelineOverride.dockerRepository,
                        changedDockerRepositoryBGColor,
                        'Container Repository',
                    )}
                    {renderValueDiff(
                        globalGitMaterialName,
                        currentMaterialName,
                        changedGitMaterialBGColor,
                        'Git Repository',
                    )}
                    {renderValueDiff(
                        globalCIConfig.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath,
                        _currentPipelineOverride?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath,
                        changedDockerfileRelativePathBGColor,
                        'Docker file path',
                        true,
                    )}
                </div>
            )}
            <div
                className={`flex right p-10 bcn-0 cursor dc__bottom-radius-4 fs-13 fw-4 lh-20 ${
                    showOverrides ? 'dc__border-top' : ''
                }`}
                onClick={toggleOverridesVisibility}
            >
                {showOverrides ? 'Hide' : 'Show'} overrides
                <CaretIcon
                    className="icon-dim-20 fcn-6 rotate ml-4"
                    style={{
                        ['--rotateBy' as any]: showOverrides ? '-180deg' : '0deg',
                    }}
                />
            </div>
        </div>
    )
}
