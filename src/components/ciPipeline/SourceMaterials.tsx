import React, { useState } from 'react'
import { SourceTypeMap, URLS } from '../../config'
import { components } from 'react-select'
import { Link, useLocation } from 'react-router-dom'
import ReactSelect from 'react-select'
import error from '../../assets/icons/misc/errorInfo.svg'
import git from '../../assets/icons/git/git.svg'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { DropdownIndicator } from '../charts/charts.util'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline-purple.svg'
import { ConfigureWebhook } from './ConfigureWebhook'
import { SourceMaterialsProps } from './types'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { reactSelectStyles } from '../CIPipelineN/ciPipeline.utils'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { ConditionalWrap } from '../common'
import Tippy from '@tippyjs/react'

export const SourceMaterials: React.FC<SourceMaterialsProps> = function (props) {
    const [isProviderChanged, setProviderChanged] = useState(false)
    const isMultiGit = props.materials.length > 1
    const location = useLocation()
    const islinkedCI = location.pathname.includes('linked-ci')
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
                    <div className="flex top bcv-1 p-8 br-4 ml-8 mt-8 mb-4 mr-8">
                        <Info className="icon-dim-20 fcv-5" />
                        <div className="ml-8">
                            If you need webhook based CI for apps with multiple code sources,
                            <a
                                className="dc__link ml-4"
                                href="https://github.com/devtron-labs/devtron/issues"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                Create a github issue
                            </a>
                        </div>
                    </div>
                )}
                {props.includeWebhookEvents && !isMultiGit && !_materials[0].gitHostId && (
                    <div className="bcv-1 p-8 br-4 ml-8 pt-8 mr-8 mb-4 ">
                        <span className="flex left">
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                            Select git host for this git account to view all supported options.
                        </span>
                        <Link className="dc__link" to={URLS.GLOBAL_CONFIG_GIT} target="_blank">
                            Select git host
                        </Link>
                    </div>
                )}
                {props.includeWebhookEvents && !isMultiGit && _materials[0].gitHostId > 0 && (
                    <div className="bcv-1 p-8 br-4 ml-8 mr-8 mb-4 mt-8 ">
                        <span className="flex left">
                            <Info className="icon-dim-20 mr-8 fcv-5" />
                            If you want to trigger CI using any other mechanism,
                        </span>
                        <a
                            className="dc__link ml-4"
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

    function onBlur(e) {
        if (props.handleOnBlur) {
            props.handleOnBlur(e)
        }
    }

    return (
        <>
            <p className="cn-9 fw-6 fs-14 lh-1-43 mb-18">Select code source</p>
            {_materials.map((mat, index) => {
                const isBranchRegex = mat.type === SourceTypeMap.BranchRegex || mat.isRegex
                const isBranchFixed = mat.type === SourceTypeMap.BranchFixed && !mat.isRegex
                const _selectedWebhookEvent =
                    mat.type === SourceTypeMap.WEBHOOK && mat.value && props.webhookData?.getSelectedWebhookEvent(mat)
                let selectedMaterial

                if (props.includeWebhookEvents && mat.type === SourceTypeMap.WEBHOOK && !_selectedWebhookEvent) {
                    selectedMaterial = null

                    if (!isProviderChanged) {
                        mat.value = ''
                        setProviderChanged(true)
                    }
                } else if (props.ciPipelineSourceTypeOptions.length === 1) {
                    selectedMaterial = props.ciPipelineSourceTypeOptions[0]
                } else {
                    selectedMaterial =
                        props.ciPipelineSourceTypeOptions.find((i) =>
                            i.value === SourceTypeMap.WEBHOOK
                                ? i.isSelected
                                : isBranchRegex
                                ? i.value === SourceTypeMap.BranchRegex
                                : i.value === mat.type,
                        ) || props.ciPipelineSourceTypeOptions[0]
                }
                let errorObj = props.validationRules?.sourceValue(isBranchRegex ? mat.regex : mat.value)
                const isMultiGitAndWebhook = isMultiGit && _selectedWebhookEvent
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
                                <ConditionalWrap
                                    condition={isMultiGitAndWebhook}
                                    wrap={(children) => (
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content={`Cannot change source type ${_selectedWebhookEvent.name} for multi-git applications`}
                                            interactive={true}
                                        >
                                            {children}
                                        </Tippy>
                                    )}
                                >
                                    <div className={'w-50 mr-8 '}>
                                        <label className="form__label mb-6 dc__required-field">Source Type</label>
                                        <ReactSelect
                                            className="workflow-ci__source"
                                            placeholder="Source Type"
                                            classNamePrefix={`select-build-pipeline-sourcetype-${index}`}
                                            isSearchable={false}
                                            menuPortalTarget={document.getElementById('visible-modal')}
                                            options={
                                                !isMultiGit
                                                    ? props.ciPipelineSourceTypeOptions
                                                    : props.ciPipelineSourceTypeOptions.slice(0, 2)
                                            }
                                            isDisabled={islinkedCI || (isMultiGit && _selectedWebhookEvent)}
                                            value={selectedMaterial}
                                            closeMenuOnSelect={true}
                                            onChange={(selected) =>
                                                props?.selectSourceType(selected, mat.gitMaterialId)
                                            }
                                            isClearable={false}
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
                                                menuList: (base, state) => ({
                                                    ...base,
                                                    zIndex: '99',
                                                }),
                                            }}
                                        />

                                        <div className="h-18"></div>
                                    </div>
                                </ConditionalWrap>

                                {isBranchFixed && (
                                    <div className="w-50 ml-8 left">
                                        <div>
                                            <label className="form__label mb-6 dc__required-field">Branch Name</label>
                                            <input
                                                className="form__input"
                                                autoComplete="off"
                                                placeholder="Eg. main"
                                                type="text"
                                                data-testid={`build-pipeline-branch-name-textbox${index}`}
                                                disabled={!props.handleSourceChange}
                                                value={mat.value}
                                                onChange={(event) => {
                                                    props?.handleSourceChange(
                                                        event,
                                                        mat.gitMaterialId,
                                                        SourceTypeMap.BranchFixed,
                                                    )
                                                }}
                                                autoFocus={true}
                                                onBlur={onBlur}
                                            />
                                        </div>
                                        {errorObj && !errorObj.isValid ? (
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
                                        <label className="form__label mb-6 dc__required-field">Branch Regex</label>
                                        <input
                                            className="form__input"
                                            autoComplete="off"
                                            placeholder="Eg. feature.*"
                                            type="text"
                                            data-testid={`build-pipeline-branch-name-textbox${index}`}
                                            disabled={!props.handleSourceChange}
                                            value={mat.regex}
                                            onChange={(event) => {
                                                props?.handleSourceChange(
                                                    event,
                                                    mat.gitMaterialId,
                                                    SourceTypeMap.BranchRegex,
                                                )
                                            }}
                                            autoFocus={true}
                                        />
                                        {errorObj && !errorObj.isValid ? (
                                            <span
                                                className="form__error ci-error "
                                                data-testid="build-pipeline-validation-error-message"
                                            >
                                                <img src={error} className="form__icon" />
                                                {props.validationRules?.sourceValue(_materials[index].regex).message}
                                            </span>
                                        ) : (
                                            <div className="h-18"></div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isBranchRegex && (
                            <div className={`${errorObj && !errorObj.isValid ? 'mt-16' : ''}`}>
                                <InfoColourBar
                                    message="Branch Regex allows you to easily switch between branches matching the configured regex before triggering the build pipeline."
                                    classname={'info_bar'}
                                    Icon={InfoIcon}
                                />
                            </div>
                        )}

                        {props.includeWebhookEvents && mat.type == SourceTypeMap.WEBHOOK && _selectedWebhookEvent && (
                            <ConfigureWebhook
                                webhookConditionList={props.webhookData.webhookConditionList}
                                gitHost={props.webhookData.gitHost}
                                selectedWebhookEvent={_selectedWebhookEvent}
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
