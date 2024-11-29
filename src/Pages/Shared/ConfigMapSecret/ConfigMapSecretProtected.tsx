import { useMemo, useState } from 'react'
import YAML from 'yaml'

import {
    Button,
    ButtonStyleType,
    CompareFromApprovalOptionsValuesType,
    ComponentSizeType,
    DraftAction,
    DraftState,
    noop,
    Progressing,
    ProtectConfigTabsType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { CompareConfigView, CompareConfigViewProps, NoPublishedVersionEmptyState } from '@Pages/Applications'

import { ReactComponent as ICCheck } from '@Icons/ic-check.svg'
import { CM_SECRET_STATE, CMSecretComponentType, CMSecretConfigData, ConfigMapSecretProtectedProps } from './types'
import { getConfigMapSecretPayload, getConfigMapSecretReadOnlyValues } from './utils'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretReadyOnly } from './ConfigMapSecretReadyOnly'
import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'
import { useConfigMapSecretFormContext } from './ConfigMapSecretFormContext'

const ApproveRequestTippy = importComponentFromFELibrary('ApproveRequestTippy', null, 'function')

export const ConfigMapSecretProtected = ({
    id,
    draftData,
    componentType,
    componentName,
    publishedConfigMapSecretData,
    cmSecretStateLabel,
    isJob,
    appChartRef,
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
    const { formDataRef } = useConfigMapSecretFormContext()

    // STATES
    const [compareFromSelectedOptionValue, setCompareFromSelectedOptionValue] =
        useState<CompareFromApprovalOptionsValuesType>(CompareFromApprovalOptionsValuesType.APPROVAL_PENDING)

    // CONSTANTS
    const isApprovalView =
        selectedProtectionViewTab === ProtectConfigTabsType.COMPARE && draftData.draftState === DraftState.AwaitApproval
    const isApprovalPendingOptionSelected =
        isApprovalView && compareFromSelectedOptionValue === CompareFromApprovalOptionsValuesType.APPROVAL_PENDING

    // DATA
    const configMapSecretData = useMemo<CMSecretConfigData>(
        () => ({ ...JSON.parse(draftData.data).configData?.[0], unAuthorized: !draftData.isAppAdmin }),
        [draftData],
    )

    const currentConfigMapSecretData = useMemo(
        () =>
            (componentType === CMSecretComponentType.ConfigMap || !configMapSecretData?.unAuthorized) &&
            (resolvedFormData ?? formDataRef.current)
                ? {
                      ...configMapSecretData,
                      ...getConfigMapSecretPayload(resolvedFormData ?? formDataRef.current),
                  }
                : configMapSecretData,
        [configMapSecretData, formDataRef.current, resolvedFormData],
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
            currentEditorConfig: editorConfigData.reduce<CompareConfigViewProps['currentEditorConfig']>(
                (acc, curr) => ({
                    ...acc,
                    [curr.displayName]: {
                        displayName: curr.displayName,
                        value: curr.value,
                    },
                }),
                (draftData.action === DraftAction.Delete && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? {
                          configuration: {
                              displayName: 'Configuration',
                              value: 'Inherit from base',
                          },
                      }
                    : {}) as CompareConfigViewProps['currentEditorConfig'],
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
            publishedEditorConfig: editorConfigData.reduce<CompareConfigViewProps['publishedEditorConfig']>(
                (acc, curr) => ({
                    ...acc,
                    [curr.displayName]: {
                        displayName: curr.displayName,
                        value: curr.value,
                    },
                }),
                (draftData.action === DraftAction.Delete && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? {
                          configuration: {
                              displayName: 'Configuration',
                              value: 'Override base',
                          },
                      }
                    : {}) as CompareConfigViewProps['publishedEditorConfig'],
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
            appChartRef={appChartRef}
            isApprovalPolicyConfigured
            isDraft
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
        if (draftData.userApprovalMetadata.hasCurrentUserApproved) {
            return (
                <p className="flex left dc__gap-8 px-12 py-8 m-0">
                    <ICCheck className="dc__no-shrink icon-dim-16 scg-5" />
                    <span className="fs-13 fw-4 lh-20 fw-6 cg-5">Approved by you</span>
                </p>
            )
        }

        const hasAccess = draftData.userApprovalMetadata.canCurrentUserApprove

        return draftData.canApprove && hasAccess ? (
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
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.positive}
                />
            </ApproveRequestTippy>
        ) : (
            <Button
                dataTestId="cm-secret-approve-btn"
                text="Approve Changes"
                size={ComponentSizeType.medium}
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
        )
    }

    const renderCompareView = () => (
        <div className="flexbox-col h-100 dc__overflow-hidden">
            <div className="flex-grow-1 dc__overflow-auto">
                {areScopeVariablesResolving ? (
                    <Progressing fullHeight pageLoader />
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
            {draftData.draftState === DraftState.AwaitApproval && ApproveRequestTippy && (
                <footer className="py-12 px-16 dc__border-top-n1 flex left dc__gap-12 configmap-secret-container__approval-tippy">
                    {renderApproveButton()}
                </footer>
            )}
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
