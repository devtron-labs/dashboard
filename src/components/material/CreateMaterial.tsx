import React, { Component } from 'react';
import { createMaterial } from './material.service';
import { toast } from 'react-toastify';
import { showError } from '../common';
import { MaterialView } from './MaterialView';
import { CreateMaterialState } from './material.types';
interface CreateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    isCheckoutPathValid;
    providers: any[];
    refreshMaterials: () => void;
}

export class CreateMaterial extends Component<CreateMaterialProps, CreateMaterialState> {

    constructor(props) {
        super(props);
        this.state = {
            material: {
                gitProvider: undefined,
                url: '',
                checkoutPath: this.props.isMultiGit ? "./" : "",
                active: true,
            },
            isCollapsed: this.props.isMultiGit ? true : false,
            isLoading: false,
            isError: {
                gitProvider: false,
                url: false,
                checkoutPath: false,
            }
        }

        this.handleProviderChange = this.handleProviderChange.bind(this);
        this.handlePathChange = this.handlePathChange.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    handleProviderChange(selected) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: selected
            },
            isError:{
                ...this.state.isError,
                gitProvider: !selected
            }
        });
    }

    handlePathChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                checkoutPath: event.target.value
            },
        });
    }

    handleUrlChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                url: event.target.value
            },
            isError:{
                ...this.state.isError,
                url: event.target.value.length<1
            }
        });
    }

    toggleCollapse(event) {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        });
    }

    save(event): void {
        this.setState({ isLoading: true });
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
            toast.success("Saved");
        }).catch((error) => {
            showError(error);
        }).finally(() => {
            this.setState({ isLoading: false })
        })
    }

    cancel(event): void {
        this.setState({
            material: {
                gitProvider: undefined,
                url: '',
                checkoutPath: './',
                active: true
            },
            isCollapsed: true,
            isLoading: false,
        });
    }

    render() {
        return <MaterialView
            isMultiGit={this.props.isMultiGit}
            material={this.state.material}
            isCollapsed={this.state.isCollapsed}
            isLoading={this.state.isLoading}
            isError={this.state.isError}
            providers={this.props.providers}
            handleProviderChange={this.handleProviderChange}
            handleUrlChange={this.handleUrlChange}
            handlePathChange={this.handlePathChange}
            toggleCollapse={this.toggleCollapse}
            save={this.save}
            cancel={this.cancel}
            isCheckoutPathValid={this.props.isCheckoutPathValid}
        />
    }
}
