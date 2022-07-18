import React from 'react'
import { SourceTypeMap, URLS } from '../../config'
import { components } from 'react-select'
import { Link } from 'react-router-dom'
import ReactSelect from 'react-select'
import error from '../../assets/icons/misc/errorInfo.svg'
import git from '../../assets/icons/git/git.svg'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { DropdownIndicator } from '../charts/charts.util'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline-purple.svg'
import { ConfigureWebhook } from './ConfigureWebhook'
import { MaterialType, CiPipelineSourceTypeOption, Githost, SourceMaterialsProps } from './types'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { reactSelectStyles } from '../CIPipelineN/ciPipeline.utils'

export const SourceMaterials: React.FC<SourceMaterialsProps> = function (props) {
    const isMultiGit = props.materials.length > 1
    let _materials = props.materials
    let _webhookTypeMaterial = _materials.find((_material) => _material.type == SourceTypeMap.WEBHOOK)

    if (isMultiGit && _webhookTypeMaterial) {
        _materials = []
        _materials.push(_webhookTypeMaterial)
    }

    function MenuList(_props) {
        return (
            <components.MenuList {..._props}>
                {_props.children}
                {props.includeWebhookEvents && isMultiGit && (
                    <div className="bcv-1 p-8 br-4 ml-8 mt-8 pt-8 mb-4 mr-8">
                        <span className="">
                            <Info className="icon-dim-20 mr-8 fcv-5" /> If you need webhook based CI for apps with
                            multiple code sources,
                        </span>
                        <a
                            className="learn-more__href ml-4"
                            href="https://github.com/devtron-labs/devtron/issues"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Create a github issue
                        </a>
                    </div>
                )}
                {props.includeWebhookEvents && !isMultiGit && !_materials[0].gitHostId && (
                    <div className="bcv-1 p-8 br-4 ml-8 pt-8 mr-8 mb-4 ">
                        <span className="flex left">
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                            Select git host for this git account to view all supported options.
                        </span>
                        <Link className="learn-more__href" to={URLS.GLOBAL_CONFIG_GIT} target="_blank">
                            Select git host
                        </Link>
                    </div>
                )}
                {props.includeWebhookEvents && !isMultiGit && _materials[0].gitHostId > 0 && (
                    <div className="bcv-1 p-8 br-4 ml-8 mr-8 mb-4 mt-8 ">
                        <span className="flex left">
                            {' '}
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                            If you want to trigger CI using any other mechanism,
                        </span>
                        <a
                            className="learn-more__href ml-4"
                            href="https://github.com/devtron-labs/devtron/issues"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Create a github issue
                        </a>
                    </div>
                )}
            </components.MenuList>
        )
    }

    function Option(_props) {
        const { selectProps, selectOption, data } = _props
        selectProps.styles.option = getCustomOptionSelectionStyle({
            backgroundColor: data.isSelected ? 'var(--B100)' : _props.isFocused ? 'var(--N100)' : 'white',
            color: data.isSelected ? 'var(--B500)' : 'var(--N900)',
        })

        return (
            <div className="flex left">
                <components.Option {..._props}>{_props.children}</components.Option>
            </div>
        )
    }

    return (
        <>
            <p className="cn-9 fw-6 fs-14 lh-1-43 mb-18">Select code source</p>
            {_materials.map((mat, index) => {
                let selectedMaterial

                if (props.ciPipelineSourceTypeOptions.length == 1) {
                    selectedMaterial = props.ciPipelineSourceTypeOptions[0]
                } else {
                    selectedMaterial =
                        props.ciPipelineSourceTypeOptions.find((i) =>
                            i.value === SourceTypeMap.WEBHOOK ? i.isSelected : i.value === mat.type,
                        ) || props.ciPipelineSourceTypeOptions[0]
                }
                let errorObj = props.validationRules?.sourceValue(mat.value)
                {
                    console.log(mat)
                }
                const isBranchRegex = mat.type === SourceTypeMap.BranchRegex
                const isBranchFixed = mat.type === SourceTypeMap.BranchFixed
                return (
                    <div key={`source-material-${index}`}>
                        <div className="mt-20" key={mat.gitMaterialId}>
                            <div className="mb-10 fs-14 cn-9 fw-5 lh-1-43">
                                <p className="m-0">
                                    <img src={git} alt="" className="ci-artifact__icon" />
                                    {mat.name}
                                </p>
                            </div>
                            <div className="mt-16 flex left">
                                <div className="w-50 mr-8">
                                    <label className="form__label mb-6">
                                        Source type <span className="cr-5"> *</span>
                                    </label>
                                    <ReactSelect
                                        className="workflow-ci__source"
                                        placeholder="Source Type"
                                        isSearchable={false}
                                        options={props.ciPipelineSourceTypeOptions}
                                        value={selectedMaterial}
                                        closeMenuOnSelect={false}
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
                                        styles={{
                                            ...reactSelectStyles,
                                            menu: (base, state) => ({
                                                ...base,
                                                top: 'auto',
                                            }),
                                        }}
                                        menuPortalTarget={document.getElementById('visible-modal')}
                                    />
                                    <div className="h-18"></div>
                                </div>
                                {isBranchFixed && (
                                    <div className="w-50 ml-8 left">
                                        <div>
                                            <label className="form__label mb-6">
                                                Branch Name<span className="cr-5"> *</span>
                                            </label>
                                            <input
                                                className="form__input"
                                                autoComplete="off"
                                                placeholder="Eg. main"
                                                type="text"
                                                disabled={!props.handleSourceChange}
                                                value={mat.value}
                                                onChange={(event) => {
                                                    props?.handleSourceChange(event, mat.gitMaterialId)
                                                }}
                                                autoFocus={true}
                                            />
                                        </div>
                                        {props.showError && !errorObj.isValid ? (
                                            <span className="form__error ci-error ">
                                                <img src={error} className="form__icon" />
                                                {props.validationRules?.sourceValue(_materials[index].value).message}
                                            </span>
                                        ) : (
                                            <div className="h-18"></div>
                                        )}
                                    </div>
                                )}

                                {isBranchRegex && (
                                    <div className="w-50 ml-8">
                                        <label className="form__label mb-6">
                                            Branch Regex<span className="cr-5"> *</span>
                                        </label>
                                        <input
                                            className="form__input"
                                            autoComplete="off"
                                            placeholder="Enter branch regex"
                                            type="text"
                                            disabled={!props.handleSourceChange}
                                            value={mat.value}
                                            onChange={(event) => {
                                                props?.handleSourceChange(event, mat.gitMaterialId)
                                            }}
                                            autoFocus={true}
                                        />
                                        {props.showError && !errorObj.isValid ? (
                                            <span className="form__error ci-error ">
                                                <img src={error} className="form__icon" />
                                                {props.validationRules?.sourceValue(_materials[index].value).message}
                                            </span>
                                        ) : (
                                            <div className="h-18"></div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isBranchRegex && (
                            <div className={`${props.showError && !errorObj.isValid ? 'mt-16' : ''}`}>
                                <InfoColourBar
                                    message={
                                        'Branch - Regex allows you to easily switch between branches matching the configured regex before triggering the build pipeline.'
                                    }
                                    classname={'info_bar'}
                                    Icon={InfoIcon}
                                />
                            </div>
                        )}

                        {props.includeWebhookEvents && mat.type == SourceTypeMap.WEBHOOK && (
                            <ConfigureWebhook
                                webhookConditionList={props.webhookData.webhookConditionList}
                                gitHost={props.webhookData.gitHost}
                                selectedWebhookEvent={props.webhookData.getSelectedWebhookEvent(mat)}
                                copyToClipboard={props.webhookData.copyToClipboard}
                                addWebhookCondition={props.webhookData.addWebhookCondition}
                                deleteWebhookCondition={props.webhookData.deleteWebhookCondition}
                                onWebhookConditionSelectorChange={props.webhookData.onWebhookConditionSelectorChange}
                                onWebhookConditionSelectorValueChange={
                                    props.webhookData.onWebhookConditionSelectorValueChange
                                }
                                canEditPipeline={props.canEditPipeline}
                            />
                        )}
                    </div>
                )
            })}
        </>
    )
}
