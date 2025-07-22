import {
    Checkbox,
    CHECKBOX_VALUE,
    CIMaterialSidebarType,
    ConsequenceAction,
    Icon,
    Tooltip,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BulkCIDetailType } from '@Components/ApplicationGroup/AppGroup.types'
import { BULK_CI_MESSAGING } from '@Components/ApplicationGroup/Constants'
import { getCIPipelineURL, importComponentFromFELibrary } from '@Components/common'
import { BUILD_STATUS } from '@Config/constants'

import MaterialSource from '../MaterialSource'
import { TriggerBuildSidebarProps } from './types'
import { getCanNodeHaveMaterial } from './utils'

const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')
const PolicyEnforcementMessage = importComponentFromFELibrary('PolicyEnforcementMessage')

const TriggerBuildSidebar = ({
    currentSidebarTab,
    handleSidebarTabChange,
    runtimeParamsErrorState,
    materialList,
    selectMaterial,
    clearSearch,
    refreshMaterial,
    ciNodeId,
    appId,
    appList,
    handleAppChange,
    isBlobStorageConfigured,
    toggleSelectedAppIgnoreCache,
}: TriggerBuildSidebarProps) => {
    const sidebarTabs = Object.values(CIMaterialSidebarType).map((tabValue) => ({
        value: tabValue,
        label: tabValue,
    }))

    const getHandleAppChange = (newAppId: number) => (e: React.MouseEvent | React.KeyboardEvent) => {
        if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
            return
        }

        if (handleAppChange) {
            handleAppChange(newAppId)
        }
    }

    const renderAppName = (appDetails: (typeof appList)[number]): JSX.Element | null => (
        <div
            role="button"
            tabIndex={0}
            className={`pt-12 dc__tab-focus ${appDetails.appId === appId ? 'pb-12' : ''}`}
            onClick={getHandleAppChange(appDetails.appId)}
        >
            <span className="dc__word-break fw-6 fs-13 cn-9">{appDetails.name}</span>
            {appDetails.warningMessage && (
                <span className="flex dc__gap-4 left cy-7 fw-4 fs-12 dc__word-break">
                    <Icon name="ic-warning" size={12} color={null} />
                    {appDetails.warningMessage}
                </span>
            )}
            {appDetails.appId !== appId && appDetails.errorMessage && (
                <span className="flex left cr-5 fw-4 fs-12 dc__gap-4">
                    <Icon name="ic-error" size={12} color={null} />
                    <span className="dc__block dc__word-break">{appDetails.errorMessage}</span>
                </span>
            )}
            {appDetails.node?.pluginBlockState &&
                appDetails.node?.pluginBlockState?.action !== ConsequenceAction.ALLOW_FOREVER &&
                PolicyEnforcementMessage && (
                    <PolicyEnforcementMessage
                        consequence={appDetails.node.pluginBlockState}
                        configurePluginURL={getCIPipelineURL(
                            String(appDetails.appId),
                            appDetails.workflowId,
                            true,
                            appDetails.node.id,
                            false,
                            appDetails.node.isJobCI,
                            false,
                        )}
                        nodeType={WorkflowNodeType.CI}
                        shouldRenderAdditionalInfo={appDetails.appId === appId}
                    />
                )}
        </div>
    )

    const renderMaterialSource = () => (
        <MaterialSource
            material={materialList}
            selectMaterial={selectMaterial}
            refreshMaterial={{
                pipelineId: ciNodeId,
                refresh: refreshMaterial,
            }}
            clearSearch={clearSearch}
        />
    )

    const tippyContent = (tippyTile: string, tippyDescription: string): JSX.Element => (
        <div>
            <div className="fs-12 fw-6">{tippyTile}</div>
            <div className="fs-12 fw-4">{tippyDescription}</div>
        </div>
    )

    const renderTippy = (infoText: string, tippyTile: string, tippyDescription: string): JSX.Element | null => (
        <Tooltip
            alwaysShowTippyOnHover
            className="default-tt w-200 fs-12"
            arrow={false}
            placement="right"
            content={tippyContent(tippyTile, tippyDescription)}
        >
            <div className="flex left cursor dc_width-max-content">
                <Icon name="ic-info-filled" size={20} color={null} />
                <span className="fw-4 fs-13 cn-9">{infoText}</span>
            </div>
        </Tooltip>
    )

    const renderCacheSection = (currentAppDetails: BulkCIDetailType): JSX.Element | null => {
        if (!getCanNodeHaveMaterial(currentAppDetails.node)) {
            if (currentAppDetails.node.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED) {
                return renderTippy(
                    BULK_CI_MESSAGING.isFirstTrigger.infoText,
                    BULK_CI_MESSAGING.isFirstTrigger.title,
                    BULK_CI_MESSAGING.isFirstTrigger.subTitle,
                )
            }
            if (!currentAppDetails.node.storageConfigured) {
                return renderTippy(
                    BULK_CI_MESSAGING.cacheNotAvailable.infoText,
                    BULK_CI_MESSAGING.cacheNotAvailable.title,
                    BULK_CI_MESSAGING.cacheNotAvailable.subTitle,
                )
            }
            if (isBlobStorageConfigured) {
                return (
                    <div className="flex left mt-12 dc__border-top pt-12">
                        <Checkbox
                            rootClassName="mb-0"
                            isChecked={currentAppDetails.ignoreCache}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={toggleSelectedAppIgnoreCache}
                            dataTestId={`chkValidate-${currentAppDetails.appId}`}
                        >
                            Ignore cache
                        </Checkbox>
                    </div>
                )
            }
        }
        return null
    }

    const renderSelectedAppMaterial = (currentAppDetails: BulkCIDetailType): JSX.Element | null => {
        if (appId === currentAppDetails.appId && !!materialList.length) {
            return (
                <>
                    {renderMaterialSource()}
                    {renderCacheSection(currentAppDetails)}
                </>
            )
        }
        return null
    }

    const renderContent = () => {
        if (!appList) {
            return renderMaterialSource()
        }

        return appList.map((app) => (
            <div
                className={`material-list pr-12 pl-12 pb-12 ${
                    app.appId === appId ? 'bg__tertiary' : 'dc__border-bottom-n1 cursor'
                }`}
                key={`app-${app.appId}`}
            >
                {renderAppName(app)}
                {renderSelectedAppMaterial(app)}
            </div>
        ))
    }

    return (
        <div className="material-list dc__overflow-hidden flexbox-col flex-grow-1 mh-0">
            {RuntimeParamTabs ? (
                <div className="flex pt-12 pb-12 pl-16 pr-16 dc__gap-4">
                    <RuntimeParamTabs
                        tabs={sidebarTabs}
                        initialTab={currentSidebarTab}
                        onChange={handleSidebarTabChange}
                        hasError={{
                            [CIMaterialSidebarType.PARAMETERS]: !runtimeParamsErrorState.isValid,
                        }}
                    />
                </div>
            ) : (
                <div className="material-list__title material-list__title--border-bottom pt-12 pb-12 pl-20 pr-20">
                    {appList ? 'Applications' : 'Git Repository'}
                </div>
            )}

            {renderContent()}
        </div>
    )
}

export default TriggerBuildSidebar
