import {
    APIOptions,
    DeploymentAppTypes,
    get,
    getIsRequestAborted,
    getUrlWithSearchParams,
    ImageWithFallback,
    post,
    showError,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import { getArgoInstalledExternalApps } from '@Components/app/list-new/AppListService'
import { ReactComponent as ICHelmChart } from '@Icons/ic-helmchart.svg'
import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import {
    ValidateMigrateToDevtronPayloadType,
    ValidateMigrationSourceDTO,
    ValidateMigrationSourceInfoType,
    ValidateMigrationSourceServiceParamsType,
} from '../cdPipeline.types'
import {
    generateMigrateAppOption,
    getValidateMigrationSourcePayload,
    sanitizeValidateMigrationSourceResponse,
} from './utils'
import {
    ExternalHelmAppDTO,
    ExternalHelmAppType,
    GetMigrateAppOptionsParamsType,
    SelectMigrateAppOptionType,
} from './types'

export const validateMigrationSource = async (
    params: ValidateMigrationSourceServiceParamsType,
    abortControllerRef: APIOptions['abortControllerRef'],
): Promise<ValidateMigrationSourceInfoType> => {
    try {
        const { result } = await post<ValidateMigrationSourceDTO, ValidateMigrateToDevtronPayloadType>(
            Routes.APP_CD_PIPELINE_VALIDATE_LINK_REQUEST,
            getValidateMigrationSourcePayload(params),
            { abortControllerRef },
        )
        return sanitizeValidateMigrationSourceResponse(result, params.migrateToDevtronFormState.deploymentAppType)
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

const getExternalHelmAppList = async (
    clusterId: number,
    abortControllerRef: APIOptions['abortControllerRef'],
): Promise<ExternalHelmAppType[]> => {
    const { result } = await get<ExternalHelmAppDTO[]>(
        getUrlWithSearchParams(Routes.APPLICATION_EXTERNAL_HELM_RELEASE, { clusterId }),
        { abortControllerRef },
    )

    return (result || []).map((app) => ({
        releaseName: app.releaseName || '',
        clusterId: app.clusterId,
        namespace: app.namespace || '',
        environmentId: app.environmentId,
        status: app.status || '',
        icon: (
            <ImageWithFallback
                imageProps={{ src: app.chartAvatar, alt: 'Helm Release', width: '100%', height: '100%' }}
                fallbackImage={<ICHelmChart />}
            />
        ),
    }))
}

export const getMigrateAppOptions = async ({
    clusterId,
    deploymentAppType,
    abortControllerRef,
}: GetMigrateAppOptionsParamsType): Promise<SelectMigrateAppOptionType[]> => {
    try {
        if (deploymentAppType === DeploymentAppTypes.GITOPS) {
            const { result } = await getArgoInstalledExternalApps(String(clusterId), abortControllerRef)
            return (result || [])
                .map<SelectMigrateAppOptionType>((argoApp) =>
                    generateMigrateAppOption({
                        appName: argoApp.appName,
                        namespace: argoApp.namespace,
                        startIcon: <ICArgoCDApp />,
                    }),
                )
                .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string))
        }

        const externalHelmApps = await getExternalHelmAppList(clusterId, abortControllerRef)
        return externalHelmApps
            .map<SelectMigrateAppOptionType>((helmApp) =>
                generateMigrateAppOption({
                    appName: helmApp.releaseName,
                    namespace: helmApp.namespace,
                    startIcon: helmApp.icon,
                }),
            )
            .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string))
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}
