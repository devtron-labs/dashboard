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

import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import {
    APIOptions,
    ButtonComponentType,
    ButtonProps,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { MigrateToDevtronBaseFormStateType, MigrateToDevtronFormState } from '../cdPipeline.types'
import { BuildCDProps } from '../types'

export interface MigrateFromArgoProps
    extends Pick<BuildCDProps, 'setMigrateToDevtronFormState' | 'migrateToDevtronFormState'> {}

export interface MigrateToDevtronValidationFactoryProps
    extends Pick<MigrateToDevtronBaseFormStateType, 'validationResponse'> {
    refetchValidationResponse: () => void
    appName: string
}

export type SelectClusterOptionType = SelectPickerOptionType<number>
export type SelectMigrateAppOptionType = SelectPickerOptionType<
    Pick<MigrateToDevtronBaseFormStateType, 'appName' | 'namespace'>
>

export interface ExternalHelmAppDTO {
    releaseName: string
    clusterId: number
    namespace: string
    environmentId: number
    status: string
    chartAvatar: string
}

export interface ExternalHelmAppType
    extends Pick<ExternalHelmAppDTO, 'releaseName' | 'clusterId' | 'namespace' | 'environmentId' | 'status'> {
    icon: SelectPickerOptionType['startIcon']
}

export interface ValidationResponseContentRowProps {
    title: string
    value?: string
    buttonProps?: ButtonProps<ButtonComponentType>
    titleTooltip: JSX.Element
}

export interface MigrateToDevtronProps {
    migrateToDevtronFormState: MigrateToDevtronFormState
    setMigrateToDevtronFormState: Dispatch<SetStateAction<MigrateToDevtronFormState>>
    handleMigrateFromAppTypeChange: (event: SyntheticEvent) => void
}

export interface ClusterSelectProps extends Pick<MigrateToDevtronFormState, 'deploymentAppType'> {
    handleClusterChange: (cluster: SelectClusterOptionType) => void
    clusterId: number
    clusterName: string
}

export interface GetMigrateAppOptionsParamsType
    extends Pick<MigrateToDevtronFormState, 'deploymentAppType'>,
        Pick<APIOptions, 'abortControllerRef'> {
    clusterId: number
}
