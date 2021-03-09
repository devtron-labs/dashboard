import React, { Component } from 'react';
import { updateMaterial } from './material.service';
import { GitMaterialType, UpdateMaterialState } from './material.types'
import { toast } from 'react-toastify';
import { showError } from '../common';
import { MaterialView } from './MaterialView';

interface UpdateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    material: GitMaterialType;
    providers: any[];
    isGitProviderValid;
    isGitUrlValid;
    isCheckoutPathValid;
    refreshMaterials: () => void;
}
export class UpdateMaterial extends Component<UpdateMaterialProps, UpdateMaterialState> {

    constructor(props) {
        super(props);
        this.state = {
            material: {
                id: this.props.material.id,
                name: this.props.material.name,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                active: this.props.material.active,
            },
            isCollapsed: true,
            isChecked: true,
            isLoading: false,
            isError: {
                gitProvider: undefined,
                url: undefined,
                checkoutPath: undefined,
            }
        }
        this.handleProviderChange = this.handleProviderChange.bind(this);
        this.handlePathChange = this.handlePathChange.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.material.gitProvider.id != this.props.material.gitProvider.id || prevProps.material.url != this.props.material.url || prevProps.material.checkoutPath != this.props.material.checkoutPath) {
            this.setState({
                material: {
                    id: this.props.material.id,
                    name: this.props.material.name,
                    gitProvider: this.props.material.gitProvider,
                    url: this.props.material.url,
                    active: this.props.material.active,
                    checkoutPath: this.props.material.checkoutPath,
                },
                isCollapsed: true,
                isLoading: false,
            })
        }
    }

    handleCheckbox(event): void {
        this.setState({
            isChecked: !this.state.isChecked
        });
    }

    handleProviderChange(selected) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: selected
            },
            isError: {
                ...this.state.isError,
                gitProvider: this.props.isGitProviderValid(selected)
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

    handleUrlChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                url: event.target.value
            },
            isError: {
                ...this.state.isError,
                url: this.props.isGitUrlValid(event.target.value)
            }
        });
    }

    toggleCollapse(event): void {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        });
    }

    save(event): void {
        this.setState({
            isError: {
                gitProvider: this.props.isGitProviderValid(this.state.material.gitProvider),
                url: this.props.isGitUrlValid(this.state.material.url),
                checkoutPath: this.props.isCheckoutPathValid(this.state.material.checkoutPath)
            }
        }, () => {
            if (this.state.isError.url || this.state.isError.gitProvider || this.state.isError.checkoutPath) return;

            this.setState({ isLoading: true });
            let payload = {
                appId: this.props.appId,
                material: {
                    id: this.state.material.id,
                    url: this.state.material.url,
                    checkoutPath: this.state.material.checkoutPath,
                    gitProviderId: this.state.material.gitProvider.id,
                }
            }
            updateMaterial(payload).then((response) => {
                this.props.refreshMaterials();
                toast.success("Material Saved Successfully");
            }).catch((error) => {
                showError(error);
            }).finally(() => {
                this.setState({ isLoading: false })
            })
        })
    }

    cancel(event) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
            },
            isCollapsed: true,
            isLoading: false,
            isError: {
                gitProvider: this.props.isGitProviderValid(this.props.material.gitProvider),
                url: this.props.isGitUrlValid(this.props.material.url),
                checkoutPath: this.props.isCheckoutPathValid(this.props.material.checkoutPath)
            }
        });
    }

    render() {
        return <MaterialView
            material={this.state.material}
            isError={this.state.isError}
            isCollapsed={this.state.isCollapsed}
            isChecked={ this.state.isChecked}
            isLoading={this.state.isLoading}
            isMultiGit={this.props.isMultiGit}
            providers={this.props.providers}
            handleCheckbox= {this.handleCheckbox}
            handleProviderChange={this.handleProviderChange}
            handleUrlChange={this.handleUrlChange}
            handlePathChange={this.handlePathChange}
            toggleCollapse={this.toggleCollapse}
            save={this.save}
            cancel={this.cancel}
        />
    }
}
