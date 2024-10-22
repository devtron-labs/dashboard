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
} from '@devtron-labs/devtron-fe-common-lib'
import { CIMaterialProps, CIMaterialState } from './types'
import { ReactComponent as Play } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Storage } from '../../../../assets/icons/ic-storage.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as RunIcon } from '../../../../assets/icons/ic-play-media.svg'
import { getCIPipelineURL, importComponentFromFELibrary } from '../../../common'
import GitInfoMaterial from '../../../common/GitInfoMaterial'
import { DOCUMENTATION, SOURCE_NOT_CONFIGURED, DEFAULT_ROUTE_PROMPT_MESSAGE } from '../../../../config'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { TriggerViewContext } from './config'
import { IGNORE_CACHE_INFO } from './Constants'
import { EnvironmentList } from '../../../CIPipelineN/EnvironmentList'

const AllowedWithWarningTippy = importComponentFromFELibrary('AllowedWithWarningTippy')

class CIMaterial extends Component<CIMaterialProps, CIMaterialState> {
    static contextType: React.Context<any> = TriggerViewContext

    constructor(props) {
        super(props)

        this.state = {
            isBlobStorageConfigured: false,
            currentSidebarTab: CIMaterialSidebarType.CODE_SOURCE,
            runtimeParamsErrorState: false,
        }
    }

    componentDidMount() {
        this.getSecurityModuleStatus()
    }

    async getSecurityModuleStatus(): Promise<void> {
        try {
            const { result } = await getModuleConfigured(ModuleNameMap.BLOB_STORAGE)
            if (result?.enabled) {
                this.setState({ isBlobStorageConfigured: true })
            }
        } catch (error) {}
    }

    handleRuntimeParamError = (errorState: boolean) => {
        this.setState({
            runtimeParamsErrorState: errorState,
        })
    }

    handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.runtimeParamsErrorState) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the errors before switching tabs',
            })
            return
        }

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
        if (this.state.runtimeParamsErrorState) {
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

    renderCTAButton = (canTrigger) => {
        if (AllowedWithWarningTippy && this.props.ciBlockState && !this.props.isJobView) {
            return (
                <AllowedWithWarningTippy
                    consequence={this.props.ciBlockState}
                    onConfigure={this.redirectToCIPipeline}
                    onStart={this.handleStartBuildAction}
                >
                    <Button
                        dataTestId="ci-trigger-start-build-button"
                        text="Start Build"
                        disabled={!canTrigger}
                        isLoading={this.props.isLoading}
                        size={ComponentSizeType.xl}
                    />
                </AllowedWithWarningTippy>
            )
        }

        return (
            <Button
                dataTestId="ci-trigger-start-build-button"
                text={this.props.isJobView ? 'Run Job' : 'Start Build'}
                disabled={!canTrigger}
                isLoading={this.props.isLoading}
                onClick={this.handleStartBuildAction}
                size={ComponentSizeType.large}
                startIcon={this.props.isJobView ? <RunIcon /> : <Play />}
            />
        )
    }

    renderMaterialStartBuild = (canTrigger) => {
        return (
            <div className="trigger-modal__trigger">
                {!this.props.isJobView ? this.renderIgnoreCache() : this.renderEnvironments()}
                {this.renderCTAButton(canTrigger)}
            </div>
        )
    }

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
                        showWebhookModal={this.props.showWebhookModal}
                        hideWebhookModal={this.props.hideWebhookModal}
                        toggleWebhookModal={this.props.toggleWebhookModal}
                        webhookPayloads={this.props.webhookPayloads}
                        isWebhookPayloadLoading={this.props.isWebhookPayloadLoading}
                        workflowId={this.props.workflowId}
                        onClickShowBranchRegexModal={this.props.onClickShowBranchRegexModal}
                        fromAppGrouping={this.props.fromAppGrouping}
                        appId={this.props.appId}
                        fromBulkCITrigger={false}
                        hideSearchHeader={false}
                        isJobView={this.props.isJobView}
                        isCITriggerBlocked={this.props.isCITriggerBlocked}
                        isJobCI={this.props.isJobCI}
                        currentSidebarTab={this.state.currentSidebarTab}
                        handleSidebarTabChange={this.handleSidebarTabChange}
                        runtimeParams={this.props.runtimeParams}
                        handleRuntimeParamChange={this.props.handleRuntimeParamChange}
                        handleRuntimeParamError={this.handleRuntimeParamError}
                    />
                    {this.props.isCITriggerBlocked || this.props.showWebhookModal
                        ? null
                        : this.renderMaterialStartBuild(canTrigger)}
                    <Prompt when={this.props.isLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
                </>
            )
        }
    }

    render() {
        return this.renderCIModal()
    }
}

export default CIMaterial
