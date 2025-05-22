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

import { Component } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    sortCallback,
    AppListConstants,
    getDocumentationUrl,
} from '@devtron-labs/devtron-fe-common-lib'
import { getGitProviderListAuth, getSourceConfig } from '../../services/service'
import { AppConfigStatus, ViewType, DEVTRON_NODE_DEPLOY_VIDEO } from '../../config'
import { CreateMaterial } from './CreateMaterial'
import { UpdateMaterial, UpdateMaterialProps } from './UpdateMaterial'
import { GitMaterialType, MaterialListProps, MaterialListState } from './material.types'
import { ReactComponent as GitHub } from '@Icons/ic-sample-app.svg'
import { ReactComponent as PlayMedia } from '@Icons/ic-play-outline.svg'
import { ReactComponent as Folder } from '@Icons/ic-folder-filled.svg'
import './material.scss'

class MaterialList extends Component<MaterialListProps, MaterialListState> {
    constructor(props) {
        super(props)
        this.state = {
            statusCode: 0,
            view: ViewType.LOADING,
            configStatus: AppConfigStatus.LOADING,
            materials: [],
            providers: [],
        }
        this.isGitProviderValid = this.isGitProviderValid.bind(this)
        this.isCheckoutPathValid = this.isCheckoutPathValid.bind(this)
        this.refreshMaterials = this.refreshMaterials.bind(this)
        this.handleSingleGitMaterialUpdate = this.handleSingleGitMaterialUpdate.bind(this)
    }

    getGitProviderConfig = () => {
        Promise.all([
            getSourceConfig(this.props.appId, null, this.props.isTemplateView),
            getGitProviderListAuth(this.props.appId),
        ])
            .then(([sourceConfigRes, providersRes]) => {
                let materials = sourceConfigRes.result.material || []
                const providers = providersRes.result
                materials = materials.map((mat) => {
                    return {
                        ...mat,
                        includeExcludeFilePath: mat.filterPattern?.length ? mat.filterPattern.join('\n') : '',
                        gitProvider: providers.find((p) => mat.gitProviderId === p.id),
                        isExcludeRepoChecked: !!mat.filterPattern?.length,
                    }
                })
                this.setState({
                    materials: materials.sort((a, b) => sortCallback('id', a, b)),
                    providers: providersRes.result,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR, statusCode: error.code })
            })
    }

    componentDidMount() {
        this.getGitProviderConfig()
    }

    componentDidUpdate(_prevProps: MaterialListProps, prevState: MaterialListState) {
        if (prevState.materials !== this.state.materials && this.props.handleGitMaterialsChange) {
            // Sync state with parent state
            this.props.handleGitMaterialsChange(this.state.materials, false)
        }
    }

    handleSingleGitMaterialUpdate =
        (id: GitMaterialType['id']): UpdateMaterialProps['handleSingleGitMaterialUpdate'] =>
        (updatedMaterial, isError) => {
            if (this.props.handleGitMaterialsChange) {
                // Sync state with parent state
                this.props.handleGitMaterialsChange(
                    this.state.materials.map((mat) => (mat.id === id ? updatedMaterial : mat)),
                    isError,
                )
            }
        }

    static getDerivedStateFromProps(props, state) {
        if (props.configStatus !== state.configStatus) {
            return {
                ...state,
                configStatus: props.configStatus,
            }
        }
        return null
    }

    refreshMaterials() {
        if (this.state.materials.length < 1) {
            this.props.respondOnSuccess()
        }
        getSourceConfig(this.props.appId, null, this.props.isTemplateView).then((response) => {
            const materials = response.result.material.map((mat) => {
                return {
                    ...mat,
                    includeExcludeFilePath: mat.filterPattern?.length ? mat.filterPattern.join('\n') : '',
                    gitProvider: this.state.providers.find((p) => mat.gitProviderId === p.id),
                }
            })
            this.setState({
                materials: materials.sort((a, b) => sortCallback('id', a, b)),
            })
        })
    }

    isCheckoutPathValid(checkoutPath: string) {
        if (this.state.materials.length >= 1) {
            // Multi git
            if (!checkoutPath.length) {
                return 'This is a required field'
            }
            if (!checkoutPath.startsWith('./')) {
                return "Invalid Path. Checkout path should start with './'"
            }
        } else {
            if (checkoutPath.length && !checkoutPath.startsWith('./')) {
                return "Invalid Path. Checkout path should start with './'"
            }
            return undefined
        }
    }

    isGitProviderValid(provider) {
        if (provider && provider.id) {
            return undefined
        }

        return 'This is required field'
    }

    renderPageHeader() {
        return (
            <>
                <h2
                    className="form__title form__title--artifacts"
                    data-testid={`${this.props.isJobView ? 'source-code-heading' : 'git-repositories-heading'}`}
                >
                    {this.props.isJobView ? 'Source code' : 'Git Repositories'}
                </h2>
                <p className="form__subtitle form__subtitle--artifacts">
                    Manage source code repositories for this {this.props.isJobView ? 'job' : 'application'}.&nbsp;
                    <a
                        rel="noreferrer noopener"
                        target="_blank"
                        className="dc__link"
                        href={getDocumentationUrl({ docLinkKey: this.props.isJobView ? "JOB_SOURCE_CODE" : "GLOBAL_CONFIG_GIT"})}
                    >
                        Learn more
                    </a>
                </p>
            </>
        )
    }

    renderSampleApp() {
        return (
            <div className="sample-repo-container br-8 p-16 flexbox">
                <span className="mr-16 icon-container">
                    <GitHub />
                </span>
                <div>
                    <h2 className="sample-title fs-14 fw-6">Looking to deploy a sample application?</h2>
                    <div className="flex left cb-5 fs-13">
                        <a
                            rel="noreferrer noopener"
                            target="_blank"
                            className="flex left dc__link mr-16"
                            href={AppListConstants.SAMPLE_NODE_REPO_URL}
                        >
                            <Folder className="icon-dim-16 mr-4 scb-5" />
                            View sample app git repository
                        </a>
                        <a
                            rel="noreferrer noopener"
                            target="_blank"
                            className="flex left dc__link"
                            href={DEVTRON_NODE_DEPLOY_VIDEO}
                        >
                            <PlayMedia className="icon-dim-16 scb-5 mr-4" />
                            Watch how to configure sample application
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        if (this.state.view == ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view == ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.statusCode} />
        }
        return (
            <div className={!this.props.isCreateAppView ? 'form__app-compose' : 'flexbox-col dc__gap-16'}>
                {!this.props.isCreateAppView && (
                    <>
                        {this.renderPageHeader()}
                        {!this.props.isJobView && !this.state.materials.length && this.renderSampleApp()}
                        <CreateMaterial
                            key={this.state.materials.length}
                            appId={Number(this.props.appId)}
                            isMultiGit={this.state.materials.length > 0}
                            providers={this.state.providers}
                            refreshMaterials={this.refreshMaterials}
                            isGitProviderValid={this.isGitProviderValid}
                            isCheckoutPathValid={this.isCheckoutPathValid}
                            reload={this.getGitProviderConfig}
                            isJobView={this.props.isJobView}
                            isTemplateView={this.props.isTemplateView}
                        />
                    </>
                )}
                {this.state.materials.map((mat) => {
                    return (
                        <UpdateMaterial
                            key={mat.id}
                            appId={Number(this.props.appId)}
                            isMultiGit={this.state.materials.length > 0}
                            preventRepoDelete={this.state.materials.length === 1}
                            providers={this.state.providers}
                            material={mat}
                            refreshMaterials={this.refreshMaterials}
                            isGitProviderValid={this.isGitProviderValid}
                            isCheckoutPathValid={this.isCheckoutPathValid}
                            reload={this.getGitProviderConfig}
                            toggleRepoSelectionTippy={this.props.toggleRepoSelectionTippy}
                            setRepo={this.props.setRepo}
                            isJobView={this.props.isJobView}
                            isTemplateView={this.props.isTemplateView}
                            isCreateAppView={this.props.isCreateAppView}
                            handleSingleGitMaterialUpdate={this.handleSingleGitMaterialUpdate(mat.id)}
                        />
                    )
                })}
            </div>
        )
    }
}

export default MaterialList
