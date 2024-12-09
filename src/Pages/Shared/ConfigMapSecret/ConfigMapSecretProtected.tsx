import { useMemo, useState } from 'react'
import YAML from 'yaml'

import {
    applyCompareDiffOnUneditedDocument,
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
import { importComponentFromFELibrary } from '@Components/common'

import { CM_SECRET_STATE, CMSecretConfigData, ConfigMapSecretProtectedProps } from './types'
import { getConfigMapSecretPayload, getConfigMapSecretReadOnlyValues } from './utils'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { ConfigMapSecretReadyOnly } from './ConfigMapSecretReadyOnly'
import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'

const ConfigMapSecretApproveButton = importComponentFromFELibrary('ConfigMapSecretApproveButton', null, 'function')

export const ConfigMapSecretProtected = ({
    id,
    draftData,
    componentType,
    componentName,
    publishedConfigMapSecretData,
    cmSecretStateLabel,
    isJob,
    disableDataTypeChange,
    appChartRef,
    selectedProtectionViewTab,
    parentName,
    inheritedConfigMapSecretData,
    areScopeVariablesResolving,
    onError,
    onSubmit,
    updateCMSecret,
    shouldMergeTemplateWithPatches,
    useFormProps,
}: ConfigMapSecretProtectedProps) => {
    const { data: formData } = useFormProps

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
        () => ({ ...draftData.parsedData.configData?.[0], unAuthorized: !draftData.isAppAdmin }),
        [draftData],
    )

    // METHODS
    const handleCompareFromOptionSelection = (option: SelectPickerOptionType) =>
        setCompareFromSelectedOptionValue(option.value as CompareFromApprovalOptionsValuesType)

    const getConfigMapSecretDiffViewData = () => {
        if (draftData.action === DraftAction.Delete) {
            return {
                diffViewData: isApprovalPendingOptionSelected ? inheritedConfigMapSecretData : null,
                mergeStrategyToShow: inheritedConfigMapSecretData?.mergeStrategy,
            }
        }

        const showFormData = !isApprovalPendingOptionSelected && !configMapSecretData.unAuthorized
        const updatedConfigMapSecretData = {
            ...configMapSecretData,
            // -> !isApprovalPendingOptionSelected means "Values from draft"
            ...(showFormData ? getConfigMapSecretPayload(formData) : {}),
        }

        const showMergedData =
            shouldMergeTemplateWithPatches &&
            updatedConfigMapSecretData.mergeStrategy === OverrideMergeStrategyType.PATCH

        return {
            mergeStrategyToShow: updatedConfigMapSecretData.mergeStrategy,
            diffViewData: !showFormData
                ? {
                      ...updatedConfigMapSecretData,
                      mergeStrategy: showMergedData
                          ? OverrideMergeStrategyType.REPLACE
                          : updatedConfigMapSecretData.mergeStrategy,
                  }
                : {
                      ...updatedConfigMapSecretData,
                      mergeStrategy: OverrideMergeStrategyType.REPLACE,
                      ...(showMergedData
                          ? {
                                data: applyCompareDiffOnUneditedDocument(inheritedConfigMapSecretData?.data || {}, {
                                    ...(inheritedConfigMapSecretData?.data || {}),
                                    ...updatedConfigMapSecretData.data,
                                }),
                            }
                          : {}),
                  },
        }
    }

    const getCurrentEditorConfig = (): Pick<
        CompareConfigViewProps,
        'currentEditorConfig' | 'currentEditorTemplate'
    > => {
        const { diffViewData, mergeStrategyToShow } = getConfigMapSecretDiffViewData()
        const { configData: editorConfigData, data } = getConfigMapSecretReadOnlyValues({
            isJob,
            componentType,
            configMapSecretData: diffViewData,
            cmSecretStateLabel,
        })

        return {
            currentEditorConfig: {
                ...editorConfigData.reduce<CompareConfigViewProps['currentEditorConfig']>(
                    (acc, curr) => ({
                        ...acc,
                        [curr.key]: {
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
                    value: mergeStrategyToShow,
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
            configMapSecretData:
                publishedConfigMapSecretData && cmSecretStateLabel !== CM_SECRET_STATE.INHERITED
                    ? {
                          ...publishedConfigMapSecretData,
                          ...(publishedConfigMapSecretData.mergeStrategy === OverrideMergeStrategyType.PATCH
                              ? {
                                    mergeStrategy: shouldMergeTemplateWithPatches
                                        ? OverrideMergeStrategyType.REPLACE
                                        : OverrideMergeStrategyType.PATCH,
                                }
                              : {}),
                      }
                    : null,
            isJob,
        })

        return {
            publishedEditorConfig: {
                ...editorConfigData.reduce<CompareConfigViewProps['publishedEditorConfig']>(
                    (acc, curr) => ({
                        ...acc,
                        [curr.key]: {
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
            appChartRef={appChartRef}
            isProtected
            isDraft
            disableDataTypeChange={disableDataTypeChange}
            isSubmitting={false}
            onCancel={noop}
            onError={onError}
            onSubmit={onSubmit}
            areScopeVariablesResolving={areScopeVariablesResolving}
            useFormProps={useFormProps}
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
