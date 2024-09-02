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

// Disabling due to react select issue
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FunctionComponent } from 'react'
import Tippy from '@tippyjs/react'
import { ComponentSizeType, CustomInput, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'
import { getGitProviderIcon } from '@Components/common'
import { renderOptionIcon } from './CIBuildpackBuildOptions'
import { CISelfDockerBuildOptionProps } from './types'

const CISelfDockerBuildOption: FunctionComponent<CISelfDockerBuildOptionProps> = ({
    readOnly,
    sourceMaterials,
    readonlyDockerfileRelativePath,
    selectedMaterial,
    dockerFileValue,
    configOverrideView,
    currentMaterial,
    repositoryError,
    handleOnChangeConfig,
    handleFileLocationChange,
    dockerfileError,
}) => {
    const getDockerfileOptions = () => {
        return sourceMaterials.map((material) => {
            return {
                value: material.checkoutPath,
                label: material.name,
                startIcon: getGitProviderIcon(material.url),
            }
        })
    }

    if (readOnly) {
        return (
            <div className={`${configOverrideView ? 'mb-12' : ''}  form-row__docker`}>
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <span className="form__label">Repository containing Dockerfile</span>

                    <div className="flex left">
                        {currentMaterial?.url && renderOptionIcon(currentMaterial.url)}
                        <span className="fs-14 fw-4 lh-20 cn-9">{currentMaterial?.name || 'Not selected'}</span>
                    </div>

                    {repositoryError && <span className="form__error">{repositoryError}</span>}
                </div>

                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <span className="form__label dc__required-field">Dockerfile Path (Relative)</span>

                    <span className="fs-14 fw-4 lh-20 cn-9">{readonlyDockerfileRelativePath}</span>
                </div>
            </div>
        )
    }

    const getSelectedMaterialValue = () => {
        if (selectedMaterial.name) {
            return {
                label: selectedMaterial.name,
                value: selectedMaterial.checkoutPath,
                startIcon: getGitProviderIcon(selectedMaterial.url),
            }
        }
        return null
    }

    return (
        <div className={`${configOverrideView ? 'mb-12' : ''}  form-row__docker`}>
            <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                <label className="form__label">Select repository containing Dockerfile</label>

                <SelectPicker
                    inputId="select-repository-containing-dockerfile"
                    name="select-repository-containing-dockerfile"
                    classNamePrefix="build-config__select-repository-containing-dockerfile"
                    isClearable={false}
                    options={getDockerfileOptions()}
                    value={getSelectedMaterialValue()}
                    onChange={handleFileLocationChange}
                    size={ComponentSizeType.large}
                />

                {repositoryError && <label className="form__error">{repositoryError}</label>}
            </div>

            <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                <label htmlFor="" className="form__label dc__required-field">
                    Dockerfile Path (Relative)
                </label>

                <div className="docker-file-container">
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={selectedMaterial?.checkoutPath}
                    >
                        <span className="h-38 checkout-path-container bcn-1 en-2 bw-1 dc__no-right-border dc__ellipsis-right">
                            {selectedMaterial?.checkoutPath}
                        </span>
                    </Tippy>

                    <CustomInput
                        rootClassName="file-name"
                        data-testid="dockerfile-path-text-box"
                        placeholder="Dockerfile"
                        name="dockerfile"
                        value={dockerFileValue}
                        onChange={handleOnChangeConfig}
                        autoComplete="off"
                        autoFocus={!configOverrideView}
                        error={dockerfileError}
                    />
                </div>
            </div>
        </div>
    )
}

export default CISelfDockerBuildOption
