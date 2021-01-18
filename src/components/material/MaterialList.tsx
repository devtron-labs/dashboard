import React, { Component } from 'react';
import { getGitProviderListAuth, getSourceConfig } from '../../services/service';
import { ErrorScreenManager, Progressing, showError } from '../common';
import { AppConfigStatus, ViewType } from '../../config';
import { withRouter } from 'react-router';
import { CreateMaterial } from './CreateMaterial';
import { UpdateMaterial } from './UpdateMaterial';
import { MaterialListProps, MaterialListState } from './material.types';
import './material.css';

class MaterialList extends Component<MaterialListProps, MaterialListState> {

    constructor(props) {
        super(props);
        this.state = {
            statusCode: 0,
            view: ViewType.LOADING,
            configStatus: AppConfigStatus.LOADING,
            materials: [],
            providers: [],
        }
        this.isCheckoutPathValid = this.isCheckoutPathValid.bind(this);
        this.refreshMaterials = this.refreshMaterials.bind(this);
    }

    componentDidMount() {
        Promise.all([getSourceConfig(this.props.match.params.appId), getGitProviderListAuth(this.props.match.params.appId)]).then(([sourceConfigRes, providersRes]) => {
            let materials = sourceConfigRes.result.material || [];
            let providers = providersRes.result;
            materials = materials.map((mat) => {
                return {
                    ...mat,
                    gitProvider: providers.find(p => mat.gitProviderId === p.id),
                }
            })
            this.setState({
                materials: materials,
                providers: providersRes.result,
                view: ViewType.FORM,
            });
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    static getDerivedStateFromProps(props, state) {
        if (props.configStatus !== state.configStatus) {
            return {
                ...state,
                configStatus: props.configStatus,
            };
        }
        return null;
    }

    refreshMaterials() {
        console.log("a")
        console.log(this)
        getSourceConfig(this.props.match.params.appId).then((response) => {
            console.log(response.result)
            let materials = response.result.materials.map((mat) => {
                return {
                    ...mat,
                    gitProvider: this.state.providers.find(p => mat.gitProviderId === p.id),
                }
            })
            this.setState({
                materials: materials,
            });
        })
    }

    isCheckoutPathValid(checkoutPath: string) {
        if (!checkoutPath.startsWith("./"))
            return { message: "Invalid Path", result: 'error', isValid: false };
        if (this.state.materials.length > 1) {
            let isValid = this.state.materials.reduce((isValid: boolean, artifact) => {
                return (isValid && artifact.checkoutPath.length > 0)
            }, true);
            return { isValid, message: isValid ? '' : 'Mandatory for using multi-git' };
        }
        return { isValid: true, message: '' };
    }

    renderPageHeader() {
        return <>
            <h1 className="form__title form__title--artifacts">Git Materials</h1>
            <p className="form__subtitle form__subtitle--artifacts">Manage source code repositories for this application.</p>
        </>
    }

    render() {
        if (this.state.view == ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view == ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.statusCode} />
        }
        else {
            return <div className="form__app-compose">
                {this.renderPageHeader()}
                <CreateMaterial appId={Number(this.props.match.params.appId)}
                    isMultiGit={this.state.materials.length > 0}
                    providers={this.state.providers}
                    refreshMaterials={this.refreshMaterials}
                    isCheckoutPathValid={this.isCheckoutPathValid} />
                {this.state.materials.map((mat, index) => {
                    return <UpdateMaterial appId={Number(this.props.match.params.appId)}
                        isMultiGit={this.state.materials.length > 0}
                        refreshMaterials={this.refreshMaterials}
                        providers={this.state.providers}
                        material={mat}
                        isCheckoutPathValid={this.isCheckoutPathValid} />

                })}
            </div>
        }
    }
}

export default withRouter(MaterialList);
