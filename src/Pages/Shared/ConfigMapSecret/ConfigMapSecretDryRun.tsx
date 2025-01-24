import { useEffect, useMemo, useRef } from 'react'
import { Prompt, useLocation, useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    APIResponseHandler,
    BaseURLParams,
    Button,
    CodeEditor,
    ComponentSizeType,
    DraftAction,
    DraftState,
    DryRunEditorMode,
    GenericEmptyState,
    hasHashiOrAWS,
    MODES,
    useAsync,
    checkIfPathIsMatching,
    usePrompt,
    CM_SECRET_STATE,
    ConfigMapSecretReadyOnly,
    ToggleResolveScopedVariables,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { NoPublishedVersionEmptyState, SelectMergeStrategy } from '@Pages/Applications'

import { DEFAULT_MERGE_STRATEGY } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/constants'
import { getConfigMapSecretManifest } from './ConfigMapSecret.service'
import { ConfigMapSecretDryRunProps } from './types'
import { renderExternalInfo } from './helpers'
import { getDryRunConfigMapSecretData } from './utils'

import { ConfigMapSecretNullState } from './ConfigMapSecretNullState'

const DryRunEditorModeSelect = importComponentFromFELibrary('DryRunEditorModeSelect', null, 'function')
const ConfigMapSecretApproveButton = importComponentFromFELibrary('ConfigMapSecretApproveButton', null, 'function')

export const ConfigMapSecretDryRun = ({
    id = null,
    isJob,
    cmSecretStateLabel,
    componentType,
    componentName,
    resolveScopedVariables,
    areScopeVariablesResolving,
    handleToggleScopedVariablesView,
    isApprovalPolicyConfigured,
    draftData,
    inheritedConfigMapSecretData,
    publishedConfigMapSecretData,
    dryRunEditorMode,
    handleChangeDryRunEditorMode,
    isSubmitting,
    onSubmit,
    showCrudButtons,
    parentName,
    updateCMSecret,
    formData,
    isFormDirty,
}: ConfigMapSecretDryRunProps) => {
    // HOOKS
    const location = useLocation()
    const { appId, envId } = useParams<Pick<BaseURLParams, 'appId' | 'envId'>>()
    const abortControllerRef = useRef<AbortController>(null)

    // CONSTANTS
    const isCreateView = id === null
    const shouldPrompt = isCreateView && isFormDirty

    // PROMPT FOR UNSAVED CHANGES
    usePrompt({ shouldPrompt })

    const dryRunConfigMapSecretData = useMemo(
        () =>
            getDryRunConfigMapSecretData({
                cmSecretStateLabel,
                draftData,
                dryRunEditorMode,
                formData,
                inheritedConfigMapSecretData,
                publishedConfigMapSecretData,
            }),
        [
            isApprovalPolicyConfigured,
            dryRunEditorMode,
            formData,
            draftData,
            publishedConfigMapSecretData,
            inheritedConfigMapSecretData,
        ],
    )

    // DATA CONSTANTS
    const isDryRunDataPresent = !!dryRunConfigMapSecretData
    const fileDeletionRequest =
        draftData?.action === DraftAction.Delete &&
        (dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING ||
            dryRunEditorMode === DryRunEditorMode.VALUES_FROM_DRAFT)
    const publishedVersionDoesNotExist =
        dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES &&
        (cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
            cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED ||
            !publishedConfigMapSecretData)
    const hideManifest =
        isJob || dryRunConfigMapSecretData?.external || fileDeletionRequest || publishedVersionDoesNotExist
    const isSaveButtonDisabled =
        isSubmitting ||
        areScopeVariablesResolving ||
        hasHashiOrAWS(dryRunConfigMapSecretData?.externalType) ||
        resolveScopedVariables ||
        (formData.isSecret && dryRunConfigMapSecretData?.unAuthorized)

    useEffect(() => {
        abortControllerRef.current = new AbortController()

        return () => {
            abortControllerRef.current.abort()
        }
    }, [dryRunConfigMapSecretData])

    const [
        configMapSecretManifestLoading,
        configMapSecretManifest,
        configMapSecretManifestError,
        reloadConfigMapSecretManifest,
    ] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    getConfigMapSecretManifest(
                        {
                            appId: +appId,
                            environmentId: envId ? +envId : null,
                            mergeStrategy: formData.mergeStrategy,
                            resourceName: dryRunConfigMapSecretData.name,
                            resourceType: componentType,
                            values: dryRunConfigMapSecretData.data,
                        },
                        abortControllerRef,
                    ),
                abortControllerRef,
            ),
        [dryRunConfigMapSecretData],
        isDryRunDataPresent && !hideManifest,
    )

    // RENDERERS
    const renderLHSContent = () => {
        if (publishedVersionDoesNotExist) {
            return (
                <NoPublishedVersionEmptyState
                    isOverride={cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED && !!publishedConfigMapSecretData}
                />
            )
        }

        if (fileDeletionRequest) {
            return cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN ? (
                <ConfigMapSecretNullState nullStateType="DELETE_OVERRIDE" />
            ) : (
                <ConfigMapSecretNullState nullStateType="DELETE" componentName={componentName} />
            )
        }

        if (!isDryRunDataPresent) {
            return <GenericEmptyState title="No data present for manifest" />
        }

        return (
            <>
                <ConfigMapSecretReadyOnly
                    componentType={componentType}
                    isJob={isJob}
                    cmSecretStateLabel={CM_SECRET_STATE.BASE}
                    configMapSecretData={{ ...dryRunConfigMapSecretData, mergeStrategy: null }}
                    areScopeVariablesResolving={areScopeVariablesResolving}
                    fallbackMergeStrategy={DEFAULT_MERGE_STRATEGY}
                />
                {renderExternalInfo(
                    dryRunConfigMapSecretData.externalType,
                    dryRunConfigMapSecretData.external,
                    componentType,
                    'px-16 pb-16',
                )}
            </>
        )
    }

    const renderLHS = () => (
        <div className="h-100 flexbox-col dc__border-right dc__overflow-hidden">
            <div className="px-12 py-6 dc__border-bottom-n1 flexbox dc__align-items-center dc__content-space dc__gap-8">
                <div className="flex left dc__gap-8">
                    <ICFileCode className="dc__no-shrink scn-9 icon-dim-16" />
                    {DryRunEditorModeSelect && draftData?.draftState === DraftState.AwaitApproval ? (
                        <DryRunEditorModeSelect
                            selectedOptionValue={dryRunEditorMode}
                            handleChangeDryRunEditorMode={handleChangeDryRunEditorMode}
                        />
                    ) : (
                        <span className="cn-9 fs-12 fw-6 lh-20">Values</span>
                    )}
                </div>
                <div className="flex left dc__gap-8">
                    {dryRunConfigMapSecretData?.mergeStrategy && (
                        <SelectMergeStrategy mergeStrategy={dryRunConfigMapSecretData.mergeStrategy} variant="text" />
                    )}
                    <div className="dc__border-right-n1 dc__align-self-stretch mt-2 mb-2" />
                    <ToggleResolveScopedVariables
                        resolveScopedVariables={resolveScopedVariables}
                        handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                        isDisabled={areScopeVariablesResolving}
                    />
                </div>
            </div>
            {renderLHSContent()}
        </div>
    )

    const renderRHS = () => (
        <div className="flexbox-col">
            <div className="px-12 py-6 dc__border-bottom-n1 flexbox dc__align-items-center dc__gap-8">
                <ICFilePlay className="icon-dim-16 scn-9" />
                <h3 className="m-0 fw-6 fs-12 lh-20 cn-9">Manifest generated from merged</h3>
            </div>
            <APIResponseHandler
                isLoading={
                    configMapSecretManifestLoading || (!configMapSecretManifestError && !configMapSecretManifest)
                }
                error={!configMapSecretManifestLoading && configMapSecretManifestError}
                progressingProps={{ pageLoader: true }}
                errorScreenManagerProps={{
                    reload: reloadConfigMapSecretManifest,
                }}
            >
                <CodeEditor value={configMapSecretManifest?.manifest} height="fitToParent" mode={MODES.YAML} readOnly />
            </APIResponseHandler>
        </div>
    )

    const renderCrudButton = () =>
        dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING ? (
            <ConfigMapSecretApproveButton
                componentName={componentName}
                configMapSecretData={
                    draftData
                        ? {
                              ...draftData.parsedData.configData?.[0],
                              unAuthorized: !draftData.isAppAdmin,
                          }
                        : null
                }
                draftData={draftData}
                updateCMSecret={updateCMSecret}
                parentName={parentName}
            />
        ) : (
            <footer className="flex right py-12 px-16 dc__border-top-n1">
                <Button
                    dataTestId="cm-secret-form-submit-btn"
                    text={`Save${!isCreateView ? ' Changes' : ''}${isApprovalPolicyConfigured ? '...' : ''}`}
                    size={ComponentSizeType.medium}
                    onClick={onSubmit}
                    isLoading={isSubmitting}
                    disabled={isSaveButtonDisabled}
                />
            </footer>
        )

    return (
        <>
            <Prompt when={shouldPrompt} message={checkIfPathIsMatching(location.pathname)} />
            <div className="flexbox-col h-100 dc__overflow-hidden">
                <div className={`flex-grow-1 dc__overflow-hidden ${!hideManifest ? 'dc__grid-half' : ''}`}>
                    {renderLHS()}
                    {!hideManifest && renderRHS()}
                </div>
                {showCrudButtons &&
                    dryRunEditorMode !== DryRunEditorMode.PUBLISHED_VALUES &&
                    (!fileDeletionRequest || dryRunEditorMode !== DryRunEditorMode.VALUES_FROM_DRAFT) &&
                    renderCrudButton()}
            </div>
        </>
    )
}
