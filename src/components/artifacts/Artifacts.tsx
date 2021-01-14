import React, { Component } from 'react';
import { getGitProviderListAuth, getSourceConfig } from '../../services/service';
import { createMaterial, updateMaterial } from './service';
import { toast } from 'react-toastify';
import { ErrorScreenManager, Progressing, ButtonWithLoader } from '../common';
import { AppConfigStatus, URLS, ViewType } from '../../config';
import { ValidationRules } from './validationRules';
import { ArtifactsProps, Material, ArtifactsState } from './types';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import down from '../../assets/icons/appstatus/ic-dropdown.svg';
import error from '../../assets/icons/misc/errorInfo.svg';
import ReactSelect, { components } from 'react-select';
import './artifacts.css';

export const DefaultEmptyMaterial = {
    id: null,
    name: "",
    url: "",
    gitProviderId: 0,
    checkoutPath: "",
    providers: [],
    isCollapsed: false
}

class Artifacts extends Component<ArtifactsProps, ArtifactsState> {
    rules;
    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            materials: [DefaultEmptyMaterial],
            materialsFromResponse: [DefaultEmptyMaterial],
            configStatus: AppConfigStatus.LOADING,
            loadingData: false,
        }
        this.rules = new ValidationRules();
    }

    componentDidMount() {
        this.getMaterialList();
    }

    static getDerivedStateFromProps(props, state) {
        if (props.configStatus !== state.configStatus) {
            return {
                configStatus: props.configStatus,
                code: state.code,
                materials: state.materials
            };
        }
        return null;
    }

    handleChange(event, materialId: number, key: string) {
        let materials = this.state.materials.map((material) => {
            if (material.id == materialId) {
                material[key] = event.target.value;
            }
            return material;
        })
        this.setState({ materials });
    }

    toggleCollapse = (materialId: number) => {
        let materials = this.state.materials.map((material) => {
            return {
                ...material,
                isCollapsed: (material.id == materialId) ? !material.isCollapsed : material.isCollapsed,
            }
        })
        this.setState({ materials });
    }

    selectProvider = (selecteMaterial, materialId) => {
        let materials = this.state.materials.map((material) => {
            return {
                ...material,
                gitProviderId: selecteMaterial.id,
                providers: (material.id == materialId) ? material.providers.map((provider) => {
                    return {
                        ...provider,
                        active: provider.id == selecteMaterial.id
                    }
                }) : material.providers
            }
        })
        this.setState({ materials });
    }

    createMaterial(material) {
        this.rules.setShowErrors();
        this.setState({ code: 0, loadingData: true });
        let isCheckoutPathValid = this.rules.checkoutPath(this.state.materials).isValid;
        let isValid = isCheckoutPathValid && this.rules.url(material.url).isValid && this.rules.isGitProvider(material).isValid;

        if (!isCheckoutPathValid) {
            this.setState({ loadingData: false })
            toast.error('Please define Checkout Path in added artifacts to continue.')
        };
        if (!isValid) {
            this.setState({ loadingData: false })
            return
        };

        let request;
        let promise;
        if (material.id) {
            request = {
                appId: parseInt(this.props.match.params.appId),
                material: material,
            }
            promise = updateMaterial(request).then((response) => {
                toast.success("Artifact Saved Successfully");
                let newMat = response.result.material;
                let materialList = this.state.materials.map(mat => {
                    if (mat.id === newMat.id) {
                        return {
                            ...mat,
                            isCollapsed: true,
                            providers: mat.providers.map((prov) => {
                                return {
                                    ...prov,
                                    active: prov.id === mat.gitProviderId
                                }
                            })
                        }
                    }
                    return mat;
                })
                this.setState({
                    code: response.code,
                    materials: materialList,
                    loadingData: false
                }, () => {
                    this.rules.clearShowErrors();
                })
            })
        }
        else {
            request = {
                appId: parseInt(this.props.match.params.appId),
                material: [material],
            }
            promise = createMaterial(request).then((response) => {
                toast.success("Artifact Saved Successfully");
                let newMat = response.result.material[0];
                newMat['isCollapsed'] = true;
                newMat['providers'] = this.state.materials[0].providers.map((prov) => {
                    return {
                        ...prov,
                        active: prov.id === newMat.gitProviderId
                    }
                })
                let materialList = [...this.state.materials, newMat];
                materialList = materialList.filter(mat => mat.id);
                this.setState({
                    code: response.code,
                    materials: materialList,
                    loadingData: false
                }, () => {
                    this.rules.clearShowErrors();
                })
                this.props.respondOnSuccess();
            })
        }
        promise.catch((error) => {
            if (Array.isArray(error.errors)) {
                error.errors.map((err) => toast.error(err.userMessage))
                this.setState({ loadingData: false });
            }
        })
    }

    //TODO: pass response in second then, avoid 2 set States
    getMaterialList() {
        getSourceConfig(this.props.match.params.appId).then((response) => {
            let materials = response.result && response.result.material
                ? response.result.material.map((material) => {
                    return {
                        ...material,
                        providers: [],
                        isCollapsed: true
                    }
                }) : [DefaultEmptyMaterial]
            materials = materials.reverse();
            this.setState({ materials, materialsFromResponse: materials });
        }).then(() => {
            this.getProviderList();
        }).catch((error) => {
            if (Array.isArray(error.errors)) {
                error.errors.map((err) => toast.error(err.userMessage))
            }

        })
    }

    getProviderList() {
        getGitProviderListAuth(this.props.match.params.appId).then((response) => {
            let materials = this.state.materials.map((material) => {
                return {
                    ...material,
                    providers: response.result ? response.result.map((provider) => {
                        return {
                            ...provider,
                            iconClass: 'git__icon',
                            active: material.gitProviderId == provider.id
                        }
                    }) : []
                }
            })
            this.setState({ materials, materialsFromResponse: materials, view: ViewType.FORM });
        })
    }

    discardChanges(material: Material & { isCollapsed: boolean }) {
        let materials = [];
        if (!material.id) {
            let providers = material.providers.map((prov) => {
                return {
                    ...prov,
                    active: false
                }
            });
            //remove unsaved material
            materials = this.state.materialsFromResponse.filter(mat => !!mat.id);
            if (!materials || materials.length == 0) {
                materials = [{
                    ...DefaultEmptyMaterial,
                    providers,
                    isCollapsed: false
                }]
            }

        }
        else {
            let oldMaterial = this.state.materialsFromResponse.find(mat => mat.id == material.id);
            materials = this.state.materials.map((element) => {
                if (element.id == material.id) return {
                    ...oldMaterial,
                    isCollapsed: true
                }
                else return element;
            })
        }
        this.setState({ materials });
        this.rules.clearShowErrors();
    }

    addEmptyArtifact() {
        let { materials } = { ...this.state };
        materials.unshift({
            ...DefaultEmptyMaterial,
            providers: materials[0].providers.map((provider) => {
                return {
                    ...provider,
                    active: false
                }
            })
        })
        this.setState({ materials });
    }

    renderPageHeader() {
        return <>
            <h1 className="form__title form__title--artifacts">Git Materials</h1>
            <p className="form__subtitle form__subtitle--artifacts">Manage source code repositories for this application.&nbsp;
                 <a rel="noreferrer noopener" href="https://docs.devtron.ai/creating-application/git-material" target="_blank" className="">Learn more about Git Material</a>
            </p>
        </>
    }

    renderMaterial(material, index) {
        if (material.isCollapsed) {
            let provider = material.providers.find(prov => prov.active);
            let title = provider ? provider.name : "";
            return <div key={`${index}-${material.name}`} className="white-card artifact-collapsed"
                onClick={() => { this.toggleCollapse(material.id) }}>
                <span className="git__icon"></span>
                <div className="">
                    <div className="git__provider">{title}</div>
                    <p className="git__url">{material.url}</p>
                </div>
                <img src={down} className="collapsed__icon" alt="collapsed" />
            </div>
        }
        else {
            let errorObject = [this.rules.isGitProvider(material), this.rules.url(material.url), this.rules.checkoutPath(this.state.materials)];
            let showError = this.rules.getShowErrors();
            let provider = material.providers.find(prov => prov.active);
            return <div key={`${index}-${material.name}`} className="white-card p-24 mb-16">
                <div className="white-card__header white-card__header--form">
                    {material.id ? "Edit Material" : "Add Material"}
                    {material.id ? <button type="button" className="transparent collapse-button" tabIndex={index + 0} onClick={() => { this.toggleCollapse(material.id) }}>
                        <img src={down} className="collapsed__icon" style={{ transform: 'rotateX(180deg)' }} alt="collapsed" />
                    </button> : null}
                </div>

                <label className="form__row">
                    <span className="form__label">Select Provider*</span>
                    <ReactSelect className=""
                        tabIndex='1'
                        isMulti={false}
                        isClearable={false}
                        value={provider}
                        options={material.providers}
                        getOptionLabel={option => `${option.name}`}
                        getOptionValue={option => `${option.id}`}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                border: state.isFocused ? '1px solid #0066CC' : '1px solid #d6dbdf',
                                boxShadow: 'none',
                                fontWeight: 'normal',
                                height: "40px"
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                fontWeight: "normal",
                                color: 'var(--N900)',
                                padding: '8px 12px',
                            }),
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option: (props) => {
                                return <components.Option {...props}>
                                    {props.isSelected ? <Check className="icon-dim-16 vertical-align-middle scb-5 mr-8" /> : <span className="inline-block icon-dim-16 mr-8"></span>}
                                    {props.label}
                                </components.Option>
                            },
                            MenuList: (props) => {
                                return <components.MenuList {...props}>
                                    {props.children}
                                    <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="react-select__bottom p-10 cb-5 block fw-5 anchor cursor no-decor">
                                        <Add className="icon-dim-20 mr-5 fcb-5 mr-12 vertical-align-bottom" />
                                        Add Git Provider
                                    </NavLink>
                                </components.MenuList>
                            },
                        }}
                        onChange={(selected) => { this.selectProvider(selected, material.id) }} />
                    <span className="form__error">
                        {showError && !errorObject[0].isValid ? <img src={error} className="form__icon" /> : null} {errorObject[0].message}
                    </span>
                </label>

                <label className="form__row">
                    <span className="form__label">Git Repo URL*</span>
                    <input autoComplete="off" className="form__input" placeholder="e.g. https://gitlab.com/abc/xyz.git" type="text" value={material.url}
                        tabIndex={index + 2} onChange={(event) => { this.handleChange(event, material.id, 'url') }} />
                    <span className="form__error">
                        {showError && !errorObject[1].isValid ? <img src={error} className="form__icon" /> : null}{errorObject[1].message}
                    </span>
                </label>

                <label className="form__row">
                    <label className="form__label">Checkout Path(*Required If you’re using multiple Git Materials)</label>
                    <input autoComplete="off" className="form__input" placeholder="e.g. /abc" tabIndex={index + 3} type="text" value={material.checkoutPath}
                        onChange={(event) => { this.handleChange(event, material.id, 'checkoutPath') }} />
                    <span className="form__error">
                        {showError && !errorObject[2].isValid ? <img src={error} className="form__icon" /> : null}{errorObject[2].message}
                    </span>
                </label>

                <div className="form__buttons">
                    <button type="button" className="cta cancel mr-16" onClick={() => { this.discardChanges(material) }}>Cancel</button>
                    <ButtonWithLoader rootClassName="cta-with-img"
                        loaderColor="#ffffff"
                        isLoading={this.state.loadingData}
                        onClick={() => { this.createMaterial(material) }}>
                        Save
                    </ButtonWithLoader>
                </div>
            </div>
        }
    }

    renderAddArtifact() {
        let anyUnsavedArtifact = this.state.materials.find(mat => !mat.id);

        if (anyUnsavedArtifact) {

        }
        else return <div className="white-card white-card--add-new-item mb-16"
            onClick={() => { this.addEmptyArtifact() }}>
            <Add className="icon-dim-24 mr-5 fcb-5 vertical-align-middle" />
            <span className="artifact__add">Add Material</span>
        </div>
    }

    render() {
        let materials = this.state.materials;
        if (this.state.view == ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view == ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        }
        else {
            return <div className="form__app-compose">
                {this.renderPageHeader()}
                {this.renderAddArtifact()}
                {materials.map((material, index) => {
                    return this.renderMaterial(this.state.materials[index], index);
                })}
            </div>
        }
    }
}

export default withRouter(Artifacts)