import React from 'react';
import { Select } from '../common';
import { SourceTypeMap, URLS } from '../../config';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { components } from 'react-select';
import { MaterialType, Githost, WebhookEvent, CiPipelineSourceTypeOption } from './types';
import { Link } from 'react-router-dom'
import ReactSelect from 'react-select';
import error from '../../assets/icons/misc/errorInfo.svg';
import git from '../../assets/icons/git/git.svg';
import { reactSelectStyles } from './ciPipeline.util';
import { DropdownIndicator } from '../charts/charts.util';
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline.svg';

interface SourceMaterialsProps {
    materials: MaterialType[];
    showError: boolean;
    validationRules?;
    selectSourceType?: (event, gitMaterialId) => void;
    handleSourceChange?: (event, gitMaterialId) => void;
    includeWebhookEvents: boolean;
    ciPipelineSourceTypeOptions: CiPipelineSourceTypeOption[];
}

export const SourceMaterials: React.FC<SourceMaterialsProps> = function (props) {
    const isMultiGit = props.materials.length > 1;

    function MenuList(_props) {
        return <components.MenuList {..._props}>
            {_props.children}
            {props.includeWebhookEvents && isMultiGit &&
                <div className="bcv-1 p-8 br-4 ml-8 mr-8 mb-4">
                    <p className="m-0">
                        <div className="flex left">
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                        If you need webhook based CI for apps with multiple code sources,&nbsp;</div>
                        <a className="learn-more__href ml-4" href="https://github.com/devtron-labs/devtron/issues" target="_blank" rel="noreferrer noopener">Create a github issue</a>
                    </p>
                </div>
            }
            {props.includeWebhookEvents && !isMultiGit && !props.materials[0].gitHostId &&
                <div className="bcv-1 p-8 br-4 ml-8 mr-8 mb-4">
                    <p className="m-0">
                        <div className="flex left">
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                        Select git host for this git account to view all supported options.&nbsp;</div>
                        <Link className="learn-more__href" to={URLS.GLOBAL_CONFIG_GIT} target="_blank">Select git host</Link>
                    </p>
                </div>
            }
            {props.includeWebhookEvents && !isMultiGit && (props.materials[0].gitHostId > 0) &&
                <div className="bcv-1 p-8 br-4 ml-8 mr-8 mb-4 flex left">
                    <p className="m-0">
                        <div className="flex left">
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                          If you want to trigger CI using any other mechanism,&nbsp;</div>
                        <a className="learn-more__href ml-4" href="https://github.com/devtron-labs/devtron/issues" target="_blank" rel="noreferrer noopener" >Create a github issue</a>
                    </p>
                </div>
            }
        </components.MenuList>
    }

    function Option(_props) {
        const { selectOption, data } = _props;
        const onClick = (e) => selectOption(data);

        return <div className="pl-12" style={{ background: _props.isFocused ? 'var(--N100)' : 'transparent' }}>
            <div className="flex left">
                {_props.data.isSelected ? <Check onClick={onClick} className="mr-8 icon-dim-16 scb-5" /> : <span onClick={onClick} className="mr-8 icon-dim-16" />}
                <components.Option {..._props} >
                    {_props.children}
                </components.Option>
            </div>
        </div>
    };

    return <>
        <p className="cn-9 fw-6 fs-14 lh-1-43 mb-18">Select code source</p>
        {props.materials.map((mat, index) => {
            let selectedMaterial;

            if (props.ciPipelineSourceTypeOptions.length == 1) {
                selectedMaterial = props.ciPipelineSourceTypeOptions[0];
            } else {
                selectedMaterial = props.ciPipelineSourceTypeOptions.find(i => i.isSelected === true);
            }

            let errorObj = props.validationRules?.sourceValue(mat.value);

            return <div className="mt-20" key={mat.gitMaterialId}>
                <div className="mb-10 fs-14 cn-9 fw-5 lh-1-43">
                    <p className="m-0"><img src={git} alt="" className="ci-artifact__icon" />
                        {mat.name}
                    </p>
                </div>
                <div className="mt-16 flex left">
                    <div className="w-50 mr-8">
                        <label className="form__label mb-6">Source type*</label>
                        <ReactSelect
                            className="workflow-ci__source"
                            placeholder="Source Type"
                            isSearchable={false}
                            options={props.ciPipelineSourceTypeOptions}
                            value={selectedMaterial}
                            closeOnSelect={false}
                            onChange={(selected) => props?.selectSourceType(selected, mat.gitMaterialId)}
                            isClearable={false}
                            isDisabled={!!mat.id}
                            isMulti={false}
                            components={{
                                DropdownIndicator,
                                Option,
                                IndicatorSeparator: null,
                                ClearIndicator: null,
                                MenuList,
                            }}
                            styles={{ ...reactSelectStyles }} />
                    </div>
                    {mat.type !== SourceTypeMap.WEBHOOK ? <div className="w-50 ml-8">
                        <label className="form__label mb-6">
                            {mat.type === SourceTypeMap.BranchFixed ? "Branch Name*" : ""}
                        </label>
                        <input className="form__input" autoComplete="off" placeholder="Name" type="text"
                            disabled={!props.handleSourceChange}
                            value={mat.value}
                            onChange={(event) => { props?.handleSourceChange(event, mat.gitMaterialId) }} />
                        {props.showError && !errorObj.isValid ? <span className="form__error">
                            <img src={error} className="form__icon" />
                            {props.validationRules?.sourceValue(props.materials[index].value).message}
                        </span> : null}
                    </div> : ''}
                </div>
            </div>
        })}
    </>
}