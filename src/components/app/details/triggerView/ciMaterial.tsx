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

import React, { Component } from 'react'
import { Prompt } from 'react-router-dom'
import {
    Checkbox,
    CIMaterialSidebarType,
    ModuleNameMap,
    ToastManager,
    ToastVariantType,
    Button,
    ComponentSizeType,
    CIMaterialType,
    showError,
    SourceTypeMap,
    CommonNodeAttr,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { CIMaterialProps, CIMaterialState, RegexValueType } from './types'
import { ReactComponent as Play } from '@Icons/ic-play-outline.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Storage } from '../../../../assets/icons/ic-storage.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { getCIPipelineURL, importComponentFromFELibrary } from '../../../common'
import { DOCUMENTATION, SOURCE_NOT_CONFIGURED, DEFAULT_ROUTE_PROMPT_MESSAGE } from '../../../../config'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { TriggerViewContext } from './config'
import { IGNORE_CACHE_INFO } from './Constants'
import { EnvironmentList } from '../../../CIPipelineN/EnvironmentList'
import { GitInfoMaterial } from '@Components/common/helpers/GitInfoMaterialCard/GitInfoMaterial'
import BranchRegexModal from './BranchRegexModal'
import { savePipeline } from '@Components/ciPipeline/ciPipeline.service'

const AllowedWithWarningTippy = importComponentFromFELibrary('AllowedWithWarningTippy')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)

class CIMaterial extends Component<CIMaterialProps, CIMaterialState> {
    static contextType: React.Context<any> = TriggerViewContext

    constructor(props) {
        super(props)
        const regexValue: Record<number, RegexValueType> = {}
        this.props.material.forEach((mat) => {
            regexValue[mat.gitMaterialId] = {
                value: mat.value,
                isInvalid: mat.regex && !new RegExp(mat.regex).test(mat.value),
            }
        })
        this.state = {
            regexValue,
            savingRegexValue: false,
            isBlobStorageConfigured: false,
            currentSidebarTab: CIMaterialSidebarType.CODE_SOURCE,
            runtimeParamsErrorState: {
                isValid: true,
                cellError: {},
            },
        }
    }

    selectedCIPipeline = this.props.filteredCIPipelines?.find((_ciPipeline) => _ciPipeline?.id == this.props.pipelineId)

    componentDidMount() {
        this.getSecurityModuleStatus()
        if (this.props.isJobView && this.props.environmentLists?.length > 0) {
            const envId = this.selectedCIPipeline?.environmentId || 0
            const _selectedEnv = this.props.environmentLists.find((env) => env.id == envId)
            this.props.setSelectedEnv(_selectedEnv)
        }
    }

    async getSecurityModuleStatus(): Promise<void> {
        try {
            const { result } = await getModuleConfigured(ModuleNameMap.BLOB_STORAGE)
            if (result?.enabled) {
                this.setState({ isBlobStorageConfigured: true })
            }
        } catch (error) {}
    }

    handleRuntimeParamError = (updatedRuntimeParamsErrorState: typeof this.state.runtimeParamsErrorState) => {
        this.setState({
            runtimeParamsErrorState: updatedRuntimeParamsErrorState,
        })
    }

    handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            currentSidebarTab: e.target.value as CIMaterialSidebarType,
        })
    }

    onClickStopPropagation = (e): void => {
        e.stopPropagation()
    }

    renderIgnoreCache = () => {
        if (this.props.isFirstTrigger) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.FirstTrigger.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.FirstTrigger.infoText}</div>
                    </div>
                </div>
            )
        }
        if (!this.state.isBlobStorageConfigured) {
            return (
                <div className="flexbox flex-align-center">
                    <Storage className="icon-dim-24 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.BlobStorageNotConfigured.title}</div>
                        <div className="fw-4 fs-12 flexbox">
                            <span>{IGNORE_CACHE_INFO.BlobStorageNotConfigured.infoText}</span>
                            <a
                                className="fs-12 fw-6 cb-5 dc__no-decor ml-4"
                                href={DOCUMENTATION.BLOB_STORAGE}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {IGNORE_CACHE_INFO.BlobStorageNotConfigured.configure}
                            </a>
                            <OpenInNew className="icon-dim-16 mt-3 ml-8" />
                        </div>
                    </div>
                </div>
            )
        }
        if (!this.props.isCacheAvailable) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.CacheNotAvailable.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.CacheNotAvailable.infoText}</div>
                    </div>
                </div>
            )
        }
        return (
            <Checkbox
                isChecked={this.context.invalidateCache}
                onClick={this.onClickStopPropagation}
                rootClassName="form__checkbox-label--ignore-cache mb-0 flex top"
                value="CHECKED"
                onChange={this.context.toggleInvalidateCache}
                data-testid="set-clone-directory"
            >
                <div className="mr-5">
                    <div className="fs-13 fw-6">{IGNORE_CACHE_INFO.IgnoreCache.title}</div>
                    <div className="fs-12 fw-4">{IGNORE_CACHE_INFO.IgnoreCache.infoText}</div>
                </div>
            </Checkbox>
        )
    }

    renderEnvironments = () => {
        return (
            <EnvironmentList
                isBuildStage={false}
                environments={this.props.environmentLists}
                selectedEnv={this.props.selectedEnv}
                setSelectedEnv={this.props.setSelectedEnv}
                isBorderLess
            />
        )
    }

    handleStartBuildAction = (e) => {
        const runtimeParamsErrorState = validateRuntimeParameters(this.props.runtimeParams)
        this.handleRuntimeParamError(runtimeParamsErrorState)

        if (!runtimeParamsErrorState.isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the errors before starting the build',
            })
            return
        }

        e.stopPropagation()
        this.context.onClickTriggerCINode()
    }

    redirectToCIPipeline = () => {
        this.props.history.push(
            getCIPipelineURL(
                this.props.appId,
                this.props.workflowId.toString(),
                true,
                this.props.pipelineId,
                false,
                this.props.isJobCI,
            ),
        )
    }

    renderCTAButtonWithIcon = (canTrigger, isCTAActionable: boolean = true) => (
        <Button
            dataTestId="ci-trigger-start-build-button"
            text={this.props.isJobView || this.props.isJobCI ? 'Run Job' : 'Start Build'}
            disabled={!canTrigger}
            isLoading={this.props.isLoading}
            onClick={isCTAActionable ? this.handleStartBuildAction : noop}
            size={ComponentSizeType.large}
            startIcon={<Play />}
        />
    )

    renderCTAButton = (canTrigger) => {
        const nodeType: CommonNodeAttr['type'] = 'CI'

        if (AllowedWithWarningTippy && this.props.ciBlockState && !this.props.isJobView) {
            return (
                <AllowedWithWarningTippy
                    consequence={this.props.ciBlockState}
                    configurePluginURL={getCIPipelineURL(
                        this.props.appId,
                        this.props.workflowId.toString(),
                        true,
                        this.props.pipelineId,
                        false,
                        this.props.isJobCI,
                    )}
                    showTriggerButton
                    onTrigger={this.handleStartBuildAction}
                    nodeType={nodeType}
                    isJobView={this.props.isJobCI}
                >
                    {this.renderCTAButtonWithIcon(canTrigger, false)}
                </AllowedWithWarningTippy>
            )
        }

        return this.renderCTAButtonWithIcon(canTrigger)
    }

    renderMaterialStartBuild = (canTrigger) => {
        return (
            <div className="trigger-modal__trigger">
                {!this.props.isJobView ? this.renderIgnoreCache() : this.renderEnvironments()}
                {this.renderCTAButton(canTrigger)}
            </div>
        )
    }

    renderBranchRegexModal = () => (
        <BranchRegexModal
            material={this.props.material}
            selectedCIPipeline={this.selectedCIPipeline}
            title={this.props.title}
            isChangeBranchClicked={this.props.isChangeBranchClicked}
            onClickNextButton={this.onClickNextButton}
            handleRegexInputValue={this.handleRegexInputValue}
            regexValue={this.state.regexValue}
            onCloseBranchRegexModal={this.props.onCloseBranchRegexModal}
            savingRegexValue={this.state.savingRegexValue}
        />
    )

    renderCIModal() {
        const selectedMaterial = this.props.material.find((mat) => mat.isSelected)
        const isMaterialActive = this.props.material.some((material) => material.active)

        const canTrigger = this.props.material.reduce((isValid, mat) => {
            isValid =
                (isValid && !mat.isMaterialLoading && !!mat.history.find((history) => history.isSelected)) ||
                (!mat.isDockerFileError && mat.branchErrorMsg === SOURCE_NOT_CONFIGURED && isMaterialActive)
            return isValid
        }, true)
        if (this.props.material.length > 0) {
            return (
                <>
                    <GitInfoMaterial
                        dataTestId="edit-branch-name"
                        material={this.props.material}
                        title={this.props.title}
                        pipelineId={this.props.pipelineId}
                        pipelineName={this.props.pipelineName}
                        selectedMaterial={selectedMaterial}
                        workflowId={this.props.workflowId}
                        onClickShowBranchRegexModal={this.props.onClickShowBranchRegexModal}
                        fromAppGrouping={this.props.fromAppGrouping}
                        fromBulkCITrigger={false}
                        hideSearchHeader={false}
                        isJobView={this.props.isJobView}
                        isCITriggerBlocked={this.props.isCITriggerBlocked}
                        isJobCI={this.props.isJobCI}
                        currentSidebarTab={this.state.currentSidebarTab}
                        handleSidebarTabChange={this.handleSidebarTabChange}
                        runtimeParams={this.props.runtimeParams}
                        handleRuntimeParamChange={this.props.handleRuntimeParamChange}
                        runtimeParamsErrorState={this.state.runtimeParamsErrorState}
                        handleRuntimeParamError={this.handleRuntimeParamError}
                        appId={this.props.appId}
                        uploadFile={this.props.uploadFile}
                    />
                    {this.props.isCITriggerBlocked ? null : this.renderMaterialStartBuild(canTrigger)}
                    <Prompt when={this.props.isLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
                    {this.props.showMaterialRegexModal && this.renderBranchRegexModal()}
                </>
            )
        }
    }

    isRegexValueInvalid = (_cm): void => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = this.state.regexValue[_cm.gitMaterialId]
        if (!regExp.test(regVal.value)) {
            const _regexVal = {
                ...this.state.regexValue,
                [_cm.gitMaterialId]: { value: regVal.value, isInvalid: true },
            }
            this.setState({
                regexValue: _regexVal,
            })
        }
    }

    onClickNextButton = async () => {
        // setSavingRegexValue(true)
        this.setState({ savingRegexValue: true })
        const payload: any = {
            appId: Number(this.props.match.params.appId ?? this.props.appId),
            id: +this.props.workflowId,
            ciPipelineMaterial: [],
        }

        // Populate the ciPipelineMaterial with flatten object
        if (this.selectedCIPipeline?.ciMaterial?.length) {
            payload.ciPipelineMaterial = this.selectedCIPipeline.ciMaterial.map((_cm) => {
                const regVal = this.state.regexValue[_cm.gitMaterialId]
                let _updatedCM

                if (regVal?.value && _cm.source.regex) {
                    this.isRegexValueInvalid(_cm)

                    _updatedCM = {
                        ..._cm,
                        type: SourceTypeMap.BranchFixed,
                        value: regVal.value,
                        regex: _cm.source.regex,
                    }
                } else {
                    // Maintain the flattened object structure for unchanged values
                    _updatedCM = {
                        ..._cm,
                        ..._cm.source,
                    }
                }

                // Deleting as it's not required in the request payload
                delete _updatedCM.source

                return _updatedCM
            })
        }

        try {
            const response = await savePipeline(payload, true)
            if (response) {
                await this.props.getWorkflows()
                this.context.onClickCIMaterial(this.props.pipelineId.toString(), this.props.pipelineName)
            }
        } catch (error) {
            showError(error)
        } finally {
            this.setState({
                savingRegexValue: false,
            })
        }
    }

    handleRegexInputValue = (id: number, value: string, mat: CIMaterialType) => {
        this.setState((prevState) => {
            return {
                regexValue: {
                    ...prevState.regexValue,
                    [id]: { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) },
                },
            }
        })
    }

    render() {
        return this.renderCIModal()
    }
}

export default CIMaterial
