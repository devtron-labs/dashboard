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

import { FormEvent, FunctionComponent, ReactNode } from 'react'
import { Breadcrumb } from '../../../Common/BreadCrumb/Types'
import { ValidationResponseType } from '../../../Shared'
import { ServerErrors } from '../../../Common'

/**
 * Unique actions that will be dispatched and,
 * Keeping some values (cpu_limit, etc) in sync with backend
 */
export enum BuildInfraConfigTypes {
    CPU_LIMIT = 'cpu_limit',
    CPU_REQUEST = 'cpu_request',
    MEMORY_LIMIT = 'memory_limit',
    MEMORY_REQUEST = 'memory_request',
    BUILD_TIMEOUT = 'timeout',
}

/**
 * Combination of BuildInfraConfigTypes and BuildInfraMetaConfigTypes is going to derive error state and actions(actions will also be derived with BuildInfraInheritActions)
 */
export enum BuildInfraMetaConfigTypes {
    NAME = 'name',
    DESCRIPTION = 'description',
}

/**
 * Would be used as key for few components and would be appending activate and de_activate actions to it
 */
export enum BuildInfraLocators {
    CPU = 'cpu',
    MEMORY = 'memory',
    // This name can be also different from BuildInfraConfigTypes[BUILD_TIMEOUT] in case we want to show different label
    BUILD_TIMEOUT = 'timeout',
}

// FIXME: Derive this from BuildInfraLocators
// Appending the locators from above
export enum BuildInfraInheritActions {
    ACTIVATE_CPU = 'activate_cpu',
    DE_ACTIVATE_CPU = 'de_activate_cpu',
    ACTIVATE_MEMORY = 'activate_memory',
    DE_ACTIVATE_MEMORY = 'de_activate_memory',
    ACTIVATE_BUILD_TIMEOUT = 'activate_timeout',
    DE_ACTIVATE_BUILD_TIMEOUT = 'de_activate_timeout',
}

export const BuildInfraConfigActionMap = {
    [BuildInfraConfigTypes.BUILD_TIMEOUT]: BuildInfraLocators.BUILD_TIMEOUT,
    [BuildInfraConfigTypes.CPU_LIMIT]: BuildInfraLocators.CPU,
    [BuildInfraConfigTypes.CPU_REQUEST]: BuildInfraLocators.CPU,
    [BuildInfraConfigTypes.MEMORY_LIMIT]: BuildInfraLocators.MEMORY,
    [BuildInfraConfigTypes.MEMORY_REQUEST]: BuildInfraLocators.MEMORY,
}

export enum BuildInfraProfileVariants {
    DEFAULT = 'DEFAULT',
    NORMAL = 'NORMAL',
    CUSTOM = 'CUSTOM',
}

export interface BuildInfraDescriptorProps {
    /**
     * In case we want to restrict the max-width
     */
    additionalContainerClasses?: string
    breadCrumbs: Breadcrumb[]
    /**
     * Would stick at right of div
     */
    children?: ReactNode
    tippyInfoText?: string
    tippyAdditionalContent?: ReactNode
}

export interface BuildInfraActionType {
    /**
     * Type of action to be dispatched, would be suffixed with type of change
     */
    actionType: BuildInfraConfigTypes
    /**
     * Label to be shown above input
     */
    label: string
    /**
     * Placeholder for input, can be optional
     */
    placeholder?: string
    // Can add a prop for variant, if there is a need to show different types of inputs
}

export interface BuildInfraConfigurationMarkerProps {
    className?: string
}

export interface BuildInfraFormFieldType {
    /**
     * Heading of the form item
     */
    heading: ReactNode
    /**
     * Icon/Checkbox to be shown in front of heading
     */
    marker: FunctionComponent<BuildInfraConfigurationMarkerProps>
    /**
     * Actions to be shown in the form item
     */
    actions: BuildInfraActionType[]
    /**
     * Unique identifier for the form item used for key
     */
    locator: BuildInfraLocators
}

export interface ConfigurationUnitType {
    name: string
    conversionFactor: number
}

// key would be the name of ConfigurationUnitType
export type ConfigurationUnitMapType = {
    [key: ConfigurationUnitType['name']]: ConfigurationUnitType
}

export type BuildInfraUnitsMapType = {
    [key in BuildInfraConfigTypes]: ConfigurationUnitMapType
}

export interface BuildInfraConfigValuesType {
    value: string
    unit?: ConfigurationUnitType['name']
}

interface BuildInfraProfileConfigBase {
    id?: number
    key: BuildInfraConfigTypes
    profileName: string
    active: boolean
}

export interface BuildInfraProfileConfigResponseDataType
    extends BuildInfraConfigValuesType,
        BuildInfraProfileConfigBase {}

export interface BuildInfraConfigurationType extends BuildInfraConfigValuesType, BuildInfraProfileConfigBase {
    defaultValue: BuildInfraConfigValuesType
}

export type BuildInfraConfigurationMapWithoutDefaultType = {
    [key in BuildInfraConfigTypes]: BuildInfraConfigValuesType & BuildInfraProfileConfigBase
}

export type BuildInfraConfigurationMapType = {
    [key in BuildInfraConfigTypes]: BuildInfraConfigurationType
}

export interface BuildInfraProfileBase {
    id?: number
    name: string
    description: string
    type: BuildInfraProfileVariants
    appCount: number
}

export interface BuildInfraProfileResponseDataType extends BuildInfraProfileBase {
    configurations: BuildInfraProfileConfigResponseDataType[]
}

export interface BuildInfraProfileData extends BuildInfraProfileBase {
    configurations: BuildInfraConfigurationMapType
}

export interface GetBuildInfraProfileType {
    name: string
    fromCreateView?: boolean
}

export interface BuildInfraProfileResponseType {
    configurationUnits: BuildInfraUnitsMapType | null
    profile: BuildInfraProfileData | null
}

export interface UseBuildInfraFormProps {
    /**
     * Name of the profile, if not provided assumption would be for create view
     */
    name?: string
    /**
     * If true, would send put request else would create profile via post
     */
    editProfile?: boolean
    /**
     * If true, call this on form submission success
     */
    handleSuccessRedirection?: () => void
}

export type ProfileInputErrorType = {
    [key in BuildInfraConfigTypes | BuildInfraMetaConfigTypes]: string
}

export interface ProfileInputDispatchDataType {
    value: string
    unit?: string
}

export interface HandleProfileInputChangeType {
    action: BuildInfraConfigTypes | BuildInfraInheritActions | BuildInfraMetaConfigTypes
    data?: ProfileInputDispatchDataType
}

export interface UseBuildInfraFormResponseType {
    isLoading: boolean
    profileResponse: BuildInfraProfileResponseType | null
    responseError: ServerErrors | null
    reloadRequest: () => void
    profileInput: BuildInfraProfileData
    profileInputErrors: ProfileInputErrorType
    handleProfileInputChange: ({ action, data }: HandleProfileInputChangeType) => void
    loadingActionRequest: boolean
    handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>
}

export interface BuildInfraFormItemProps extends Pick<BuildInfraFormFieldType, 'marker' | 'heading'> {
    children?: ReactNode
    /**
     * If true, means profile is inheriting values from other profile (e.g, default)
     */
    isInheriting?: boolean
    /**
     * Would be false for last item
     */
    showDivider?: boolean

    /**
     * Would be used to dispatch inherit actions (activate_cpu, de_activate_cpu, etc)
     */
    handleProfileInputChange: UseBuildInfraFormResponseType['handleProfileInputChange']
    locator: BuildInfraFormFieldType['locator']
    isDefaultProfile: boolean
}

export interface ValidateRequestLimitType {
    request: BuildInfraConfigValuesType
    limit: BuildInfraConfigValuesType
    unitsMap: ConfigurationUnitMapType
}

export interface ValidateRequestLimitResponseType {
    request: ValidationResponseType
    limit: ValidationResponseType
}

export interface BuildInfraConfigFormProps
    extends Pick<UseBuildInfraFormResponseType, 'profileInput' | 'profileInputErrors' | 'handleProfileInputChange'> {
    isDefaultProfile?: boolean
    unitsMap?: BuildInfraProfileResponseType['configurationUnits']
    configurationContainerLabel?: ReactNode
}

export interface BuildInfraFormActionProps extends BuildInfraActionType {
    handleProfileInputChange: UseBuildInfraFormResponseType['handleProfileInputChange']
    currentValue: BuildInfraConfigValuesType['value']
    error?: string
    isRequired?: boolean
    profileUnitsMap?: ConfigurationUnitMapType
    currentUnitName?: BuildInfraConfigValuesType['unit']
}

export interface FooterProps {
    /**
     * If true, means form contains errors
     */
    disabled?: boolean
    handleCancel?: () => void
    /**
     * If true would show save changes else would show save for submit button
     */
    editProfile?: boolean
    loading?: boolean
}

export interface UpdateBuildInfraProfileType extends Pick<UseBuildInfraFormResponseType, 'profileInput'> {
    name: string
}

export interface CreateBuildInfraProfileType extends Pick<UseBuildInfraFormResponseType, 'profileInput'> {}

export interface CreateBuildInfraServiceConfigurationType {
    key: BuildInfraConfigTypes
    value: string | number
    active: boolean
    unit?: string
    /**
     * Would send for those that are available in profileInput
     */
    id?: number
}

export interface CreateBuildInfraServicePayloadType {
    name: string
    description: string
    type: BuildInfraProfileVariants
    configurations: CreateBuildInfraServiceConfigurationType[]
}

export interface BuildInfraInputFieldComponentProps {
    handleProfileInputChange: UseBuildInfraFormResponseType['handleProfileInputChange']
    currentValue: BuildInfraConfigValuesType['value']
    error?: string
}

export interface InheritingHeaderProps {
    defaultHeading: BuildInfraFormFieldType['heading']
    inheritingData: BuildInfraConfigValuesType[]
    isInheriting: boolean
    isDefaultProfile: boolean
}

export interface BuildInfraConfigResponseDataType {
    name: BuildInfraConfigTypes
    units: ConfigurationUnitType[]
}

interface BaseBuildInfraProfileResponseType {
    defaultConfigurations: BuildInfraProfileConfigResponseDataType[]
    configurationUnits: BuildInfraUnitsMapType
}

export interface BuildInfraListResponseType extends BaseBuildInfraProfileResponseType {
    profiles: BuildInfraProfileResponseDataType[]
}

export interface BuildInfraProfileAPIResponseType extends BaseBuildInfraProfileResponseType {
    profile: BuildInfraProfileResponseDataType
}

export interface BuildInfraProfileTransformerType
    extends BuildInfraProfileAPIResponseType,
        Pick<GetBuildInfraProfileType, 'fromCreateView'> {}
