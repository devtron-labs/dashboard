import React, { Component } from 'react'
import { updateMaterial } from './material.service'
import { GitMaterialType, UpdateMaterialState } from './material.types'
import { toast } from 'react-toastify'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { MaterialView } from './MaterialView'

interface UpdateMaterialProps {
    appId: number
    isMultiGit: boolean
    preventRepoDelete: boolean
    material: GitMaterialType
    providers: any[]
    isGitProviderValid
    isCheckoutPathValid
    refreshMaterials: () => void
    isWorkflowEditorUnlocked: boolean
    reload: () => void
    toggleRepoSelectionTippy: () => void
    setRepo?: React.Dispatch<React.SetStateAction<string>>
    isJobView?: boolean
}
export class UpdateMaterial extends Component<UpdateMaterialProps, UpdateMaterialState> {
    constructor(props) {
        super(props)
        this.state = {
            material: {
                id: this.props.material.id,
                name: this.props.material.name,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                includeExcludeFilePath: this.props.material.includeExcludeFilePath,
                active: this.props.material.active,
                fetchSubmodules: this.props.material.fetchSubmodules,
                isUsedInCiConfig: this.props.material.isUsedInCiConfig,
                isExcludeRepoChecked: this.props.material.isExcludeRepoChecked
            },
            isCollapsed: true,
            isChecked: true,
            isLearnHowClicked: false,
            isLoading: false,
            isError: {
                gitProvider: undefined,
                url: undefined,
                checkoutPath: undefined,
            },
        }
        this.handleProviderChange = this.handleProviderChange.bind(this)
        this.handlePathChange = this.handlePathChange.bind(this)
        this.handleUrlChange = this.handleUrlChange.bind(this)
        this.toggleCollapse = this.toggleCollapse.bind(this)
        this.save = this.save.bind(this)
        this.cancel = this.cancel.bind(this)
        this.handleCheckoutPathCheckbox = this.handleCheckoutPathCheckbox.bind(this)
        this.handleExcludeRepoCheckbox = this.handleExcludeRepoCheckbox.bind(this)
        this.handleLearnHowClick = this.handleLearnHowClick.bind(this)
        this.handleFileChange = this.handleFileChange.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.material.gitProvider.id != this.props.material.gitProvider.id ||
            prevProps.material.url != this.props.material.url ||
            prevProps.material.checkoutPath != this.props.material.checkoutPath
        ) {
            this.isGitUrlValid(this.props.material.url, this.state.material?.gitProvider?.id)
            this.setState({
                material: {
                    id: this.props.material.id,
                    name: this.props.material.name,
                    gitProvider: this.props.material.gitProvider,
                    url: this.props.material.url,
                    active: this.props.material.active,
                    checkoutPath: this.props.material.checkoutPath,
                    fetchSubmodules: this.props.material.fetchSubmodules,
                },
                isCollapsed: true,
                isLoading: false,
            })
        }
    }

    isGitUrlValid(url: string, selectedId): string | undefined {
        if (!url.length) return 'This is a required field'
        else {
            const res = this.props.providers?.filter((provider) => provider?.id === selectedId)
            if (res[0]?.authMode != 'SSH') {
                if (!url.startsWith('https')) return "Git Repo URL must start with 'https:'"
            }
            if (res[0]?.authMode === 'SSH') {
                if (!url.startsWith('git@')) return "Git Repo URL must start with 'git@'"
            }
            return undefined
        }
    }

    handleCheckoutPathCheckbox(event): void {
        this.setState({
            isChecked: !this.state.isChecked,
        })
    }

    handleExcludeRepoCheckbox(event): void {
        this.setState({
            material: {
                ...this.state.material,
                isExcludeRepoChecked: !this.state.material.isExcludeRepoChecked,
            },
        })
    }

    handleLearnHowClick(event): void {
        this.setState({
            isLearnHowClicked: !this.state.isLearnHowClicked,
        })
    }

    handleSubmoduleCheckbox = (event): void => {
        this.setState({
            material: {
                ...this.state.material,
                fetchSubmodules: !this.state.material.fetchSubmodules,
            },
        })
    }

    handleProviderChange(selected, url) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: selected,
            },
            isError: {
                ...this.state.isError,
                gitProvider: this.props.isGitProviderValid(selected),
                url: this.isGitUrlValid(url, selected.id),
            },
        })
    }

    handlePathChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                checkoutPath: event.target.value,
            },
            isError: {
                ...this.state.isError,
                checkoutPath: this.props.isCheckoutPathValid(event.target.value),
            },
        })
    }

    handleFileChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                includeExcludeFilePath: event.target.value,
            },
        })
    }

    handleUrlChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                url: event.target.value,
            },
            isError: {
                ...this.state.isError,
                url: this.isGitUrlValid(event.target.value, this.state.material?.gitProvider?.id),
            },
        })
    }

    toggleCollapse(event): void {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        })
    }

    save(event): void {
        this.setState(
            {
                isError: {
                    gitProvider: this.props.isGitProviderValid(this.state.material.gitProvider),
                    url: this.isGitUrlValid(this.state.material.url, this.state.material?.gitProvider?.id),
                    checkoutPath: this.props.isCheckoutPathValid(this.state.material.checkoutPath),
                },
            },
            () => {
                if (this.state.isError.url || this.state.isError.gitProvider || this.state.isError.checkoutPath) return
                this.setState({ isLoading: true, isChecked: true })
                let payload = {
                    appId: this.props.appId,
                    material: {
                        id: this.state.material.id,
                        url: this.state.material.url,
                        checkoutPath: this.state.material.checkoutPath,
                        filterPattern: (!window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS && this.state.material.isExcludeRepoChecked) ? this.state.material.includeExcludeFilePath 
                            .trim()
                            .split(/\r?\n/)
                            .filter((path) => path.trim()) : [],
                        gitProviderId: this.state.material.gitProvider.id,
                        fetchSubmodules: this.state.material.fetchSubmodules ? true : false,
                    },
                }
                updateMaterial(payload)
                    .then((response) => {
                        this.props.refreshMaterials()
                        toast.success('Material Saved Successfully')
                    })
                    .catch((error) => {
                        showError(error)
                    })
                    .finally(() => {
                        this.setState({ isLoading: false })
                    })
            },
        )
    }

    cancel(event) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                includeExcludeFilePath: this.props.material.includeExcludeFilePath,
            },
            isCollapsed: true,
            isLoading: false,
            isError: {
                gitProvider: this.props.isGitProviderValid(this.props.material.gitProvider),
                url: this.isGitUrlValid(this.props.material.url, this.state.material?.gitProvider?.id),
                checkoutPath: this.props.isCheckoutPathValid(this.props.material.checkoutPath),
            },
        })
    }

    render() {
        return (
            <MaterialView
                material={this.state.material}
                isError={this.state.isError}
                isCollapsed={this.state.isCollapsed}
                isChecked={this.state.isChecked}
                isLearnHowClicked={this.state.isLearnHowClicked}
                handleLearnHowClick={this.handleLearnHowClick}
                isLoading={this.state.isLoading}
                isMultiGit={this.props.isMultiGit}
                providers={this.props.providers}
                handleCheckoutPathCheckbox={this.handleCheckoutPathCheckbox}
                handleExcludeRepoCheckbox={this.handleExcludeRepoCheckbox}
                handleProviderChange={this.handleProviderChange}
                handleUrlChange={this.handleUrlChange}
                handlePathChange={this.handlePathChange}
                handleFileChange={this.handleFileChange}
                toggleCollapse={this.toggleCollapse}
                save={this.save}
                cancel={this.cancel}
                isWorkflowEditorUnlocked={this.props.isWorkflowEditorUnlocked}
                handleSubmoduleCheckbox={this.handleSubmoduleCheckbox}
                appId={this.props.appId}
                reload={this.props.reload}
                preventRepoDelete={this.props.preventRepoDelete}
                toggleRepoSelectionTippy={this.props.toggleRepoSelectionTippy}
                setRepo={this.props.setRepo}
                isJobView={this.props.isJobView}
            />
        )
    }
}
