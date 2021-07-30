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

interface SourceMaterialsProps {
    materials: MaterialType[];
    showError: boolean;
    validationRules?;
    selectSourceType?: (event, gitMaterialId) => void;
    handleSourceChange?: (event, gitMaterialId) => void;
    includeWebhookEvents : boolean;
    ciPipelineSourceTypeOptions : CiPipelineSourceTypeOption[];
}

export const SourceMaterials: React.FC<SourceMaterialsProps> = function (props) {
    const isMultiGit = props.materials.length > 1;

    function MenuList(props) {
        return <components.MenuList {...props}>
            {props.children}
            {isMultiGit && props.includeWebhookEvents ? <div className="bcv-1 p-8 br-4 ml-8 mr-8 mb-4">
                <p className="m-0">
                    Need a PR based build pipeline for apps with multiple git repos?
                    <a href="#" target="_blank" rel="noreferrer noopener" className="ml-5">Upvote github issue here</a>
                </p>
            </div> : ''}
        </components.MenuList>
    }

    function Option(props) {
        const { selectOption, data } = props;
        const onClick = (e) => selectOption(data);

        return <div className="pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            <div className="flex left">
                {props.isSelected ? <Check onClick={onClick} className="mr-8 icon-dim-16 scb-5" /> : <span onClick={onClick} className="mr-8 icon-dim-16" />}
                <components.Option {...props} >
                    {props.children}
                    {props.value === SourceTypeMap.WEBHOOK && isMultiGit ? <p className="cr-5 fs-11 m-0">Not supported for applications with multiple git repos</p> : ''}
                </components.Option>

            </div>
        </div>
    };

    return <>
        <p className="cn-9 fw-6 fs-14 lh-1-43 mb-18">Select code source</p>
        {props.materials.map((mat, index) => {
            let selectedMaterial;

            if(props.ciPipelineSourceTypeOptions.length == 1){
                selectedMaterial = props.ciPipelineSourceTypeOptions[0];
            }else{
                selectedMaterial = props.ciPipelineSourceTypeOptions.find(i => i.isSelected === true);
            }

            let errorObj = props.validationRules?.sourceValue(mat.value);

            return <div className="mt-20" key={mat.gitMaterialId}>
                <div className="mb-10 fs-14 cn-9 fw-5 lh-1-43">
                    <p className="m-0"><img src={git} alt="" className="ci-artifact__icon" />
                        {mat.name}
                    </p>
                    {props.includeWebhookEvents && !isMultiGit && !mat.gitHostId ? <p className="cr-5 fs-12 mt-0 mb-0 ml-28">
                        <span className="cr-5 mr-5">Git host is not selected for this account.</span>
                        <Link to={URLS.GLOBAL_CONFIG_GIT}>Click here to select git host</Link>
                    </p> : ''}
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
                                IndicatorSeparator: null,
                                ClearIndicator: null,
                                Option: Option,
                                MenuList: MenuList,
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
                    </div>: ''}
                </div>
            </div>
        })}
    </>
}