import React, { Component } from 'react';
import { updateMaterial } from './material.service';
import { GitMaterialType, UpdateMaterialState } from './material.types'
import { toast } from 'react-toastify';
import { showError } from '../common';
import { MaterialView } from './MaterialView';

interface UpdateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    isCheckoutPathValid;
    material: GitMaterialType;
    providers: any[];
    refreshMaterials: () => void;
}
export class UpdateMaterial extends Component<UpdateMaterialProps, UpdateMaterialState> {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.material.id,
            name: this.props.material.name,
            gitProvider: this.props.material.gitProvider,
            url: this.props.material.url,
            checkoutPath: this.props.material.checkoutPath,
            isCollapsed: true,
            active: true,
            isLoading: false,
        }
        this.handleProviderChange = this.handleProviderChange.bind(this);
        this.handlePathChange = this.handlePathChange.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.material.gitProvider.id != this.props.material.gitProvider.id || prevProps.material.url != this.props.material.url || prevProps.material.checkoutPath != this.props.material.checkoutPath) {
        //     this.setState({
        //         id: this.props.material.id,
        //         name: this.props.material.name,
        //         gitProvider: this.props.material.gitProvider,
        //         url: this.props.material.url,
        //         checkoutPath: this.props.material.checkoutPath,
        //         isCollapsed: true,
        //         isLoading: false,
        //     })
        // }
        // console.log("refreshed")
    }

    handleProviderChange(selected): void {
        this.setState({ gitProvider: selected });
    }

    handlePathChange(event): void {
        this.setState({ checkoutPath: event.target.value });
    }

    handleUrlChange(event): void {
        this.setState({ url: event.target.value });
    }

    toggleCollapse(event): void {
        this.setState({
            gitProvider: this.props.material.gitProvider,
            url: this.props.material.url,
            checkoutPath: this.props.material.checkoutPath,
            isCollapsed: !this.state.isCollapsed,
            isLoading: false,
        });
    }

    save(event): void {
        this.setState({ isLoading: true });
        let payload = {
            appId: this.props.appId,
            material: {
                id: this.state.id,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                gitProviderId: this.state.gitProvider.id,
            }
        }
        updateMaterial(payload).then((response) => {
            this.props.refreshMaterials();
            console.log(this.props.material)
            this.setState({
                id: response.result.id,
                name: response.result.name,
                gitProvider: this.props.providers.find(provider => provider.id === response.result.gitProviderId),
                url: response.result.url,
                checkoutPath: response.result.checkoutPath,
            })
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
        return <MaterialView
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
