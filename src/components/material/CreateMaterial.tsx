import React, { Component } from 'react';
import { createMaterial } from './material.service';
import { toast } from 'react-toastify';
import { showError, VisibleModal } from '../common';
import { MaterialView } from './MaterialView';
import { CreateMaterialState } from './material.types';
import { ReactComponent as Info } from '../../assets/ic-info-filled-border.svg';
import SaveModal from './SaveModal';

interface CreateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    providers: any[];
    refreshMaterials: () => void;
    isGitProviderValid;
    isGitUrlValid;
    isCheckoutPathValid;
    isWorkflowEditorUnlocked: boolean;
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
            },
            showSaveModal: false,
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
            isChecked: true,
            showSaveModal: false,
            isError: {
                gitProvider: this.props.isGitProviderValid(this.state.material.gitProvider),
                url: this.props.isGitUrlValid(this.state.material.url),
                checkoutPath: this.props.isCheckoutPathValid(this.state.material.checkoutPath)
            }
            
        }, () => {
            if (this.state.isError.url || this.state.isError.gitProvider || this.state.isError.checkoutPath) return;

            this.setState({
                isLoading: true,
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

    toggleSaveModal = () => {
        this.setState({
            showSaveModal: !this.state.showSaveModal
        })
    }

    renderSavePopupModal = () => {
        return <VisibleModal className="app-status__material-modal">
            {console.log('hi')}
            <div className="modal__body pl-24 pr-24" onClick={e => e.stopPropagation()}>
                <Info className="icon-dim-40" />
                <div className="mt-16 cn-9 fw-6 fs-18 mb-8">Configure existing build pipelines to use changes</div>
                <div className="fs-14 cn-7">
                    To use this repository please configure it in existing build pipelines, if any.
                        <br />
                    <br />
                        NOTE: Already created build pipelines will continue running based on previous configurations.
                   </div>
                <div className="form__row form__buttons mt-40">
                    <button className="cta cancel mr-16" type="button" onClick={()=>this.setState({showSaveModal: false})}>Cancel</button>
                    <button className="cta" type="submit" onClick={(e) => this.save(e)} >Okay, Save changes</button>
                </div>
            </div>
            {console.log('testing')}
        </VisibleModal>
    }

    handleSaveButton = (e) => {
        if (this.props.isWorkflowEditorUnlocked) {
            return this.toggleSaveModal()
        }
        else {
            return this.save(e)
        }
    }

    render() {
        return <>
            <MaterialView
                isMultiGit={this.props.isMultiGit}
                isChecked={this.state.isChecked}
                material={this.state.material}
                isCollapsed={this.state.isCollapsed}
                handleCheckbox={this.handleCheckbox}
                isLoading={this.state.isLoading}
                isError={this.state.isError}
                providers={this.props.providers}
                handleProviderChange={this.handleProviderChange}
                handleUrlChange={this.handleUrlChange}
                handlePathChange={this.handlePathChange}
                toggleCollapse={this.toggleCollapse}
                save={this.handleSaveButton}
                cancel={this.cancel}
                isWorkflowEditorUnlocked={this.props.isWorkflowEditorUnlocked}
            />
            {this.state.showSaveModal && this.renderSavePopupModal()}
        </>
    }
}
