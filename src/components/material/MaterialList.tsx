import React, { Component } from 'react'
import { getDisabledGitProvider, getGitProviderListAuth, getSourceConfig } from '../../services/service'
import { showError, Progressing, ErrorScreenManager, sortCallback } from '@devtron-labs/devtron-fe-common-lib'
import { AppConfigStatus, ViewType, DOCUMENTATION, AppListConstants, DEVTRON_NODE_DEPLOY_VIDEO } from '../../config'
import { withRouter } from 'react-router'
import { CreateMaterial } from './CreateMaterial'
import { UpdateMaterial } from './UpdateMaterial'
import { MaterialListProps, MaterialListState } from './material.types'
import { ReactComponent as GitHub } from '../../assets/icons/ic-sample-app.svg'
import { ReactComponent as PlayMedia } from '../../assets/icons/ic-play-media.svg'
import { ReactComponent as Folder } from '../../assets/icons/ic-folder-filled.svg'
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
            material_provider: [],
        }
        this.isGitProviderValid = this.isGitProviderValid.bind(this)
        this.isCheckoutPathValid = this.isCheckoutPathValid.bind(this)
        this.refreshMaterials = this.refreshMaterials.bind(this)
    }

    getGitProviderConfig = () => {
        Promise.all([
            getSourceConfig(this.props.match.params.appId),
            getGitProviderListAuth(this.props.match.params.appId),
        ])
            .then(async ([sourceConfigRes, providersRes]) => {
                let materials = sourceConfigRes.result.material || []
                let providers = providersRes.result

                const tempProviderIds = providers.map(provider => provider.id)
                const disabledProvidersIds = materials
                    .filter(mat => !tempProviderIds.includes(mat.gitProviderId))
                    .map(mat => mat.gitProviderId)

                const disabledProviderPromises = disabledProvidersIds.map((providerId) => {
                    return getDisabledGitProvider(this.props.match.params.appId, providerId)
                })

                const disabledProviderResults = await Promise.all(disabledProviderPromises)
                const disabledProviders = disabledProviderResults.map((providerResults) => providerResults.result)

                let material_provider = materials.map((mat) => {
                    const disabledProvidersForMaterial = disabledProvidersIds
                        .filter(providerId => mat.gitProviderId === providerId)
                        .map(providerId => disabledProviders.find(provider => provider.id === providerId))

                    const allProvidersForMaterial = [...providers, ...disabledProvidersForMaterial]

                    return { materials: mat, providers: allProvidersForMaterial }
                })

                providers = [...providers, ...disabledProviders]

                materials = materials.map((mat) => {
                    return {
                        ...mat,
                        includeExcludeFilePath: mat.filterPattern?.length ? mat.filterPattern.join('\n') : '',
                        gitProvider: providers.find((p) => mat.gitProviderId === p.id),
                        isExcludeRepoChecked: !!mat.filterPattern?.length
                    }
                })

                const updatedMaterialProvider = material_provider.map((providerMat) => {
                    const matchingMaterial = materials.find((mat) => mat.id === providerMat.materials.id)
                  
                    if (matchingMaterial) {
                      return {
                        ...providerMat,
                        materials: {
                          ...providerMat.materials,
                          gitProvider: providers.find((p) => matchingMaterial.gitProviderId === p.id),
                        },
                        includeExcludeFilePath: matchingMaterial.filterPattern?.length ? matchingMaterial.filterPattern.join('\n') : '',
                        isExcludeRepoChecked: !!matchingMaterial.filterPattern?.length
                      }
                    }                  
                  })

                console.log('updated material provider = ', updatedMaterialProvider)

                this.setState({
                    materials: materials.sort((a, b) => sortCallback('id', a, b)),
                    providers: providers,
                    view: ViewType.FORM,
                    material_provider: updatedMaterialProvider
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    componentDidMount() {
        this.getGitProviderConfig()
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
        Promise.all([
            getSourceConfig(this.props.match.params.appId),
            getGitProviderListAuth(this.props.match.params.appId),
        ]).then(async ([sourceConfigRes, providerRes]) => {
            let materials = sourceConfigRes.result.material.map((mat) => {
                return {
                    ...mat,
                    includeExcludeFilePath: mat.filterPattern?.length ? mat.filterPattern.join('\n') : '',
                    gitProvider: this.state.providers.find((p) => mat.gitProviderId === p.id),
                }
            })
            const providers = providerRes.result

            // Add disabled providers to the providers array
            const tempProviderIds = providers.map(provider => provider.id)
            const disabledProvidersIds = materials
                .filter(mat => !tempProviderIds.includes(mat.gitProviderId))
                .map(mat => mat.gitProviderId)

            const disabledProviderPromises = disabledProvidersIds.map((providerId) => {
                return getDisabledGitProvider(this.props.match.params.appId, providerId)
            })

            const disabledProviderResults = await Promise.all(disabledProviderPromises)
            const disabledProviders = disabledProviderResults.map((providerResults) => providerResults.result)

            // Update the providers array with disabled providers
            const updatedProviders = [...providers, ...disabledProviders]

            this.setState({
                materials: materials.sort((a, b) => sortCallback('id', a, b)),
                providers: updatedProviders,
            })
        })
    }

    isCheckoutPathValid(checkoutPath: string) {
        if (this.state.materials.length >= 1) {
            //Multi git
            if (!checkoutPath.length) {
                return 'This is a required field'
            } else {
                if (!checkoutPath.startsWith('./')) {
                    return "Invalid Path. Checkout path should start with './'"
                } else return
            }
        } else {
            if (checkoutPath.length && !checkoutPath.startsWith('./')) {
                return "Invalid Path. Checkout path should start with './'"
            }
            return undefined
        }
    }

    isGitProviderValid(provider) {
        if (provider && provider.id) return undefined

        return 'This is required field'
    }

    renderPageHeader() {
        return (
            <>
                <h2 className="form__title form__title--artifacts" data-testid={`${this.props.isJobView ? 'source-code-heading' : 'git-repositories-heading'}`}>
                    {this.props.isJobView ? 'Source code' : 'Git Repositories'}
                </h2>
                <p className="form__subtitle form__subtitle--artifacts">
                    Manage source code repositories for this {this.props.isJobView ? 'job' : 'application'}.&nbsp;
                    <a
                        rel="noreferrer noopener"
                        target="_blank"
                        className="dc__link"
                        href={this.props.isJobView ? DOCUMENTATION.JOB_SOURCE_CODE : DOCUMENTATION.GLOBAL_CONFIG_GIT}
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
                            <Folder className="icon-dim-16 mr-4" />
                            View sample app git repository
                        </a>
                        <a
                            rel="noreferrer noopener"
                            target="_blank"
                            className="flex left dc__link"
                            href={DEVTRON_NODE_DEPLOY_VIDEO}
                        >
                            <PlayMedia className="icon-dim-16 mr-4" />
                            Watch how to configure sample application
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        if (this.state.view == ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view == ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.statusCode} />
        } else {
            return (
                <div className="form__app-compose">
                    {this.renderPageHeader()}
                    {!this.props.isJobView && !this.state.materials.length && this.renderSampleApp()}
                    <CreateMaterial
                        key={this.state.materials.length}
                        appId={Number(this.props.match.params.appId)}
                        isMultiGit={this.state.materials.length > 0}
                        providers={this.state.providers}
                        refreshMaterials={this.refreshMaterials}
                        isGitProviderValid={this.isGitProviderValid}
                        isCheckoutPathValid={this.isCheckoutPathValid}
                        isWorkflowEditorUnlocked={this.props.isWorkflowEditorUnlocked}
                        reload={this.getGitProviderConfig}
                        isJobView={this.props.isJobView}
                    />
                    {this.state.material_provider.map((mat, index) => {
                        // console.log('material = ', mat)
                        console.log('materials = ', mat)
                        return (
                            <UpdateMaterial
                                key={mat.name}
                                appId={Number(this.props.match.params.appId)}
                                isMultiGit={this.state.materials.length > 0}
                                preventRepoDelete={this.state.materials.length === 1}
                                providers={mat.providers}
                                material={mat.materials}
                                refreshMaterials={this.refreshMaterials}
                                isGitProviderValid={this.isGitProviderValid}
                                isCheckoutPathValid={this.isCheckoutPathValid}
                                isWorkflowEditorUnlocked={this.props.isWorkflowEditorUnlocked}
                                reload={this.getGitProviderConfig}
                                toggleRepoSelectionTippy={this.props.toggleRepoSelectionTippy}
                                setRepo={this.props.setRepo}
                                isJobView={this.props.isJobView}
                            />
                        )
                    })}
                </div>
            )
        }
    }
}

export default withRouter(MaterialList)
