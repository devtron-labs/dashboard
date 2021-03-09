import React, { Component } from 'react';
import ReactSelect, { components } from 'react-select';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as Down } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { Progressing, Checkbox} from '../common';
import { MaterialViewProps } from './material.types';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import error from '../../assets/icons/misc/errorInfo.svg';

export class MaterialView extends Component<MaterialViewProps,{}> {
   

    renderCollapsedView() {
        if ((this.props.material).id) {
            return <div key={`${(this.props.material).id}`} className="white-card artifact-collapsed" tabIndex={0}
                onClick={this.props.toggleCollapse}>
                <span className="git__icon"></span>
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
                {(this.props.material).id ? "Edit Material" : "Add Material"}
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
                        onChange={(selected) => { this.props.handleProviderChange(selected) }} />
                    {this.props.isError.gitProvider && <span className="form__error">
                        <img src={error} className="form__icon" />
                        {this.props.isError.gitProvider}
                    </span>}
                </div>
                <div>
                    <label className="form__label">Git Repo URL*</label>
                    <input className="form__input"
                    name="Git Repo URL*"
                        type="text"
                        placeholder="e.g. https://gitlab.com/abc/xyz.git"
                        value={this.props.material.url}
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
                    rootClassName="form__label">
                    <span className="">Set Checkout Path(*Required If you’re using multiple Git Materials)</span>
                </Checkbox>
                {this.props.isChecked ? <input className="form__input"
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