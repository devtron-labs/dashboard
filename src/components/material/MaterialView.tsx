import React, { Component } from 'react';
import ReactSelect, { components } from 'react-select';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as Down } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { Progressing, Checkbox } from '../common';
import { MaterialViewProps } from './material.types';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import error from '../../assets/icons/misc/errorInfo.svg';
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'

export class MaterialView extends Component<MaterialViewProps, {}> {


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
        return <div className="white-card white-card--add-new-item mb-16" onClick={this.props.toggleCollapse}>
            <Add className="icon-dim-24 mr-5 fcb-5 vertical-align-middle" />
            <span className="artifact__add">Add Git Material</span>
        </div>
    }

    renderForm() {
        return <form key={`${(this.props.material).id}`} className="white-card p-20 mb-16">
            <div className="mb-20 cn-9 fs-16 fw-6 white-card__header--form">
                {(this.props.material).id ? "Edit Git Material" : "Add Git Material"}
                {(this.props.material).id ? <button type="button" className="transparent collapse-button" tabIndex={0} onClick={this.props.toggleCollapse}>
                    <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(180deg)' }} />
                </button> : null}
            </div>
            <div className="form__row form-row__material">
                <div className="">
                    <label className="form__label">Git Account*</label>
                    <ReactSelect className=""
                        tabIndex='1'
                        isMulti={false}
                        isClearable={false}
                        options={this.props.providers}
                        getOptionLabel={option => `${option.name}`}
                        getOptionValue={option => `${option.id}`}
                        value={this.props.material.gitProvider}
                        styles={{
                            valueContainer: (base, state) => ({
                                ...base,
                                color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
                            }),
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
                                    <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="react-select__bottom p-10 cb-5 block fw-5 anchor cursor no-decor">
                                        <Add className="icon-dim-20 mr-5 fcb-5 mr-12 vertical-align-bottom" />
                                        Add Git Provider
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

                        onChange={(selected) => { this.props.handleProviderChange(selected) }}
                    />
                    {this.props.isError.gitProvider && <span className="form__error">
                        <img src={error} className="form__icon" />
                        {this.props.isError.gitProvider}
                    </span>}
                </div>
                <div>
                    <label className="form__label">Git Repo URL*</label>
                    <input className="form__input"
                        autoComplete={"off"}
                        autoFocus
                        name="Git Repo URL*"
                        type="text"
                        placeholder="e.g. https://gitlab.com/abc/xyz.git"
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
                    onChange={this.props.handleCheckbox}
                    rootClassName="fs-12 cn-7 mb-8 flex left">
                    <span className="">Set Checkout Path (*Required If you’re using multiple Git Materials)</span>
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
            </label>
            <div className="form__buttons">
                {this.props.isMultiGit ?
                    <button type="button" className="cta cancel mr-16" onClick={this.props.cancel}>Cancel</button>
                    : null}
                <button type="button" className="cta" disabled={this.props.isLoading}
                    onClick={this.props.save}>
                    {this.props.isLoading ? <Progressing /> : "Save"}
                </button>
            </div>
        </form>
    }

    render() {
        if (this.props.isCollapsed) {
            return this.renderCollapsedView();
        }
        else {
            return this.renderForm();
        }
    }
}