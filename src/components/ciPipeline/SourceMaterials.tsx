import React from 'react';
import { Select } from '../common';
import { TagOptions, SourceTypeReverseMap, SourceTypeMap } from '../../config';
import ReactSelect from 'react-select';
import error from '../../assets/icons/misc/errorInfo.svg'
import git from '../../assets/icons/git/git.svg';

interface SourceMaterialsProps {
    materials: any[];
    showError: boolean;
    validationRules?;
    selectSourceType?: (event, gitMaterialId) => void;
    handleSourceChange?: (event, gitMaterialId) => void;
}

export const SourceMaterials: React.FC<SourceMaterialsProps> = function (props) {

    return <>
        <p className="cn-9 fw-6 fs-14 lh-1-43 mb-18">Select code source</p>
        {props.materials.map((mat, index) => {
            let errorObj = props.validationRules?.sourceValue(mat.value);
            return <div className="" key={mat.gitMaterialId}>
                <div className="mb-10">
                    <img src={git} alt="" className="ci-artifact__icon" />
                    {mat.name}
                </div>
                <div className="flex mt-10">
                    <div className="flex-1 mr-16 ">
                        <label className="form__label">Source Type*</label>
                        {/* <ReactSelect options={TagOptions}
                            isMulti={false}
                            isSearchable={false}
                        /> */}
                        <Select rootClassName="popup-body--source-info"
                            disabled={!!mat.id} onChange={(event) => props?.selectSourceType(event, mat.gitMaterialId)} >
                            <Select.Button rootClassName="select-button default" disabled={!props.selectSourceType}>{SourceTypeReverseMap[mat.type] || "Select Source Type"}</Select.Button>
                            {TagOptions.map((tag) => {
                                return <Select.Option key={tag.value} value={tag.value}>{tag.label}</Select.Option>
                            })}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <label className="form__label">
                            {mat.type === SourceTypeMap.BranchFixed ? "Branch Name*" : "Source Value*"}
                        </label>
                        <input className="form__input" autoComplete="off" placeholder="Name" type="text"
                            disabled={!props.handleSourceChange}
                            value={mat.value}
                            onChange={(event) => { props?.handleSourceChange(event, mat.gitMaterialId) }} />
                        {props.showError && !errorObj.isValid ? <span className="form__error">
                            <img src={error} className="form__icon" />
                            {props.validationRules?.sourceValue(props.materials[index].value).message}
                        </span> : null}
                    </div>
                </div>
            </div>
        })}
    </>
}