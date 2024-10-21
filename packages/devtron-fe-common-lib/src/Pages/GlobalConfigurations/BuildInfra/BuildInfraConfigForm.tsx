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

import { FunctionComponent } from 'react'
import { Progressing } from '../../../Common'
import BuildInfraFormAction from './BuildInfraFormAction'
import BuildInfraFormItem from './BuildInfraFormItem'
import BuildInfraProfileDescriptionField from './BuildInfraDescriptionField'
import BuildInfraProfileNameField from './BuildInfraProfileNameField'
import { BUILD_INFRA_FORM_FIELDS, BUILD_INFRA_TEXT } from './constants'
import { BuildInfraActionType, BuildInfraConfigFormProps, InheritingHeaderProps } from './types'

const InheritingHeader = ({
    defaultHeading,
    inheritingData,
    isInheriting,
    isDefaultProfile,
}: InheritingHeaderProps) => {
    const inheritingDataString = inheritingData.map((data) => `${data.value} ${data.unit ?? ''}`).join(' - ')

    if (isDefaultProfile || !isInheriting) {
        // For typing issues
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{defaultHeading}</>
    }

    return (
        <div className="flexbox dc__align-items-center dc__content-space w-100">
            {defaultHeading}

            <div className="flexbox dc__content-space w-100">
                <span className="m-0 pt-0 pb-0 pl-4 pr-4 fs-13 lh-20 fw-4 cn-9 dc__ellipsis-right dc__word-break-all flex-grow-1">
                    {inheritingDataString}
                </span>

                <p className="m-0 cn-7 fs-13 fw-4 lh-20 dc__no-shrink">
                    {BUILD_INFRA_TEXT.INHERITING_HEADING_DESCRIPTION}
                </p>
            </div>
        </div>
    )
}

const BuildInfraConfigForm: FunctionComponent<BuildInfraConfigFormProps> = ({
    profileInput,
    profileInputErrors,
    handleProfileInputChange,
    isDefaultProfile,
    unitsMap,
    configurationContainerLabel,
}) => {
    const currentConfigurations = profileInput?.configurations

    // will get the desired configuration from the currentConfigurations and then check if it is active or not
    const isInheritingProfileValues = (actions: BuildInfraActionType[]) =>
        actions.some((action) => !currentConfigurations[action.actionType].active)

    // Had to show loader for an instance due to batching of state updates not working as expected :/
    if (!currentConfigurations) {
        return <Progressing pageLoader />
    }

    return (
        <div className="flexbox-col dc__mxw-920 dc__gap-16">
            {!isDefaultProfile && (
                <div className="flexbox-col dc__gap-12">
                    <BuildInfraProfileNameField
                        handleProfileInputChange={handleProfileInputChange}
                        currentValue={profileInput.name}
                        error={profileInputErrors.name}
                    />

                    <BuildInfraProfileDescriptionField
                        handleProfileInputChange={handleProfileInputChange}
                        currentValue={profileInput.description}
                        error={profileInputErrors.description}
                    />
                </div>
            )}

            <div className="flexbox-col dc__gap-12">
                {configurationContainerLabel}

                <div className="w-100 flexbox-col dc__gap-16 br-4 dc__border-n1 p-16">
                    {BUILD_INFRA_FORM_FIELDS.map((field, index) => (
                        <BuildInfraFormItem
                            key={field.locator}
                            marker={field.marker}
                            heading={
                                <InheritingHeader
                                    defaultHeading={field.heading}
                                    inheritingData={field.actions.map(
                                        (action) => currentConfigurations[action.actionType],
                                    )}
                                    isInheriting={isInheritingProfileValues(field.actions)}
                                    isDefaultProfile={isDefaultProfile}
                                />
                            }
                            showDivider={index !== BUILD_INFRA_FORM_FIELDS.length - 1}
                            isInheriting={isInheritingProfileValues(field.actions)}
                            handleProfileInputChange={handleProfileInputChange}
                            locator={field.locator}
                            isDefaultProfile={isDefaultProfile}
                        >
                            <div className="w-50 flexbox dc__gap-12 w-100 dc__align-start">
                                {field.actions.map((action) => (
                                    <BuildInfraFormAction
                                        key={action.actionType}
                                        actionType={action.actionType}
                                        label={action.label}
                                        placeholder={action.placeholder}
                                        error={profileInputErrors[action.actionType]}
                                        // Assumption is for default profiles all input fields are required
                                        isRequired
                                        profileUnitsMap={unitsMap[action.actionType]}
                                        handleProfileInputChange={handleProfileInputChange}
                                        currentUnitName={currentConfigurations[action.actionType].unit}
                                        currentValue={currentConfigurations[action.actionType].value}
                                    />
                                ))}
                            </div>
                        </BuildInfraFormItem>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BuildInfraConfigForm
