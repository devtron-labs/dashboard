import { useEffect, useMemo, useRef } from 'react'
import { Prompt, useLocation, useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    APIResponseHandler,
    Button,
    CodeEditor,
    ComponentSizeType,
    DraftAction,
    DraftState,
    DryRunEditorMode,
    GenericEmptyState,
    MODES,
    OverrideMergeStrategyType,
    useAsync,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { NoPublishedVersionEmptyState, SelectMergeStrategy, ToggleResolveScopedVariables } from '@Pages/Applications'
import { UNSAVED_CHANGES_PROMPT_MESSAGE } from '@Config/constants'

import { CM_SECRET_STATE, CMSecretConfigData, ConfigMapSecretDryRunProps } from './types'
import { getConfigMapSecretFormInitialValues, getConfigMapSecretPayload } from './utils'
import { ConfigMapSecretReadyOnly } from './ConfigMapSecretReadyOnly'
import { ConfigMapSecretApproveButton } from './ConfigMapSecretApproveButton'
import { useConfigMapSecretFormContext } from './ConfigMapSecretFormContext'
import { getConfigMapSecretManifest } from './ConfigMapSecret.service'
import { renderExternalInfo } from './helpers'

const DryRunEditorModeSelect = importComponentFromFELibrary('DryRunEditorModeSelect', null, 'function')

export const ConfigMapSecretDryRun = ({
    id = null,
    isJob,
    cmSecretStateLabel,
    componentType,
    componentName,
    resolveScopedVariables,
    areScopeVariablesResolving,
    handleToggleScopedVariablesView,
    isProtected,
    resolvedFormData,
    draftData,
    inheritedConfigMapSecretData,
    publishedConfigMapSecretData,
    mergeStrategy,
    dryRunEditorMode,
    handleChangeDryRunEditorMode,
    isSubmitting,
    onSubmit,
    showCrudButtons,
    parentName,
    updateCMSecret,
}: ConfigMapSecretDryRunProps) => {
    // HOOKS
    const location = useLocation()
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const { formDataRef, isFormDirty } = useConfigMapSecretFormContext()
    const abortControllerRef = useRef<AbortController>(null)

    // CONSTANTS
    const isCreateView = id === null
    const shouldPrompt = isCreateView && isFormDirty

    // PROMPT FOR UNSAVED CHANGES
    usePrompt({ shouldPrompt })

    const dryRunConfigMapSecretData = useMemo(() => {
        let configMapSecretData: CMSecretConfigData =
            cmSecretStateLabel === CM_SECRET_STATE.INHERITED
                ? inheritedConfigMapSecretData
                : publishedConfigMapSecretData

        if (draftData) {
            if (draftData.action === DraftAction.Delete) {
                configMapSecretData = inheritedConfigMapSecretData
            } else if (draftData.draftState === DraftState.Init || draftData.draftState === DraftState.AwaitApproval) {
                configMapSecretData = {
                    ...JSON.parse(draftData.data).configData?.[0],
                    unAuthorized: !draftData.isAppAdmin,
                }
            }
        }

        if (dryRunEditorMode === DryRunEditorMode.VALUES_FROM_DRAFT) {
            if (resolvedFormData ?? formDataRef.current) {
                const payload = getConfigMapSecretPayload(resolvedFormData ?? formDataRef.current)

                configMapSecretData = {
                    ...((configMapSecretData || {}) as CMSecretConfigData),
                    ...payload,
                    ...(mergeStrategy === OverrideMergeStrategyType.PATCH
                        ? {
                              data: {
                                  ...(configMapSecretData ? configMapSecretData.data : {}),
                                  ...payload.data,
                              },
                          }
                        : {}),
                }
            }
        } else if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
            configMapSecretData = publishedConfigMapSecretData ?? null
        }

        return configMapSecretData ? { ...configMapSecretData, mergeStrategy: null } : null
    }, [
        isProtected,
        dryRunEditorMode,
        resolvedFormData,
        formDataRef.current,
        draftData,
        publishedConfigMapSecretData,
        inheritedConfigMapSecretData,
    ])

    useEffect(() => {
        abortControllerRef.current = new AbortController()

        return () => {
            abortControllerRef.current.abort()
        }
    }, [dryRunConfigMapSecretData])

    const isDryRunDataPresent = !!dryRunConfigMapSecretData
    const isExternal = dryRunConfigMapSecretData?.external

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
                            mergeStrategy,
                            resourceName: dryRunConfigMapSecretData.name,
                            resourceType: componentType,
                            values: dryRunConfigMapSecretData.data,
                        },
                        abortControllerRef.current.signal,
                    ),
                abortControllerRef,
            ),
        [dryRunConfigMapSecretData],
        isDryRunDataPresent && !isExternal,
    )

    // METHODS
    const handleSubmit = () =>
        onSubmit(
            formDataRef.current
                ? formDataRef.current
                : getConfigMapSecretFormInitialValues({
                      configMapSecretData: dryRunConfigMapSecretData,
                      cmSecretStateLabel,
                      componentType,
                  }),
        )

    // RENDERERS
    const renderLHSContent = () => {
        const publishedVersionDoesNotExist =
            cmSecretStateLabel === CM_SECRET_STATE.INHERITED ||
            cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED ||
            !publishedConfigMapSecretData

        if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES && publishedVersionDoesNotExist) {
            return (
                <NoPublishedVersionEmptyState
                    isOverride={cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED && !!publishedConfigMapSecretData}
                />
            )
        }

        return (
            <>
                <ConfigMapSecretReadyOnly
                    componentType={componentType}
                    isJob={isJob}
                    cmSecretStateLabel={CM_SECRET_STATE.BASE}
                    configMapSecretData={dryRunConfigMapSecretData}
                    areScopeVariablesResolving={areScopeVariablesResolving}
                />
                <div className="px-16 pb-16">
                    {renderExternalInfo(
                        dryRunConfigMapSecretData.externalType,
                        dryRunConfigMapSecretData.external,
                        componentType,
                    )}
                </div>
            </>
        )
    }

    const renderLHS = () => (
        <div className="flexbox-col dc__border-right dc__overflow-hidden">
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
                    {mergeStrategy && <SelectMergeStrategy mergeStrategy={mergeStrategy} variant="text" />}
                    <div className="dc__border-right-n1 dc__align-self-stretch mt-2 mb-2" />
                    <ToggleResolveScopedVariables
                        resolveScopedVariables={resolveScopedVariables}
                        handleToggleScopedVariablesView={handleToggleScopedVariablesView}
                        isDisabled={areScopeVariablesResolving}
                    />
                </div>
            </div>
            <div className="flex-grow-1 dc__overflow-auto">{renderLHSContent()}</div>
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
                <div className="flex-grow-1 dc__overflow-scroll">
                    <CodeEditor
                        value={configMapSecretManifest?.manifest}
                        height="100%"
                        mode={MODES.YAML}
                        readOnly
                        noParsing
                    />
                </div>
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
                              ...JSON.parse(draftData.data).configData?.[0],
                              unAuthorized: !draftData.isAppAdmin,
                          }
                        : null
                }
                draftData={draftData}
                updateCMSecret={updateCMSecret}
                parentName={parentName}
            />
        ) : (
            <footer className="py-12 px-16 dc__border-top-n1">
                <Button
                    dataTestId="cm-secret-form-submit-btn"
                    text={`Save${!isCreateView ? ' Changes' : ''}${isProtected ? '...' : ''}`}
                    size={ComponentSizeType.medium}
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={isSubmitting || areScopeVariablesResolving}
                />
            </footer>
        )

    if (!isDryRunDataPresent) {
        return <GenericEmptyState title="No data present for manifest" />
    }

    return (
        <>
            <Prompt
                when={shouldPrompt}
                message={({ pathname }) => location.pathname === pathname || UNSAVED_CHANGES_PROMPT_MESSAGE}
            />
            <div className="flexbox-col h-100 dc__overflow-hidden">
                <div className={`flex-grow-1 dc__overflow-hidden ${!isExternal ? 'dc__grid-half' : ''}`}>
                    {renderLHS()}
                    {!isExternal && renderRHS()}
                </div>
                {showCrudButtons && dryRunEditorMode !== DryRunEditorMode.PUBLISHED_VALUES && renderCrudButton()}
            </div>
        </>
    )
}
