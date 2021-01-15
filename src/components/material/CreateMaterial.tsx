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
            gitProvider: undefined,
            url: '',
            checkoutPath: './',
            isCollapsed: true,
            isLoading: false,
            active: true,
        }

        this.handleProviderChange = this.handleProviderChange.bind(this);
        this.handlePathChange = this.handlePathChange.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    handleProviderChange(selected) {
        this.setState({ gitProvider: selected });
    }

    handlePathChange(event) {
        this.setState({ checkoutPath: event.target.value });
    }

    handleUrlChange(event) {
        this.setState({ url: event.target.value });
    }

    toggleCollapse(event) {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        });
    }

    save(event) {
        this.setState({ isLoading: true });
        let payload = {
            appId: this.props.appId,
            material: { ...this.state }
        }
        createMaterial(payload).then((response) => {
            this.props.refreshMaterials();
        }).catch((error) => {
            showError(error);
        }).finally(() => {
            this.setState({ isLoading: false })
        })
    }

    cancel(event) {
        this.setState({
            gitProvider: undefined,
            url: '',
            checkoutPath: './',
            isCollapsed: true,
            isLoading: false,
        });
    }

    render() {
        return <MaterialView
            isMultiGit={this.props.isMultiGit}
            material={this.state}
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
