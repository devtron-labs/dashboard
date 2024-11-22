import { useMemo, useState } from 'react'
import YAML from 'yaml'

import {
    CompareFromApprovalOptionsValuesType,
    DraftAction,
    DraftState,
    noop,
    OverrideMergeStrategyType,
    Progressing,
    ProtectConfigTabsType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { CompareConfigView, CompareConfigViewProps, NoPublishedVersionEmptyState } from '@Pages/Applications'

import { CM_SECRET_STATE, CMSecretComponentType, CMSecretConfigData, ConfigMapSecretProtectedProps } from './types'
import { getConfigMapSecretPayload, getConfigMapSecretReadOnlyValues } from './utils'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretReadyOnly } from './ConfigMapSecretReadyOnly'
import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'
import { ConfigMapSecretApproveButton } from './ConfigMapSecretApproveButton'
import { useConfigMapSecretFormContext } from './ConfigMapSecretFormContext'

export const ConfigMapSecretProtected = ({
    id,
    formMethodsRef,
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
    mergeStrategy,
    shouldMergeTemplateWithPatches,
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
                : {
                      ...configMapSecretData,
                      data:
                          configMapSecretData.mergeStrategy === OverrideMergeStrategyType.PATCH
                              ? configMapSecretData.patchData
                              : configMapSecretData.data,
                  },
        [configMapSecretData, formDataRef.current, resolvedFormData],
    )

    // METHODS
    const handleCompareFromOptionSelection = (option: SelectPickerOptionType) =>
        setCompareFromSelectedOptionValue(option.value as CompareFromApprovalOptionsValuesType)

    const getConfigMapSecretDiffViewData = () => {
        if (draftData.action === DraftAction.Delete) {
            return isApprovalPendingOptionSelected ? inheritedConfigMapSecretData : null
        }

        const _configMapSecretData = isApprovalPendingOptionSelected
            ? {
                  ...configMapSecretData,
                  ...(shouldMergeTemplateWithPatches ? { patchData: configMapSecretData.data } : {}),
              }
            : {
                  ...currentConfigMapSecretData,
                  ...(shouldMergeTemplateWithPatches
                      ? { data: { ...inheritedConfigMapSecretData.data, ...currentConfigMapSecretData.data } }
                      : {}),
              }

        return _configMapSecretData
    }

    const getCurrentEditorConfig = (): Pick<
        CompareConfigViewProps,
        'currentEditorConfig' | 'currentEditorTemplate'
    > => {
        const _configMapSecretData = getConfigMapSecretDiffViewData()
        const { configData: editorConfigData, data } = getConfigMapSecretReadOnlyValues({
            isJob,
            componentType,
            configMapSecretData: _configMapSecretData,
            mergeStrategy: isApprovalPendingOptionSelected ? mergeStrategy : OverrideMergeStrategyType.REPLACE,
            cmSecretStateLabel,
        })

        return {
            currentEditorConfig: {
                ...editorConfigData.reduce<CompareConfigViewProps['currentEditorConfig']>(
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
                mergeStrategy: {
                    displayName: 'Merge strategy',
                    value: _configMapSecretData?.mergeStrategy,
                },
            },
            currentEditorTemplate: data ? YAML.parse(data) : undefined,
        }
    }

    const getPublishedEditorConfig = (): Pick<
        CompareConfigViewProps,
        'publishedEditorConfig' | 'publishedEditorTemplate'
    > => {
        const { configData: editorConfigData, data } = getConfigMapSecretReadOnlyValues({
            componentType,
            cmSecretStateLabel,
            configMapSecretData: cmSecretStateLabel !== CM_SECRET_STATE.INHERITED ? publishedConfigMapSecretData : null,
            isJob,
            mergeStrategy:
                publishedConfigMapSecretData.mergeStrategy === OverrideMergeStrategyType.REPLACE ||
                shouldMergeTemplateWithPatches
                    ? OverrideMergeStrategyType.REPLACE
                    : OverrideMergeStrategyType.PATCH,
        })

        return {
            publishedEditorConfig: {
                ...editorConfigData.reduce<CompareConfigViewProps['publishedEditorConfig']>(
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
                mergeStrategy: {
                    displayName: 'Merge strategy',
                    value: publishedConfigMapSecretData?.mergeStrategy,
                },
            },
            publishedEditorTemplate: data ? YAML.parse(data) : undefined,
        }
    }

    // RENDERERS
    const renderFormView = () => (
        <ConfigMapSecretForm
            ref={formMethodsRef}
            configMapSecretData={configMapSecretData}
            inheritedConfigMapSecretData={inheritedConfigMapSecretData}
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
            mergeStrategy={mergeStrategy}
            appChartRef={appChartRef}
            isProtected
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
            <ConfigMapSecretApproveButton
                componentName={componentName}
                configMapSecretData={configMapSecretData}
                draftData={draftData}
                parentName={parentName}
                updateCMSecret={updateCMSecret}
            />
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
                        cmSecretStateLabel={cmSecretStateLabel}
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
