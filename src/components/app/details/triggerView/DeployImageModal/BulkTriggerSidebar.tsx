import { SyntheticEvent, useMemo } from 'react'

import {
    API_STATUS_CODES,
    BULK_DEPLOY_ACTIVE_IMAGE_TAG,
    BULK_DEPLOY_LATEST_IMAGE_TAG,
    CD_MATERIAL_SIDEBAR_TABS,
    CDMaterialSidebarType,
    CDMaterialType,
    CommonNodeAttr,
    DeploymentNodeType,
    Icon,
    SelectPicker,
    SelectPickerOptionType,
    stopPropagation,
    stringComparatorBySortOrder,
    Tooltip,
    TriggerBlockType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BulkCDDetailType } from '@Components/ApplicationGroup/AppGroup.types'
import { BULK_CD_MESSAGING } from '@Components/ApplicationGroup/Constants'
import { importComponentFromFELibrary } from '@Components/common'

import { getIsMaterialApproved } from '../cdMaterials.utils'
import { BulkTriggerSidebarProps } from './types'
import { getIsExceptionUser } from './utils'

const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const PolicyEnforcementMessage = importComponentFromFELibrary('PolicyEnforcementMessage')
const TriggerBlockedError = importComponentFromFELibrary('TriggerBlockedError', null, 'function')

const BulkTriggerSidebar = ({
    appId,
    stageType,
    appInfoMap,
    selectedTagName,
    handleTagChange,
    changeApp,
    handleSidebarTabChange,
    currentSidebarTab,
}: BulkTriggerSidebarProps) => {
    const isPreOrPostCD = stageType === DeploymentNodeType.PRECD || stageType === DeploymentNodeType.POSTCD

    const tagOptions: SelectPickerOptionType<string>[] = useMemo(() => {
        const tagNames = new Set<string>()
        Object.values(appInfoMap).forEach((app) => {
            app.materialResponse?.appReleaseTagNames?.forEach((tag) => tagNames.add(tag))
        })

        return [BULK_DEPLOY_LATEST_IMAGE_TAG, BULK_DEPLOY_ACTIVE_IMAGE_TAG].concat(
            Array.from(tagNames)
                .sort(stringComparatorBySortOrder)
                .map((tag) => ({ label: tag, value: tag })),
        )
    }, [appInfoMap])

    const selectedTagOption = useMemo(() => {
        const selectedTag = tagOptions.find((option) => option.value === selectedTagName)
        const areMultipleTagsPresent = Object.values(appInfoMap).some((appDetails) => {
            const selectedImage = appDetails.materialResponse?.materials?.find(
                (material: CDMaterialType) => material.isSelected,
            )

            if (!selectedImage) {
                return false
            }

            return !selectedImage.imageReleaseTags?.some((tagDetails) => tagDetails.tagName === selectedTagName)
        })

        if (areMultipleTagsPresent || !selectedTag) {
            return { label: 'Multiple Tags', value: '' }
        }

        return selectedTag
    }, [selectedTagName, tagOptions, appInfoMap])

    const sortedAppValues = useMemo(
        () => Object.values(appInfoMap).sort((a, b) => stringComparatorBySortOrder(a.appName, b.appName)),
        [appInfoMap],
    )

    const getHandleAppChange = (newAppId: number) => (e: SyntheticEvent) => {
        stopPropagation(e)

        if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
            return
        }

        changeApp(newAppId)
    }

    const renderDeploymentWithoutApprovalWarning = (app: BulkCDDetailType) => {
        const isExceptionUser = getIsExceptionUser(app.materialResponse)

        if (!isExceptionUser) {
            return null
        }

        const selectedMaterial: CDMaterialType = app.materialResponse?.materials?.find(
            (mat: CDMaterialType) => mat.isSelected,
        )

        if (!selectedMaterial || getIsMaterialApproved(selectedMaterial?.userApprovalMetadata)) {
            return null
        }

        return (
            <div className="flex left dc__gap-4 mb-4">
                <Icon name="ic-warning" color={null} size={14} />
                <p className="m-0 fs-12 lh-16 fw-4 cy-7">Non-approved image selected</p>
            </div>
        )
    }

    const renderAppWarningAndErrors = (app: BulkCDDetailType) => {
        const isAppSelected = app.appId === appId
        // We don't support cd for mandatory plugins
        const blockedPluginNodeType: CommonNodeAttr['type'] =
            stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

        if (app.materialError?.code === API_STATUS_CODES.UNAUTHORIZED) {
            return (
                <div className="flex left dc__gap-4">
                    <Icon name="ic-locked" color="Y500" size={12} />
                    <span className="cy-7 fw-4 fs-12 dc__truncate">{BULK_CD_MESSAGING.unauthorized.title}</span>
                </div>
            )
        }

        if (app.isTriggerBlockedDueToPlugin) {
            return (
                <PolicyEnforcementMessage
                    consequence={app.consequence}
                    configurePluginURL={app.configurePluginURL}
                    nodeType={blockedPluginNodeType}
                    shouldRenderAdditionalInfo={isAppSelected}
                />
            )
        }

        if (app.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG) {
            return <TriggerBlockedError stageType={stageType} />
        }

        if ((!!app.warningMessage && !app.showPluginWarning) || app.materialError?.errors?.length) {
            return (
                <div className="flex left top dc__gap-4">
                    <Icon name="ic-warning-fill" color="R500" size={14} />
                    <span className="fw-4 fs-12 cr-5 dc__truncate--clamp-2">
                        {app.warningMessage || app.materialError?.errors?.[0]?.userMessage}
                    </span>
                </div>
            )
        }

        if (app.showPluginWarning) {
            return (
                <PolicyEnforcementMessage
                    consequence={app.consequence}
                    configurePluginURL={app.configurePluginURL}
                    nodeType={blockedPluginNodeType}
                    shouldRenderAdditionalInfo={isAppSelected}
                />
            )
        }

        return null
    }

    return (
        <div className="flexbox-col h-100 dc__overflow-auto bg__primary">
            <div className="dc__position-sticky dc__top-0 pt-12 bg__primary dc__zi-1">
                {!!(RuntimeParamTabs && isPreOrPostCD) && (
                    <div className="px-16 pb-8">
                        <RuntimeParamTabs
                            tabs={CD_MATERIAL_SIDEBAR_TABS}
                            initialTab={currentSidebarTab}
                            onChange={handleSidebarTabChange}
                            hasError={{
                                [CDMaterialSidebarType.PARAMETERS]:
                                    appInfoMap[+appId]?.deployViewState?.runtimeParamsErrorState &&
                                    !appInfoMap[+appId].deployViewState.runtimeParamsErrorState.isValid,
                            }}
                        />
                    </div>
                )}

                {currentSidebarTab === CDMaterialSidebarType.IMAGE && (
                    <>
                        <span className="px-16">Select image by release tag</span>
                        <div className="tag-selection-dropdown px-16 pt-6 pb-12">
                            <SelectPicker
                                name="bulk-cd-trigger__select-tag"
                                inputId="bulk-cd-trigger__select-tag"
                                isSearchable
                                options={tagOptions}
                                value={selectedTagOption}
                                icon={<Icon name="ic-tag" color={null} />}
                                onChange={handleTagChange}
                                isDisabled={false}
                                // Not changing it for backward compatibility for automation
                                classNamePrefix="build-config__select-repository-containing-code"
                                autoFocus
                            />
                        </div>
                    </>
                )}
                <div className="dc__border-bottom py-8 px-16 w-100">
                    <span className="fw-6 fs-13 cn-7">APPLICATIONS</span>
                </div>
            </div>

            {sortedAppValues.map((appDetails) => (
                <div
                    key={`app-${appDetails.appId}`}
                    className={`p-16 dc__border-bottom-n1 cursor w-100 dc__tab-focus ${
                        appDetails.appId === appId ? 'bg__tertiary' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={getHandleAppChange(appDetails.appId)}
                    onKeyDown={getHandleAppChange(appDetails.appId)}
                >
                    <Tooltip content={appDetails.appName}>
                        <span className="lh-20 cn-9 fw-6 fs-13 dc__truncate">{appDetails.appName}</span>
                    </Tooltip>
                    {renderDeploymentWithoutApprovalWarning(appDetails)}
                    {renderAppWarningAndErrors(appDetails)}
                </div>
            ))}
        </div>
    )
}

export default BulkTriggerSidebar
