/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Disabling for ReactSelect
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FunctionComponent, useEffect, useState } from 'react'
import { CustomInput, OptionType, InfoIconTippy, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'
import { renderOptionIcon } from './CIBuildpackBuildOptions'
import { BuildContextProps } from './types'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { RootBuildContext } from './ciConfigConstant'

const getBuildContextAdditionalContent = () => (
    <div className="p-12 fs-13">
        To build all files from the root, use (.) as the build context, or set build context by referring a subdirectory
        path such as
        <span className="bcn-1 pt-2 pb-2 br-6 pl-4 pr-4 dc__ff-monospace fs-13 fw-4 cn-7">/myfolder</span>
        or
        <span className="bcn-1 pt-2 pb-2 br-6 pl-4 pr-4 dc__ff-monospace fs-13 fw-4 cn-7">/myfolder/buildhere</span>
        if path not set, default path will be root dir of selected git repository
    </div>
)

const InfoCard: FunctionComponent = () => (
    <div className="row ml-0">
        <InfoIconTippy
            heading="Docker build context"
            infoText="Specify the set of files to be built by referring to a specific subdirectory, relative to the root of your repository."
            documentationLinkText="View Documentation"
            additionalContent={getBuildContextAdditionalContent()}
            iconClassName="icon-dim-16 fcn-6 ml-4"
            placement="right"
        />
    </div>
)

const BuildContext: FunctionComponent<BuildContextProps> = ({
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
    // Wanted to remove this prop but its getting updated
    formState,
    setCurrentCIBuildConfig,
    currentBuildContextGitMaterial,
    readOnlyBuildContextPath,
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(!isDefaultBuildContext)

    const useRootBuildContextFlag = currentCIBuildConfig?.useRootBuildContext
    const buildContextCheckoutPath = selectedBuildContextGitMaterial?.checkoutPath || currentMaterial?.checkoutPath
    const checkoutPathArray = [{ label: RootBuildContext, value: RootBuildContext }]
    if (buildContextCheckoutPath !== RootBuildContext) {
        checkoutPathArray.push({ label: buildContextCheckoutPath, value: buildContextCheckoutPath })
    }
    const [checkoutPathOptions, setCheckoutPathOptions] = useState<OptionType[]>(checkoutPathArray)

    useEffect(() => {
        const _checkoutPathArray = [{ label: RootBuildContext, value: RootBuildContext }]
        if (selectedBuildContextGitMaterial?.checkoutPath !== RootBuildContext) {
            _checkoutPathArray.push({
                label: selectedBuildContextGitMaterial?.checkoutPath,
                value: selectedBuildContextGitMaterial?.checkoutPath,
            })
        }
        setCheckoutPathOptions(_checkoutPathArray)
    }, [selectedBuildContextGitMaterial])

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed)
    }

    const getSelectedBuildContextGitMaterial = () => selectedBuildContextGitMaterial ?? currentMaterial

    const handleBuildContextPathChange = (_selectedBuildContextGitMaterial): void => {
        setSelectedBuildContextGitMaterial(_selectedBuildContextGitMaterial)
        // Don't know how and why we are directly setting state.
        // eslint-disable-next-line no-param-reassign
        formState.repository.value = _selectedBuildContextGitMaterial.name
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildContextGitMaterialId: _selectedBuildContextGitMaterial.id,
        })
    }

    const handleBuildContextCheckoutPathChange = (checkoutPath) => {
        const flag = checkoutPath.value === RootBuildContext
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            useRootBuildContext: flag,
        })
    }

    const getCheckoutPathValue = (_useRootBuildContextFlag: boolean): OptionType => {
        const path = getSelectedBuildContextGitMaterial()?.checkoutPath
        const val = _useRootBuildContextFlag ? RootBuildContext : path

        return { label: val, value: val }
    }

    if (!window._env_.ENABLE_BUILD_CONTEXT) {
        return null
    }

    // TODO: Would directly call this readOnly from AdvancedConfigOptions itself
    if (readOnly) {
        return (
            <div className="form-row__docker">
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <span className="form__label">Repository containing build context</span>

                    <div className="flex left">
                        {currentBuildContextGitMaterial?.url && renderOptionIcon(currentBuildContextGitMaterial.url)}
                        <span className="fs-14 fw-4 lh-20 cn-9">
                            {currentBuildContextGitMaterial?.name || 'Not selected'}
                        </span>
                    </div>

                    {repositoryError && <span className="form__error">{repositoryError}</span>}
                </div>

                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <span className="form__label">Build Context (Relative)</span>

                    <span className="fs-14 fw-4 lh-20 cn-9">{readOnlyBuildContextPath}</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex left row ml-0 build-context-label fs-13 mb-6">
                <button
                    className="flex p-0 dc__no-background dc__no-border dc__outline-none-imp"
                    onClick={toggleCollapse}
                    type="button"
                >
                    <Dropdown
                        className="icon-dim-26 rotate"
                        data-testid="set-build-context-button"
                        style={{ ['--rotateBy' as string]: isCollapsed ? '360deg' : '270deg' }}
                    />
                    Set Build context
                </button>

                <InfoCard />
            </div>

            {isCollapsed && (
                <div className="form-row__docker ml-24">
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <SelectPicker
                            label="Select repo containing build context"
                            inputId="build-context-repo"
                            classNamePrefix="build-config__select-repository-containing-build-context"
                            isClearable={false}
                            options={sourceConfig.material}
                            value={getSelectedBuildContextGitMaterial()}
                            onChange={handleBuildContextPathChange}
                        />

                        {repositoryError && <label className="form__error">{repositoryError}</label>}
                    </div>

                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label htmlFor="" className="form__label">
                            Build Context Path (Relative)
                        </label>

                        {console.log('docker option', checkoutPathOptions)}
                        {console.log(getCheckoutPathValue(useRootBuildContextFlag))}

                        <div className="docker-file-container">
                            <SelectPicker
                                inputId="docker-file-container"
                                classNamePrefix="build-config__select-checkout-path-for-build-context"
                                isClearable={false}
                                isSearchable={false}
                                options={checkoutPathOptions}
                                getOptionLabel={(option) => `${option.label}`}
                                getOptionValue={(option) => `${option.value}`}
                                value={getCheckoutPathValue(useRootBuildContextFlag)}
                                onChange={handleBuildContextCheckoutPathChange}
                            />

                            <CustomInput
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

export default BuildContext
