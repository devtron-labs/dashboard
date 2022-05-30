import React, { Component } from 'react';
import ReactSelect, { components } from 'react-select';
import { Progressing, Checkbox, multiSelectStyles } from '../common';
import { MaterialViewProps, MaterialViewState } from './material.types';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import error from '../../assets/icons/misc/errorInfo.svg';
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as Down } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import Tippy from '@tippyjs/react';
import { sortObjectArrayAlphabetically } from '../common/helpers/Helpers';
import DeleteComponent from '../../util/DeleteComponent';
import {deleteMaterial} from './material.service';
import { DeleteComponentsName, DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE, DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE } from '../../config/constantMessaging';
export class MaterialView extends Component<MaterialViewProps, MaterialViewState> {

    constructor(props) {
      super(props)

      this.state = {
         deleting: false,
         confirmation: false,
      }
    }

    toggleConfirmation = () => {
        this.setState((prevState)=>{
           return{ confirmation: !prevState.confirmation}
           })
    }

    setDeleting = () => {
        this.setState({
            deleting: !this.state.deleting
        })
    }

    renderCollapsedView() {
        if ((this.props.material).id) {
            return <div key={`${(this.props.material).id}`} className="white-card artifact-collapsed" tabIndex={0}
                onClick={this.props.toggleCollapse}>
                <span className="mr-8">
                    {this.props.material.url.includes("gitlab") ? <GitLab /> : null}
                    {this.props.material.url.includes("github") ? <GitHub /> : null}
                    {this.props.material.url.includes("bitbucket") ? <BitBucket /> : null}
                    {this.props.material.url.includes("gitlab") || this.props.material.url.includes("github") || this.props.material.url.includes("bitbucket") ? null : <Git />}
                </span>
                <div className="">
                    <div className="git__provider">{(this.props.material).name}</div>
                    <p className="git__url">{this.props.material.url}</p>
                </div>
                <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(0deg)' }} />
            </div>
        }
        return <div className="white-card white-card--add-new-item mb-16 dashed" onClick={this.props.toggleCollapse}>
            <Add className="icon-dim-24 mr-5 fcb-5 vertical-align-middle" />
            <span className="artifact__add">Add Git Repository</span>
        </div>
    }

    gitAuthType = (key) => {
        const res = this.props.providers?.filter((provider) => provider?.id === this.props.material?.gitProvider?.id) || []
        if (key === "host") { return res[0]?.authMode == "SSH" ? "ssh" : "https" }
        if (key === "placeholder") {
            return res[0]?.authMode == "SSH" ? "e.g. git@github.com:abc/xyz.git" : "e.g. https://gitlab.com/abc/xyz.git"
        }
    }

    getMaterialPayload = () => {
       return{ appId: this.props.appId,
        material : {
            id: this.props.material.id,
            url: this.props.material.url,
            checkoutPath: this.props.material.checkoutPath,
            gitProviderId: this.props.material.gitProvider.id,
            fetchSubmodules: this.props.material.fetchSubmodules ? true : false
        }
    }
    }

    renderForm() {
        const sortedProviders: any[] = this.props.providers? sortObjectArrayAlphabetically(this.props.providers,"name") : [];
        return <form key={`${(this.props.material).id}`} className="white-card p-20 mb-16">
            <div className="mb-20 cn-9 fs-16 fw-6 white-card__header--form">
                {(this.props.material).id ? "Edit Git Repository" : "Add Git Repository"}
                {(this.props.material).id ? <button type="button" className="transparent collapse-button" tabIndex={0} onClick={this.props.toggleCollapse}>
                    <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(180deg)' }} />
                </button> : null}
            </div>
            <div className="form__row form-row__material">
                <div className="">
                    <label className="form__label">Git Account*</label>
                    <ReactSelect className="m-0"
                        tabIndex={1}
                        isMulti={false}
                        isClearable={false}
                        options={sortedProviders}
                        getOptionLabel={option => `${option.name}`}
                        getOptionValue={option => `${option.id}`}
                        value={this.props.material.gitProvider}
                        styles={{
                            ...multiSelectStyles,
                            menuList: (base) => {
                                return {
                                    ...base,
                                    position: 'relative',
                                    paddingBottom: '0px',
                                    maxHeight: '250px',
                                }
                            }
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option: (props) => {
                                props.selectProps.styles.option = getCustomOptionSelectionStyle()
                                return <components.Option {...props}>
                                    {props.data.url.includes("gitlab") ? <GitLab className="mr-8 vertical-align-middle icon-dim-20" /> : null}
                                    {props.data.url.includes("github") ? <GitHub className="mr-8 vertical-align-middle icon-dim-20" /> : null}
                                    {props.data.url.includes("bitbucket") ? <BitBucket className="mr-8 vertical-align-middle icon-dim-20" /> : null}
                                    {props.data.url.includes("gitlab") || props.data.url.includes("github") || props.data.url.includes("bitbucket") ? null : <Git className="mr-8 vertical-align-middle icon-dim-20" />}

                                    {props.label}
                                </components.Option>
                            },
                            MenuList: (props) => {
                                return <components.MenuList {...props}>
                                    {props.children}
                                    <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="border-top react-select__bottom bcn-0 p-10 cb-5 block fw-5 anchor cursor no-decor">
                                        <Add className="icon-dim-20 fcb-5 mr-12 vertical-align-bottom" />
                                        Add Git Account
                                    </NavLink>
                                </components.MenuList>
                            },
                            Control: (props) => {
                                let value = "";

                                if (props.hasValue) {
                                    value = props.getValue()[0].url;
                                }
                                let showGit = value && !value.includes("github") && !value.includes("gitlab") && !value.includes("bitbucket")
                                return <components.Control {...props}>

                                    {value.includes("github") ? <GitHub className="icon-dim-20 ml-8" /> : null}
                                    {value.includes("gitlab") ? <GitLab className="icon-dim-20 ml-8" /> : null}
                                    {value.includes("bitbucket") ? <BitBucket className="icon-dim-20 ml-8" /> : null}
                                    {showGit ? <Git className="icon-dim-20 ml-8" /> : null}
                                    {props.children}
                                </components.Control>

                            },
                        }}

                        onChange={(selected) => { this.props.handleProviderChange(selected, this.props.material.url) }}
                    />
                    {this.props.isError.gitProvider && <span className="form__error">
                        <img src={error} className="form__icon" />
                        {this.props.isError.gitProvider}
                    </span>}
                </div>
                <div>
                    <label className="form__label">Git Repo URL* (use {this.gitAuthType("host")})
                    </label>
                    <input className="form__input"
                        autoComplete={"off"}
                        autoFocus
                        name="Git Repo URL*"
                        type="text"
                        placeholder={this.gitAuthType("placeholder")}
                        value={`${this.props.material.url}`}
                        onChange={this.props.handleUrlChange} />
                    <span className="form__error">
                        {this.props.isError.url && <>
                            <img src={error} className="form__icon" />{this.props.isError.url}
                        </>}
                    </span>
                </div>

            </div>

            <label className="form__row">
                <Checkbox
                    isChecked={this.props.isChecked}
                    value={"CHECKED"}
                    tabIndex={3}
                    onChange={this.props.handleCheckoutPathCheckbox}
                    rootClassName="fs-14 cn-9 mb-8 flex left ">
                    <span className="ml-12">Set Checkout Path (*Required If you’re using multiple Git Repositories)</span>
                </Checkbox>
                {this.props.isChecked ?
                    <input className="form__input"
                        autoComplete={"off"}
                        autoFocus
                        type="text"
                        placeholder="e.g. /abc"
                        value={this.props.material.checkoutPath}
                        onChange={this.props.handlePathChange} /> : ""}
                <span className="form__error">
                    {this.props.isError.checkoutPath && <> <img src={error} className="form__icon" /> {this.props.isError.checkoutPath}</>}
                </span>
                <div className="pt-16 ">
                    <Checkbox
                        isChecked={this.props.material.fetchSubmodules}
                        value={"CHECKED"}
                        tabIndex={4}
                        onChange={this.props.handleSubmoduleCheckbox}
                        rootClassName="fs-14 cn-9 flex top">
                        <div className="ml-12">
                            <span className="mb-4 mt-4 flex left">
                                Pull submodules recursively
                                <Tippy className="default-tt w-200" arrow={false} placement="bottom" content={'This will use credentials from default remote of parent repository.'}>
                                    <Question className="icon-dim-16 ml-4" />
                                </Tippy>
                            </span>
                            <div className=" fs-12" style={{ color: "#404040" }}>Use this to pull submodules recursively while building the code</div>
                        </div>
                    </Checkbox>
                </div>
            </label>
            <div className={`form__buttons`}>
                    {this.props.material.id && (
                            <button className="cta delete m-auto ml-0" type="button" onClick={() => this.toggleConfirmation()}>
                                {this.state.deleting ? <Progressing /> : 'Delete'}
                            </button>
                    )}
                        {this.props.isMultiGit ? (
                            <button type="button" className="cta cancel mr-16" onClick={this.props.cancel}>
                                Cancel
                            </button>
                        ) : null}
                        <button type="button" className="cta" disabled={this.props.isLoading} onClick={this.props.save}>
                            {this.props.isLoading ? <Progressing /> : 'Save'}
                        </button>
                </div>
             {this.state.confirmation &&
              <DeleteComponent
                    setDeleting={this.setDeleting}
                    deleteComponent={deleteMaterial}
                    payload={this.getMaterialPayload()}
                    title={this.props.material.name}
                    toggleConfirmation={this.toggleConfirmation}
                    component={DeleteComponentsName.MaterialView}
                    confirmationDialogDescription={this.props.isMultiGit ? DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE : DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE}
                    reload={this.props.reload}
          />
             }
        </form>
    }

    render() {
       return this.props.isCollapsed ? this.renderCollapsedView()  : this.renderForm()
    }
}