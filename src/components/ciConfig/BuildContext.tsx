import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { CustomInput, OptionType, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { checkoutPathOption, renderOptionIcon, repositoryControls, repositoryOption } from './CIBuildpackBuildOptions'
import { _multiSelectStyles } from './CIConfig.utils'
import { BuildContextProps } from './types'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { RootBuildContext } from './ciConfigConstant'

function getBuildContextAdditionalContent() {
    return (
        <div className="p-12 fs-13">
            To build all files from the root, use (.) as the build context, or set build context by referring a
            subdirectory path such as
            <span className="bcn-1 pt-2 pb-2 br-6 pl-4 pr-4 dc__ff-monospace fs-13 fw-4 cn-7">/myfolder</span>
            or
            <span className="bcn-1 pt-2 pb-2 br-6 pl-4 pr-4 dc__ff-monospace fs-13 fw-4 cn-7">/myfolder/buildhere</span>
            if path not set, default path will be root dir of selected git repository
        </div>
    )
}

function InfoCard() {
    return (
        <div className="flex row ml-0">
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-300 h-100 fcv-5"
                placement="right"
                Icon={QuestionFilled}
                heading="Docker build context"
                infoText="Specify the set of files to be built by referring to a specific subdirectory, relative to the root of your repository."
                showCloseButton
                trigger="click"
                interactive
                documentationLinkText="View Documentation"
                additionalContent={getBuildContextAdditionalContent()}
            >
                <div className="icon-dim-16 fcn-5 ml-8 cursor">
                    <Question />
                </div>
            </TippyCustomized>
        </div>
    )
}

export default function BuildContext({
    readOnly,
    isDefaultBuildContext,
    configOverrideView,
    sourceConfig,
    selectedBuildContextGitMaterial,
    currentMaterial,
    setSelectedBuildContextGitMaterial,
    repositoryError,
    handleOnChangeConfig,
    buildContextValue,
    currentCIBuildConfig,
    // Want to remove this prop but its getting updated
    formState,
    setCurrentCIBuildConfig,
    currentBuildContextGitMaterial,
    readOnlyBuildContextPath,
}: BuildContextProps) {
    const useRootBuildContextFlagFormState = currentCIBuildConfig?.useRootBuildContext
    const [isCollapsed, setIsCollapsed] = useState<boolean>(!isDefaultBuildContext)
    const [useRootBuildContextFlag, setUseRootBuildContextFlag] = useState<boolean>(useRootBuildContextFlagFormState)

    const buildContextCheckoutPath = selectedBuildContextGitMaterial?.checkoutPath ?? currentMaterial?.checkoutPath
    const checkoutPathArray = [{ label: RootBuildContext, value: RootBuildContext }]
    if (buildContextCheckoutPath !== RootBuildContext) {
        checkoutPathArray.push({ label: buildContextCheckoutPath, value: buildContextCheckoutPath })
    }
    const [checkoutPathOptions, setCheckoutPathOptions] = useState<OptionType[]>(checkoutPathArray)

    useEffect(() => {
        const checkoutPathArray = [{ label: RootBuildContext, value: RootBuildContext }]
        if (selectedBuildContextGitMaterial?.checkoutPath !== RootBuildContext) {
            checkoutPathArray.push({
                label: selectedBuildContextGitMaterial?.checkoutPath,
                value: selectedBuildContextGitMaterial?.checkoutPath,
            })
        }
        setCheckoutPathOptions(checkoutPathArray)
    }, [selectedBuildContextGitMaterial])

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed)
    }

    const getSelectedBuildContextGitMaterial = () => selectedBuildContextGitMaterial ?? currentMaterial

    const handleBuildContextPathChange = (selectedBuildContextGitMaterial): void => {
        setSelectedBuildContextGitMaterial(selectedBuildContextGitMaterial)
        // Don't know how and why we are directly setting state.
        formState.repository.value = selectedBuildContextGitMaterial.name
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildContextGitMaterialId: selectedBuildContextGitMaterial.id,
        })
    }

    const handleBuildContextCheckoutPathChange = (checkoutPath) => {
        const val = checkoutPath.value
        let flag = false
        if (val === RootBuildContext) {
            flag = true
        }
        setUseRootBuildContextFlag(flag)
        // Don't know how and why we are directly setting state.
        formState.useRootBuildContext.value = flag
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            useRootBuildContext: flag,
        })
    }

    const getCheckoutPathValue = (useRootBuildContextFlag: boolean): OptionType => {
        const path = getSelectedBuildContextGitMaterial()?.checkoutPath
        const val = useRootBuildContextFlag ? RootBuildContext : path

        return { label: val, value: val }
    }

    if (window._env_.ENABLE_BUILD_CONTEXT) {
        return null
    }

    // TODO: Would directly call this readOnly from AdvancedConfigOptions itself
    if (readOnly) {
        return (
            <div className="form-row__docker">
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label className="form__label">Repository containing build context</label>

                    <div className="flex left">
                        {currentBuildContextGitMaterial?.url && renderOptionIcon(currentBuildContextGitMaterial.url)}
                        <span className="fs-14 fw-4 lh-20 cn-9">
                            {currentBuildContextGitMaterial?.name ?? 'Not selected'}
                        </span>
                    </div>

                    {repositoryError && <label className="form__error">{repositoryError}</label>}
                </div>

                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label htmlFor="" className="form__label">
                        Build Context (Relative)
                    </label>

                    <span className="fs-14 fw-4 lh-20 cn-9">{readOnlyBuildContextPath}</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex left row ml-0 build-context-label fs-13 mb-6">
                <span className="flex pointer" onClick={toggleCollapse}>
                    <Dropdown
                        className="icon-dim-26 rotate"
                        data-testid="set-build-context-button"
                        style={{ ['--rotateBy' as any]: isCollapsed ? '360deg' : '270deg' }}
                    />
                    Set Build context
                </span>

                <InfoCard />
            </div>

            {isCollapsed && (
                <div className="form-row__docker ml-24">
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label">Select repo containing build context</label>

                        <ReactSelect
                            className="m-0"
                            classNamePrefix="build-config__select-repository-containing-build-context"
                            tabIndex={3}
                            isMulti={false}
                            isClearable={false}
                            options={sourceConfig.material}
                            getOptionLabel={(option) => `${option.name}`}
                            getOptionValue={(option) => `${option.checkoutPath}`}
                            value={getSelectedBuildContextGitMaterial()}
                            styles={{
                                ..._multiSelectStyles,
                                menu: (base) => ({
                                    ...base,
                                    marginTop: '0',
                                    paddingBottom: '4px',
                                }),
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option: repositoryOption,
                                Control: repositoryControls,
                            }}
                            onChange={handleBuildContextPathChange}
                        />

                        {repositoryError && <label className="form__error">{repositoryError}</label>}
                    </div>

                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label htmlFor="" className="form__label">
                            Build Context (Relative)
                        </label>

                        <div className="docker-file-container">
                            <ReactSelect
                                className="m-0 br-0"
                                classNamePrefix="build-config__select-checkout-path-for-build-context"
                                tabIndex={4}
                                isMulti={false}
                                isClearable={false}
                                isSearchable={false}
                                options={checkoutPathOptions}
                                getOptionLabel={(option) => `${option.label}`}
                                getOptionValue={(option) => `${option.value}`}
                                value={getCheckoutPathValue(useRootBuildContextFlag)}
                                styles={{
                                    ..._multiSelectStyles,
                                    menu: (base) => ({
                                        ...base,
                                        marginTop: '0',
                                        paddingBottom: '4px',
                                        width:
                                            checkoutPathOptions?.length === 2 && checkoutPathOptions[1].value.length > 3
                                                ? '120px'
                                                : '100%',
                                    }),
                                    control: (base) => ({
                                        ...base,
                                        borderTopRightRadius: '0px',
                                        borderBottomRightRadius: '0px',
                                        borderRight: '0px',
                                    }),
                                    dropdownIndicator: (base) => ({
                                        ...base,
                                        paddingLeft: '0px',
                                    }),
                                }}
                                components={{
                                    IndicatorSeparator: null,
                                    Option: checkoutPathOption,
                                }}
                                onChange={handleBuildContextCheckoutPathChange}
                            />

                            <CustomInput
                                tabIndex={4}
                                type="text"
                                rootClassName="file-name"
                                data-testid="build-context-path-text-box"
                                placeholder="Project Path"
                                name="buildContext"
                                value={buildContextValue}
                                onChange={handleOnChangeConfig}
                                autoFocus={!configOverrideView}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
