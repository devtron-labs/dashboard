import React, { Component } from 'react';
import { createMaterial } from './material.service';
import { toast } from 'react-toastify';
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { MaterialView } from './MaterialView';
import { CreateMaterialState } from './material.types';

interface CreateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    providers: any[];
    refreshMaterials: () => void;
    isGitProviderValid;
    isCheckoutPathValid;
    isWorkflowEditorUnlocked: boolean;
    reload: () => void
    isJobView?: boolean
}

export class CreateMaterial extends Component<CreateMaterialProps, CreateMaterialState> {

    constructor(props) {
        super(props);
        this.state = {
            material: {
                gitProvider: undefined,
                url: '',
                checkoutPath: "",
                active: true,
                fetchSubmodules: false,
                includeExcludeFilePath: "",
                isExcludeRepoChecked: false
            },
            isCollapsed: this.props.isMultiGit ? true : false,
            isChecked: false,
            isLearnHowClicked: false,
            isLoading: false,
            isError: {
                gitProvider: undefined,
                url: undefined,
                checkoutPath: undefined,
            },
        }

        this.handleProviderChange = this.handleProviderChange.bind(this);
        this.handlePathChange = this.handlePathChange.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.handleCheckoutPathCheckbox = this.handleCheckoutPathCheckbox.bind(this);
        this.handleSubmoduleCheckbox = this.handleSubmoduleCheckbox.bind(this);
        this.handleExcludeRepoCheckbox = this.handleExcludeRepoCheckbox.bind(this);
        this.handleLearnHowClick = this.handleLearnHowClick.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleCheckoutPathCheckbox(event): void {
        this.setState({
            isChecked: !this.state.isChecked
        });
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
            isLearnHowClicked: !this.state.isLearnHowClicked
        })
    }

    handleSubmoduleCheckbox(event): void {
        this.setState({
            material:{
                ...this.state.material,
                fetchSubmodules: !this.state.material.fetchSubmodules
            }
        });
    }

    isGitUrlValid(url: string, selectedId): string | undefined {
        if (!url.length) return "This is a required field"

        const res = this.props.providers?.filter((provider)=>provider?.id == selectedId ) || []
        if(res[0]?.authMode != "SSH" ){
            if(!url.startsWith("https")) return "Git Repo URL must start with 'https:'";
        }
        if(res[0]?.authMode === "SSH" ){
            if(!url.startsWith("git@")) return "Git Repo URL must start with 'git@'";
        }
        return undefined;
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
                url: this.isGitUrlValid(url, selected.id)
            }
        });
    }

    handlePathChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                checkoutPath: event.target.value
            },
            isError: {
                ...this.state.isError,
                checkoutPath: this.props.isCheckoutPathValid(event.target.value)
            }
        });
    }

    handleFileChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                includeExcludeFilePath: event.target.value
            }
        })
    }


    handleUrlChange(event) {

        this.setState({
            material: {
                ...this.state.material,
                url: event.target.value
            },
            isError: {
                ...this.state.isError,
                url: this.isGitUrlValid(event.target.value, this.state.material?.gitProvider?.id )
            }
        });
    }


    toggleCollapse(event) {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        });
    }

    save(event): void {
        this.setState({
            isChecked: true,
            isError: {
                gitProvider: this.props.isGitProviderValid(this.state.material.gitProvider),
                url: this.isGitUrlValid(this.state.material.url, this.state.material?.gitProvider?.id ),
                checkoutPath: this.props.isCheckoutPathValid(this.state.material.checkoutPath),

            }

        }, () => {
            if (this.state.isError.url || this.state.isError.gitProvider || this.state.isError.checkoutPath) return;

            this.setState({
                isLoading: true,
            });
            let payload = {
                appId: this.props.appId,
                material: [
                    {
                        url: this.state.material.url,
                        checkoutPath: this.state.material.checkoutPath,
                        gitProviderId: this.state.material.gitProvider.id,
                        fetchSubmodules: this.state.material.fetchSubmodules,
                        filterPattern: (!window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS && this.state.material.isExcludeRepoChecked) ? this.state.material.includeExcludeFilePath
                            .trim()
                            .split(/\r?\n/)
                            .filter((path) => path.trim()) : [],
                    },
                ],
            }
            createMaterial(payload).then((response) => {
                this.props.refreshMaterials();
                toast.success("Material Saved Successfully");
            }).catch((error) => {
                showError(error);
            }).finally(() => {
                this.setState({ isLoading: false })
            })
        })
    }


    cancel(event): void {
        this.setState({
            material: {
                gitProvider: undefined,
                url: '',
                checkoutPath: '',
                includeExcludeFilePath: '',
                active: true,
                fetchSubmodules: false,
                isExcludeRepoChecked: false
            },
            isCollapsed: true,
            isLoading: false,
            isError: {
                gitProvider: undefined,
                url: undefined,
                checkoutPath: undefined,
            }
        });
    }

    render() {
        return <>
            <MaterialView
                isMultiGit={this.props.isMultiGit}
                isChecked={this.state.isChecked}
                isLearnHowClicked={this.state.isLearnHowClicked}
                handleLearnHowClick={this.handleLearnHowClick}
                material={this.state.material}
                isCollapsed={this.state.isCollapsed}
                handleCheckoutPathCheckbox={this.handleCheckoutPathCheckbox}
                handleExcludeRepoCheckbox={this.handleExcludeRepoCheckbox}
                handleSubmoduleCheckbox={this.handleSubmoduleCheckbox}
                isLoading={this.state.isLoading}
                isError={this.state.isError}
                providers={this.props.providers}
                handleProviderChange={this.handleProviderChange}
                handleUrlChange={this.handleUrlChange}
                handlePathChange={this.handlePathChange}
                handleFileChange={this.handleFileChange}
                toggleCollapse={this.toggleCollapse}
                save={this.save}
                cancel={this.cancel}
                isWorkflowEditorUnlocked={this.props.isWorkflowEditorUnlocked}
                reload = {this.props.reload}
                isJobView={this.props.isJobView}
            />
        </>
    }
}
