import React, { Component } from 'react';
import { createMaterial } from './material.service';
import { toast } from 'react-toastify';
import { showError } from '../common';
import { MaterialView } from './MaterialView';
import { CreateMaterialState } from './material.types';

interface CreateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    providers: any[];
    refreshMaterials: () => void;
    isGitProviderValid;
    isGitUrlValid;
    isCheckoutPathValid;
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
            },
            isCollapsed: this.props.isMultiGit ? true : false,
            isChecked: false,
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

    toggleCollapse(event) {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        });
    }

    save(event): void {
        this.setState({
            isChecked:true,
            isError: {
                gitProvider: this.props.isGitProviderValid(this.state.material.gitProvider),
                url: this.props.isGitUrlValid(this.state.material.url),
                checkoutPath: this.props.isCheckoutPathValid(this.state.material.checkoutPath)
            }
        }, () => {
            if (this.state.isError.url || this.state.isError.gitProvider || this.state.isError.checkoutPath) return;

            this.setState({ 
                isLoading: true ,
            });
            let payload = {
                appId: this.props.appId,
                material: [{
                    url: this.state.material.url,
                    checkoutPath: this.state.material.checkoutPath,
                    gitProviderId: this.state.material.gitProvider.id,
                }]
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
                active: true
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
        return <MaterialView
            isMultiGit={this.props.isMultiGit}
            isChecked= {this.state.isChecked}
            material={this.state.material}
            isCollapsed={this.state.isCollapsed}
            handleCheckbox= {this.handleCheckbox}
            isLoading={this.state.isLoading}
            isError={this.state.isError}
            providers={this.props.providers}
            handleProviderChange={this.handleProviderChange}
            handleUrlChange={this.handleUrlChange}
            handlePathChange={this.handlePathChange}
            toggleCollapse={this.toggleCollapse}
            save={this.save}
            cancel={this.cancel}

        />
    }
}
