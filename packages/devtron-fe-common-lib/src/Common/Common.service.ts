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

import moment from 'moment'
import { RuntimeParamsAPIResponseType, RuntimeParamsListItemType } from '@Shared/types'
import { getIsManualApprovalSpecific, sanitizeUserApprovalConfig, stringComparatorBySortOrder } from '@Shared/Helpers'
import { get, post } from './Api'
import { ROUTES } from './Constants'
import { getUrlWithSearchParams, sortCallback } from './Helper'
import {
    TeamList,
    ResponseType,
    DeploymentNodeType,
    CDModalTab,
    FilterStates,
    CDMaterialServiceEnum,
    CDMaterialServiceQueryParams,
    CDMaterialResponseType,
    CDMaterialsMetaInfo,
    CDMaterialsApprovalInfo,
    CDMaterialFilterQuery,
    ImagePromotionMaterialInfo,
    EnvironmentListHelmResponse,
    UserGroupApproverType,
    ImageApprovalPolicyUserGroupDataType,
    ImageApprovalPolicyType,
    ImageApprovalUsersInfoDTO,
    UserApprovalMetadataType,
    UserApprovalConfigType,
    CDMaterialListModalServiceUtilProps,
} from './Types'
import { ApiResourceType } from '../Pages'
import { API_TOKEN_PREFIX } from '@Shared/constants'
import { DefaultUserKey } from '@Shared/types'

export const getTeamListMin = (): Promise<TeamList> => {
    // ignore active field
    const URL = `${ROUTES.PROJECT_LIST_MIN}`
    return get(URL).then((response) => {
        let list = []
        if (response && response.result && Array.isArray(response.result)) {
            list = response.result
        }
        list = list.sort((a, b) => sortCallback('name', a, b))
        return {
            code: response.code,
            status: response.status,
            result: list,
        }
    })
}

interface UserRole extends ResponseType {
    result?: {
        roles: string[]
        superAdmin: boolean
    }
}

const stageMap = {
    PRECD: 'PRE',
    CD: 'DEPLOY',
    POSTCD: 'POST',
    APPROVAL: 'APPROVAL',
}

export const SourceTypeMap = {
    BranchFixed: 'SOURCE_TYPE_BRANCH_FIXED',
    WEBHOOK: 'WEBHOOK',
    BranchRegex: 'SOURCE_TYPE_BRANCH_REGEX',
}

export function getUserRole(appName?: string): Promise<UserRole> {
    return get(`${ROUTES.USER_CHECK_ROLE}${appName ? `?appName=${appName}` : ''}`)
}

export function setImageTags(request, pipelineId: number, artifactId: number) {
    return post(`${ROUTES.IMAGE_TAGGING}/${pipelineId}/${artifactId}`, request)
}

const sanitizeApprovalConfigFromApprovalMetadata = (
    approvalMetadata: UserApprovalMetadataType,
    userApprovalConfig: UserApprovalConfigType,
): UserApprovalMetadataType => {
    if (!approvalMetadata) {
        return null
    }

    const approvedUsersData = approvalMetadata.approvedUsersData || []
    const unsanitizedApprovalConfig = approvalMetadata.approvalConfig || userApprovalConfig

    return {
        ...approvalMetadata,
        approvedUsersData: approvedUsersData.map((userData) => ({
            ...userData,
            userGroups: userData.userGroups?.filter((group) => !!group?.identifier && !!group?.name) ?? [],
        })),
        approvalConfig: sanitizeUserApprovalConfig(unsanitizedApprovalConfig),
    }
}

const cdMaterialListModal = ({
    artifacts,
    offset,
    artifactId,
    artifactStatus,
    disableDefaultSelection,
    userApprovalConfig,
}: CDMaterialListModalServiceUtilProps) => {
    if (!artifacts || !artifacts.length) return []

    const markFirstSelected = offset === 0
    const startIndex = offset
    let isImageMarked = disableDefaultSelection

    const materials = artifacts.map((material, index) => {
        let artifactStatusValue = ''
        const filterState = material.filterState ?? FilterStates.ALLOWED

        if (artifactId && artifactStatus && material.id === artifactId) {
            artifactStatusValue = artifactStatus
        }

        const selectImage =
            !isImageMarked && markFirstSelected && filterState === FilterStates.ALLOWED ? !material.vulnerable : false
        if (selectImage) {
            isImageMarked = true
        }

        return {
            index: startIndex + index,
            id: material.id,
            deployedTime: material.deployed_time
                ? moment(material.deployed_time).format('ddd, DD MMM YYYY, hh:mm A')
                : 'Not Deployed',
            deployedBy: material.deployedBy,
            wfrId: material.wfrId,
            tab: CDModalTab.Changes,
            image: extractImage(material.image),
            showChanges: false,
            vulnerabilities: [],
            buildTime: material.build_time || '',
            isSelected: selectImage,
            showSourceInfo: false,
            deployed: material.deployed || false,
            latest: material.latest || false,
            vulnerabilitiesLoading: true,
            scanned: material.scanned,
            scanEnabled: material.scanEnabled,
            vulnerable: material.vulnerable,
            runningOnParentCd: material.runningOnParentCd,
            artifactStatus: artifactStatusValue,
            userApprovalMetadata: sanitizeApprovalConfigFromApprovalMetadata(
                material.userApprovalMetadata,
                userApprovalConfig,
            ),
            triggeredBy: material.triggeredBy,
            isVirtualEnvironment: material.isVirtualEnvironment,
            imageComment: material.imageComment,
            imageReleaseTags: material.imageReleaseTags,
            // It is going to be null but required in type so can't remove
            lastExecution: material.lastExecution,
            materialInfo: material.material_info
                ? material.material_info.map((mat) => ({
                      modifiedTime: mat.modifiedTime
                          ? moment(mat.modifiedTime).format('ddd, DD MMM YYYY, hh:mm A')
                          : '',
                      commitLink: createGitCommitUrl(mat.url, mat.revision),
                      author: mat.author || '',
                      message: mat.message || '',
                      revision: mat.revision || '',
                      tag: mat.tag || '',
                      webhookData: mat.webhookData || '',
                      url: mat.url || '',
                      branch:
                          (material.ciConfigureSourceType === SourceTypeMap.WEBHOOK
                              ? material.ciConfigureSourceValue
                              : mat.branch) || '',
                      type: material.ciConfigureSourceType || '',
                  }))
                : [],
            filterState,
            appliedFiltersTimestamp: material.appliedFiltersTimestamp ?? '',
            appliedFilters: material.appliedFilters ?? [],
            appliedFiltersState: material.appliedFiltersState ?? FilterStates.ALLOWED,
            createdTime: material.createdTime ?? '',
            dataSource: material.data_source ?? '',
            registryType: material.registryType ?? '',
            imagePath: material.image ?? '',
            registryName: material.registryName ?? '',
            promotionApprovalMetadata: material.promotionApprovalMetadata,
            deployedOnEnvironments: material.deployedOnEnvironments ?? [],
            deploymentWindowArtifactMetadata: material.deploymentWindowArtifactMetadata ?? null,
            configuredInReleases: material.configuredInReleases ?? [],
            appWorkflowId: material.appWorkflowId ?? null,
        }
    })
    return materials
}

const getImageApprovalPolicyDetailsFromMaterialResult = (cdMaterialsResult): ImageApprovalPolicyType => {
    const approvalUsers: string[] = cdMaterialsResult.approvalUsers || []
    const userApprovalConfig = sanitizeUserApprovalConfig(cdMaterialsResult.userApprovalConfig)
    const isPolicyConfigured = getIsManualApprovalSpecific(userApprovalConfig)
    const imageApprovalUsersInfo: ImageApprovalUsersInfoDTO = cdMaterialsResult.imageApprovalUsersInfo || {}

    const approvalUsersMap = approvalUsers.reduce(
        (acc, user) => {
            acc[user] = true
            return acc
        },
        {} as Record<string, true>,
    )

    const specificUsersAPIToken = userApprovalConfig.specificUsers.identifiers
        .filter((user) => user.startsWith(API_TOKEN_PREFIX))
        .sort(stringComparatorBySortOrder)
    const specificUsersEmails = userApprovalConfig.specificUsers.identifiers
        .filter((user) => !user.startsWith(API_TOKEN_PREFIX) && user !== DefaultUserKey.system)
        .sort(stringComparatorBySortOrder)

    const specificUsersData: ImageApprovalPolicyType['specificUsersData'] = {
        dataStore: userApprovalConfig.specificUsers.identifiers.reduce(
            (acc, email) => {
                acc[email] = {
                    email,
                    hasAccess: approvalUsersMap[email] ?? false,
                }
                return acc
            },
            {} as Record<string, UserGroupApproverType>,
        ),
        requiredCount: userApprovalConfig.specificUsers.requiredCount,
        emails: specificUsersEmails.concat(specificUsersAPIToken),
    }

    const validGroups = userApprovalConfig.userGroups.map((group) => group.identifier)

    // Have moved from Object.keys(imageApprovalUsersInfo) to approvalUsers since backend is not filtering out the users without approval
    // TODO: This check should be on BE. Need to remove this once BE is updated 
    const usersList = approvalUsers.filter((user) => user !== DefaultUserKey.system)
    const groupIdentifierToUsersMap = usersList.reduce(
        (acc, user) => {
            const userGroups = imageApprovalUsersInfo[user] || []
            userGroups.forEach((group) => {
                if (!acc[group.identifier]) {
                    acc[group.identifier] = {}
                }
                acc[group.identifier][user] = true
            })
            return acc
        },
        {} as Record<string, Record<string, true>>,
    )

    return {
        isPolicyConfigured,
        specificUsersData,
        userGroupData: userApprovalConfig.userGroups.reduce(
            (acc, group) => {
                const identifier = group.identifier
                // No need of handling api tokens here since they are not part of user groups
                const users = Object.keys(groupIdentifierToUsersMap[identifier] || {}).sort(stringComparatorBySortOrder)

                acc[identifier] = {
                    dataStore: users.reduce(
                        (acc, user) => {
                            acc[user] = {
                                email: user,
                                // As of now it will always be true, but UI has handled it in a way that can support false as well
                                hasAccess: approvalUsersMap[user] ?? false,
                            }
                            return acc
                        },
                        {} as Record<string, UserGroupApproverType>,
                    ),
                    requiredCount: group.requiredCount,
                    emails: users,
                }

                return acc
            },
            {} as Record<string, ImageApprovalPolicyUserGroupDataType>,
        ),
        // Not sorting since would change them in approval info modal to name
        validGroups,
    }
}

const processCDMaterialsApprovalInfo = (enableApproval: boolean, cdMaterialsResult): CDMaterialsApprovalInfo => {
    if (!enableApproval || !cdMaterialsResult) {
        return {
            approvalUsers: [],
            userApprovalConfig: null,
            canApproverDeploy: cdMaterialsResult?.canApproverDeploy ?? false,
            imageApprovalPolicyDetails: null,
        }
    }

    return {
        approvalUsers: cdMaterialsResult.approvalUsers,
        userApprovalConfig: sanitizeUserApprovalConfig(cdMaterialsResult.userApprovalConfig),
        canApproverDeploy: cdMaterialsResult.canApproverDeploy ?? false,
        imageApprovalPolicyDetails: getImageApprovalPolicyDetailsFromMaterialResult(cdMaterialsResult),
    }
}

export const parseRuntimeParams = (response: RuntimeParamsAPIResponseType): RuntimeParamsListItemType[] =>
    Object.entries(response?.envVariables || {})
        .map(([key, value], index) => ({ key, value, id: index }))
        .sort((a, b) => stringComparatorBySortOrder(a.key, b.key))

const processCDMaterialsMetaInfo = (cdMaterialsResult): CDMaterialsMetaInfo => {
    if (!cdMaterialsResult) {
        return {
            tagsEditable: false,
            appReleaseTagNames: [],
            hideImageTaggingHardDelete: false,
            resourceFilters: [],
            totalCount: 0,
            requestedUserId: 0,
            runtimeParams: [],
        }
    }

    return {
        appReleaseTagNames: cdMaterialsResult.appReleaseTagNames ?? [],
        tagsEditable: cdMaterialsResult.tagsEditable ?? false,
        hideImageTaggingHardDelete: cdMaterialsResult.hideImageTaggingHardDelete,
        resourceFilters: cdMaterialsResult.resourceFilters ?? [],
        totalCount: cdMaterialsResult.totalCount ?? 0,
        requestedUserId: cdMaterialsResult.requestedUserId,
        runtimeParams: parseRuntimeParams(cdMaterialsResult.runtimeParams),
    }
}

const processImagePromotionInfo = (cdMaterialsResult): ImagePromotionMaterialInfo => {
    if (!cdMaterialsResult) {
        return {
            isApprovalPendingForPromotion: false,
            imagePromotionApproverEmails: [],
        }
    }

    return {
        isApprovalPendingForPromotion: cdMaterialsResult.isApprovalPendingForPromotion,
        imagePromotionApproverEmails: cdMaterialsResult.imagePromotionApproverEmails ?? [],
    }
}

export const processCDMaterialServiceResponse = (
    cdMaterialsResult,
    stage: DeploymentNodeType,
    offset: number,
    filter: CDMaterialFilterQuery,
    disableDefaultSelection?: boolean,
): CDMaterialResponseType => {
    if (!cdMaterialsResult) {
        return {
            materials: [],
            ...processCDMaterialsMetaInfo(cdMaterialsResult),
            ...processCDMaterialsApprovalInfo(false, cdMaterialsResult),
            ...processImagePromotionInfo(cdMaterialsResult),
        }
    }

    const materials = cdMaterialListModal({
        artifacts: cdMaterialsResult.ci_artifacts,
        offset: offset ?? 0,
        artifactId: cdMaterialsResult.latest_wf_artifact_id,
        artifactStatus: cdMaterialsResult.latest_wf_artifact_status,
        disableDefaultSelection,
        userApprovalConfig: cdMaterialsResult.userApprovalConfig,
    })
    const approvalInfo = processCDMaterialsApprovalInfo(
        stage === DeploymentNodeType.CD || stage === DeploymentNodeType.APPROVAL,
        cdMaterialsResult,
    )
    const metaInfo = processCDMaterialsMetaInfo(cdMaterialsResult)
    const imagePromotionInfo = processImagePromotionInfo(cdMaterialsResult)

    // TODO: On update of service would remove from here
    const filteredMaterials =
        filter && filter === CDMaterialFilterQuery.RESOURCE
            ? materials.filter((material) => material.filterState === FilterStates.ALLOWED)
            : materials

    return {
        materials: filteredMaterials,
        ...approvalInfo,
        ...metaInfo,
        ...imagePromotionInfo,
    }
}

const getSanitizedQueryParams = (queryParams: CDMaterialServiceQueryParams): CDMaterialServiceQueryParams => {
    const { filter, ...rest } = queryParams
    return rest
}

export const genericCDMaterialsService = (
    serviceType: CDMaterialServiceEnum,
    /**
     * In case of multiple candidates are there like promotion, would be sending it as null
     */
    cdMaterialID: number,
    /**
     * Would be sending null in case we don't have stage like for case of promotion.
     */
    stage: DeploymentNodeType,
    signal: AbortSignal,
    queryParams: CDMaterialServiceQueryParams = {},
): Promise<CDMaterialResponseType> => {
    // TODO: On update of service would remove from here
    const manipulatedParams = getSanitizedQueryParams(queryParams)

    let URL
    switch (serviceType) {
        case CDMaterialServiceEnum.ROLLBACK:
            URL = getUrlWithSearchParams(
                `${ROUTES.CD_MATERIAL_GET}/${cdMaterialID}/material/rollback`,
                manipulatedParams,
            )
            break

        case CDMaterialServiceEnum.IMAGE_PROMOTION:
            // Directly sending queryParams since do not need to get queryParams sanitized in case of image promotion
            URL = getUrlWithSearchParams(ROUTES.APP_ARTIFACT_PROMOTE_MATERIAL, queryParams)
            break
        // Meant for handling getCDMaterialList
        default:
            URL = getUrlWithSearchParams(`${ROUTES.CD_MATERIAL_GET}/${cdMaterialID}/material`, {
                ...manipulatedParams,
                stage: stageMap[stage],
            })
            break
    }

    return get(URL, { signal }).then((response) =>
        processCDMaterialServiceResponse(response.result, stage, queryParams.offset, queryParams.filter),
    )
}

export function extractImage(image: string): string {
    return image ? image.split(':').pop() : ''
}

export function createGitCommitUrl(url: string, revision: string): string {
    if (!url || !revision) {
        return 'NA'
    }
    if (url.indexOf('gitlab') > 0 || url.indexOf('github') > 0 || url.indexOf('azure') > 0) {
        const urlpart = url.split('@')
        if (urlpart.length > 1) {
            return `https://${urlpart[1].split('.git')[0]}/commit/${revision}`
        }
        if (urlpart.length == 1) {
            return `${urlpart[0].split('.git')[0]}/commit/${revision}`
        }
    }
    if (url.indexOf('bitbucket') > 0) {
        const urlpart = url.split('@')
        if (urlpart.length > 1) {
            return `https://${urlpart[1].split('.git')[0]}/commits/${revision}`
        }
        if (urlpart.length == 1) {
            return `${urlpart[0].split('.git')[0]}/commits/${revision}`
        }
    }
    return 'NA'
}

export function fetchChartTemplateVersions() {
    return get(`${ROUTES.DEPLOYMENT_TEMPLATE_LIST}?appId=-1&envId=-1`)
}

export const getDefaultConfig = (): Promise<ResponseType> => get(`${ROUTES.NOTIFIER}/channel/config`)

export function getEnvironmentListMinPublic(includeAllowedDeploymentTypes?: boolean) {
    return get(
        `${ROUTES.ENVIRONMENT_LIST_MIN}?auth=false${includeAllowedDeploymentTypes ? '&showDeploymentOptions=true' : ''}`,
    )
}

export function getClusterListMin() {
    const URL = `${ROUTES.CLUSTER}/autocomplete`
    return get(URL)
}

export const getResourceGroupListRaw = (clusterId: string): Promise<ResponseType<ApiResourceType>> =>
    get(`${ROUTES.API_RESOURCE}/${ROUTES.GVK}/${clusterId}`)

export function getNamespaceListMin(clusterIdsCsv: string): Promise<EnvironmentListHelmResponse> {
    const URL = `${ROUTES.NAMESPACE}/autocomplete?ids=${clusterIdsCsv}`
    return get(URL)
}
export function getWebhookEventsForEventId(eventId: string | number) {
    const URL = `${ROUTES.GIT_HOST_EVENT}/${eventId}`
    return get(URL)
}
