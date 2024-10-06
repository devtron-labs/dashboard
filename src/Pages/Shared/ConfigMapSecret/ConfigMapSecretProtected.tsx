import { useMemo, useRef, useState } from 'react'
import YAML from 'yaml'

import {
    abortPreviousRequests,
    Button,
    ButtonStyleType,
    CompareFromApprovalOptionsValuesType,
    ConfigDatum,
    DraftAction,
    DraftState,
    noop,
    Progressing,
    ProtectConfigTabsType,
    SelectPickerOptionType,
    useAsync,
    useUserEmail,
} from '@devtron-labs/devtron-fe-common-lib'

import { hasApproverAccess, importComponentFromFELibrary } from '@Components/common'
import CompareConfigView from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/CompareConfigView'
import NoPublishedVersionEmptyState from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/NoPublishedVersionEmptyState'
import { CompareConfigViewProps } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/types'

import { getConfigMapSecretConfigData } from './ConfigMapSecret.service'
import { CM_SECRET_STATE, CMSecretComponentType, CMSecretConfigData, ConfigMapSecretProtectedProps } from './types'
import { getConfigMapSecretPayload, getConfigMapSecretReadOnlyValues } from './utils'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretReadyOnly } from './ConfigMapSecretReadyOnly'
import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'
import { useConfigMapSecretFormContext } from './ConfigMapSecretFormContext'

const ApproveRequestTippy = importComponentFromFELibrary('ApproveRequestTippy', null, 'function')

export const ConfigMapSecretProtected = ({
    appName,
    envName,
    id,
    draftData,
    componentType,
    componentName,
    publishedConfigMapSecretData,
    cmSecretStateLabel,
    isJob,
    selectedProtectionViewTab,
    parentName,
    inheritedConfigMapSecretData,
    resolvedFormData,
    areScopeVariablesResolving,
    onError,
    onSubmit,
    updateCMSecret,
    restoreYAML,
    setRestoreYAML,
}: ConfigMapSecretProtectedProps) => {
    // HOOKS
    const { email } = useUserEmail()
    const { formDataRef } = useConfigMapSecretFormContext()

    // STATES
    const [compareFromSelectedOptionValue, setCompareFromSelectedOptionValue] =
        useState<CompareFromApprovalOptionsValuesType>(CompareFromApprovalOptionsValuesType.APPROVAL_PENDING)

    // REFS
    const abortControllerRef = useRef<AbortController>(new AbortController())

    // CONSTANTS
    const isApprovalView = draftData.draftState === DraftState.AwaitApproval
    const isApprovalPendingOptionSelected =
        isApprovalView && compareFromSelectedOptionValue === CompareFromApprovalOptionsValuesType.APPROVAL_PENDING

    // ASYNC CALLS
    const [protectedSecretDataResLoading, protectedSecretDataRes] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    getConfigMapSecretConfigData({
                        appName,
                        envName,
                        resourceId: id,
                        name: publishedConfigMapSecretData.name,
                        componentType,
                        appId: null,
                        envId: null,
                        abortControllerRef,
                    }),
                abortControllerRef,
            ),
        [],
        draftData.action === DraftAction.Delete &&
            cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN &&
            componentType === CMSecretComponentType.Secret &&
            !publishedConfigMapSecretData?.unAuthorized,
    )

    const protectedSecretData = useMemo<CMSecretConfigData>(() => {
        if (!protectedSecretDataResLoading && protectedSecretDataRes) {
            const { data } = protectedSecretDataRes.secretsData
            if (data.configData?.length) {
                return { ...publishedConfigMapSecretData, unAuthorized: false }
            }

            return null
        }

        return null
    }, [protectedSecretDataResLoading, protectedSecretDataRes])

    const configMapSecretData = useMemo<CMSecretConfigData>(() => {
        if (
            selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED &&
            cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED
        ) {
            return null
        }

        return draftData.action === DraftAction.Delete &&
            cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN &&
            componentType === CMSecretComponentType.Secret
            ? protectedSecretData
            : { ...JSON.parse(draftData.data).configData?.[0], unAuthorized: !draftData.isAppAdmin }
    }, [selectedProtectionViewTab, draftData, cmSecretStateLabel, publishedConfigMapSecretData, protectedSecretData])

    const currentConfigMapSecretData = useMemo(
        () => ({
            unAuthorized: configMapSecretData?.unAuthorized,
            ...(formDataRef.current
                ? (getConfigMapSecretPayload(resolvedFormData ?? formDataRef.current) as ConfigDatum)
                : configMapSecretData),
        }),
        [configMapSecretData],
    )

    // METHODS
    const handleCompareFromOptionSelection = (option: SelectPickerOptionType) =>
        setCompareFromSelectedOptionValue(option.value as CompareFromApprovalOptionsValuesType)

    const getConfigMapSecretDiffViewData = () => {
        if (draftData.action === DraftAction.Delete) {
            return isApprovalPendingOptionSelected ? inheritedConfigMapSecretData : null
        }

        return isApprovalPendingOptionSelected ? configMapSecretData : currentConfigMapSecretData
    }

    const getCurrentEditorConfig = (): Pick<
        CompareConfigViewProps,
        'currentEditorConfig' | 'currentEditorTemplate'
    > => {
        const { configData: editorConfigData, data } = getConfigMapSecretReadOnlyValues({
            isJob,
            componentType,
            configMapSecretData: getConfigMapSecretDiffViewData(),
        })

        return {
            currentEditorConfig: editorConfigData.reduce<Record<string, { displayName: string; value: string }>>(
                (acc, curr) => ({
                    ...acc,
                    [curr.displayName]: {
                        displayName: curr.displayName,
                        value: curr.value,
                    },
                }),
                draftData.action === DraftAction.Delete && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? {
                          configuration: {
                              displayName: 'Configuration',
                              value: 'Inherit from base',
                          },
                      }
                    : {},
            ),
            currentEditorTemplate: data ? YAML.parse(data) : undefined,
        }
    }

    const getPublishedEditorConfig = (): Pick<
        CompareConfigViewProps,
        'publishedEditorConfig' | 'publishedEditorTemplate'
    > => {
        const { configData: editorConfigData, data } = getConfigMapSecretReadOnlyValues({
            componentType,
            configMapSecretData: publishedConfigMapSecretData,
            isJob,
        })

        return {
            publishedEditorConfig: editorConfigData.reduce<Record<string, { displayName: string; value: string }>>(
                (acc, curr) => ({
                    ...acc,
                    [curr.displayName]: {
                        displayName: curr.displayName,
                        value: curr.value,
                    },
                }),
                draftData.action === DraftAction.Delete && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? {
                          configuration: {
                              displayName: 'Configuration',
                              value: 'Override base',
                          },
                      }
                    : {},
            ),
            publishedEditorTemplate: data ? YAML.parse(data) : undefined,
        }
    }

    // RENDERERS
    const renderFormView = () => (
        <ConfigMapSecretForm
            configMapSecretData={configMapSecretData}
            id={id}
            componentType={componentType}
            cmSecretStateLabel={
                selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT &&
                draftData.action === DraftAction.Delete &&
                cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? CM_SECRET_STATE.INHERITED
                    : cmSecretStateLabel
            }
            isJob={isJob}
            isProtected
            isSubmitting={false}
            onCancel={noop}
            onError={onError}
            onSubmit={onSubmit}
            resolvedFormData={resolvedFormData}
            areScopeVariablesResolving={areScopeVariablesResolving}
            restoreYAML={restoreYAML}
            setRestoreYAML={setRestoreYAML}
        />
    )

    const renderApproveButton = () => {
        if (draftData.draftState !== DraftState.AwaitApproval || !ApproveRequestTippy) {
            return null
        }

        const hasAccess = hasApproverAccess(email, draftData.approvers)

        return (
            <div className="py-12 px-16 dc__border-top-n1 flex right dc__gap-12">
                {hasAccess && draftData.canApprove ? (
                    <ApproveRequestTippy
                        draftId={draftData.draftId}
                        draftVersionId={draftData.draftVersionId}
                        resourceName={componentName}
                        reload={updateCMSecret}
                        envName={parentName}
                    >
                        <Button
                            dataTestId="cm-secret-approve-btn"
                            text="Approve Changes"
                            style={ButtonStyleType.positive}
                        />
                    </ApproveRequestTippy>
                ) : (
                    <Button
                        dataTestId="cm-secret-approve-btn"
                        text="Approve Changes"
                        style={ButtonStyleType.positive}
                        disabled
                        showTooltip
                        tooltipProps={{
                            placement: 'top-end',
                            content: hasAccess
                                ? 'You have made changes to this file. Users who have edited cannot approve the changes.'
                                : 'You do not have permission to approve configuration changes for this application - environment combination.',
                        }}
                    />
                )}
            </div>
        )
    }

    const renderCompareView = () => (
        <div className="flexbox-col h-100">
            <div className="flex-grow-1">
                {areScopeVariablesResolving ? (
                    <Progressing fullHeight size={48} />
                ) : (
                    <CompareConfigView
                        compareFromSelectedOptionValue={compareFromSelectedOptionValue}
                        handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                        {...getCurrentEditorConfig()}
                        {...getPublishedEditorConfig()}
                        isApprovalView={isApprovalView}
                        isDeleteOverrideView={draftData.action === DraftAction.Delete}
                    />
                )}
            </div>
            {renderApproveButton()}
        </div>
    )

    const renderContent = () => {
        switch (selectedProtectionViewTab) {
            case ProtectConfigTabsType.PUBLISHED:
                if (cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED || !publishedConfigMapSecretData) {
                    return <NoPublishedVersionEmptyState isOverride={false} />
                }

                if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED) {
                    return <ConfigMapSecretNullState nullStateType="NOT_OVERRIDDEN" />
                }

                return (
                    <ConfigMapSecretReadyOnly
                        componentType={componentType}
                        isJob={isJob}
                        configMapSecretData={publishedConfigMapSecretData}
                        areScopeVariablesResolving={areScopeVariablesResolving}
                    />
                )
            case ProtectConfigTabsType.EDIT_DRAFT:
                if (draftData.action === DraftAction.Delete) {
                    return cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN ? (
                        <ConfigMapSecretNullState nullStateType="DELETE_OVERRIDE" />
                    ) : (
                        <ConfigMapSecretNullState nullStateType="DELETE" componentName={componentName} />
                    )
                }

                return renderFormView()
            case ProtectConfigTabsType.COMPARE:
                return renderCompareView()
            default:
                return null
        }
    }

    return renderContent()
}
