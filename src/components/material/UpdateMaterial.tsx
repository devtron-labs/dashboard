import React, { Component } from 'react';
import { updateMaterial } from './material.service';
import { GitMaterialType, UpdateMaterialState } from './material.types'
import { toast } from 'react-toastify';
import { showError } from '../common';
import { MaterialView } from './MaterialView';

export class UpdateMaterial extends Component<{ appId: number; isMultiGit: boolean; index: number; isCheckoutPathValid; material: GitMaterialType; providers: any[]; }, UpdateMaterialState> {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.material.id,
            name: this.props.material.name,
            gitProvider: this.props.material.gitProvider,
            url: this.props.material.url,
            checkoutPath: this.props.material.checkoutPath,
            isCollapsed: true,
            isLoading: false,
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
            gitProvider: this.props.material.gitProvider,
            url: this.props.material.url,
            checkoutPath: this.props.material.checkoutPath,
            isCollapsed: !this.state.isCollapsed,
            isLoading: false,
        });
    }

    save(event) {
        this.setState({ isLoading: true });
        let payload = {
            appId: this.props.appId,
            material: { ...this.state }
        }
        updateMaterial(payload).then((response) => {

        }).catch((error) => {
            showError(error);
        }).finally(() => {
            this.setState({ isLoading: false })
        })
    }

    cancel(event) {
        this.setState({
            gitProvider: this.props.material.gitProvider,
            url: this.props.material.url,
            checkoutPath: this.props.material.checkoutPath,
            isCollapsed: true,
            isLoading: false,
        });
    }

    render() {
        return <MaterialView index={this.props.index}
            material={this.state}
            isMultiGit={this.props.isMultiGit}
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
