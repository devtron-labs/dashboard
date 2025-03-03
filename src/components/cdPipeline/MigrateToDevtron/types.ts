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
