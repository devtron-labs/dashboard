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

import { useParams } from 'react-router-dom'
import { useDownload } from '@Shared/Hooks'
import {
    GenericEmptyState,
    ImageTagsContainer,
    ClipboardButton,
    extractImage,
    DOCUMENTATION,
    useSuperAdmin,
} from '../../../Common'
import { ReactComponent as Download } from '../../../Assets/Icon/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../Assets/Icon/ic-mechanical-operation.svg'
import { ReactComponent as OpenInNew } from '../../../Assets/Icon/ic-arrow-out.svg'
import { ReactComponent as ICHelpOutline } from '../../../Assets/Icon/ic-help.svg'
import { ReactComponent as Down } from '../../../Assets/Icon/ic-arrow-forward.svg'
import docker from '../../../Assets/Icon/ic-docker.svg'
import folder from '../../../Assets/Icon/ic-folder.svg'
import noartifact from '../../../Assets/Img/no-artifact@2x.png'
import { ArtifactType, CIListItemType } from './types'
import { TERMINAL_STATUS_MAP } from './constants'
import { EMPTY_STATE_STATUS } from '../../constants'

const CIProgressView = (): JSX.Element => (
    <GenericEmptyState
        SvgImage={MechanicalOperation}
        title={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.TITLE}
        subTitle={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.SUBTITLE}
    />
)

export const CIListItem = ({
    type,
    userApprovalMetadata,
    triggeredBy,
    children,
    ciPipelineId,
    artifactId,
    imageComment,
    imageReleaseTags,
    appReleaseTagNames,
    tagsEditable,
    hideImageTaggingHardDelete,
    appliedFilters,
    isSuperAdmin,
    promotionApprovalMetadata,
    appliedFiltersTimestamp,
    selectedEnvironmentName,
    renderCIListHeader,
}: CIListItemType) => {
    const headerMetaDataPresent =
        !!userApprovalMetadata || !!appliedFilters?.length || !!promotionApprovalMetadata?.promotedFromType

    return (
        <>
            {type === 'deployed-artifact' && (
                <div className="flex dc__width-inherit pb-12">
                    <div className="w-50 text-underline-dashed-300" />
                    <Down className="icon-dim-16 ml-8 mr-8" style={{ transform: 'rotate(90deg)' }} />
                    <div className="w-50 text-underline-dashed-300" />
                </div>
            )}

            {headerMetaDataPresent &&
                renderCIListHeader &&
                renderCIListHeader({
                    userApprovalMetadata,
                    triggeredBy,
                    appliedFilters,
                    appliedFiltersTimestamp,
                    promotionApprovalMetadata,
                    selectedEnvironmentName,
                })}

            <div
                className={`dc__h-fit-content ci-artifact image-tag-parent-card bcn-0 br-4 dc__border p-12 w-100 dc__mxw-800 ci-artifact--${type} ${
                    headerMetaDataPresent && renderCIListHeader ? 'dc__no-top-radius dc__no-top-border' : ''
                }`}
                data-testid="hover-on-report-artifact"
            >
                <div className="ci-artifacts-grid flex left">
                    <div className="bcn-1 flex br-4 icon-dim-40">
                        <img src={type === 'report' ? folder : docker} className="icon-dim-20" alt="type" />
                    </div>
                    {children}
                </div>
                {type !== 'report' && (
                    <ImageTagsContainer
                        ciPipelineId={ciPipelineId}
                        artifactId={artifactId}
                        imageComment={imageComment}
                        imageReleaseTags={imageReleaseTags}
                        appReleaseTagNames={appReleaseTagNames}
                        tagsEditable={tagsEditable}
                        hideHardDelete={hideImageTaggingHardDelete}
                        isSuperAdmin={isSuperAdmin}
                    />
                )}
            </div>
        </>
    )
}

const Artifacts = ({
    status,
    artifact,
    blobStorageEnabled,
    isArtifactUploaded,
    downloadArtifactUrl,
    ciPipelineId,
    artifactId,
    isJobCI,
    imageComment,
    imageReleaseTags,
    appReleaseTagNames,
    tagsEditable,
    hideImageTaggingHardDelete,
    rootClassName,
    renderCIListHeader,
}: ArtifactType) => {
    const { isSuperAdmin } = useSuperAdmin()
    const { handleDownload } = useDownload()

    const { triggerId, buildId } = useParams<{
        triggerId: string
        buildId: string
    }>()

    async function handleArtifact() {
        await handleDownload({
            downloadUrl: downloadArtifactUrl,
            fileName: `${buildId || triggerId}.zip`,
        })
    }

    if (status.toLowerCase() === TERMINAL_STATUS_MAP.RUNNING || status.toLowerCase() === TERMINAL_STATUS_MAP.STARTING) {
        return <CIProgressView />
    }
    // If artifactId is not 0 image info is shown, if isArtifactUploaded is true reports are shown
    // In case both are not present empty state is shown
    // isArtifactUploaded can be true even if status is failed

    // NOTE: This means there are no reports and no image artifacts i.e. empty state
    if (!isArtifactUploaded && !artifactId) {
        if (
            status.toLowerCase() === TERMINAL_STATUS_MAP.FAILED ||
            status.toLowerCase() === TERMINAL_STATUS_MAP.CANCELLED ||
            status.toLowerCase() === TERMINAL_STATUS_MAP.ERROR
        ) {
            return (
                <GenericEmptyState
                    title={
                        isJobCI
                            ? EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.FailedToFetchArtifacts
                            : EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated
                    }
                    subTitle={
                        isJobCI
                            ? EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.FailedToFetchArtifactsError
                            : EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError
                    }
                />
            )
        }

        if (status.toLowerCase() === TERMINAL_STATUS_MAP.SUCCEEDED) {
            return (
                <GenericEmptyState
                    title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsFound}
                    subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsFoundError}
                    image={noartifact}
                />
            )
        }
    }

    return (
        <>
            <div className={`flex left column dc__gap-12 dc__content-start ${rootClassName ?? ''}`}>
                {!!artifactId && (
                    <CIListItem
                        type="artifact"
                        ciPipelineId={ciPipelineId}
                        artifactId={artifactId}
                        imageComment={imageComment}
                        imageReleaseTags={imageReleaseTags}
                        appReleaseTagNames={appReleaseTagNames}
                        tagsEditable={tagsEditable}
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                        isSuperAdmin={isSuperAdmin}
                        renderCIListHeader={renderCIListHeader}
                    >
                        <div className="flex column left hover-trigger">
                            <div className="cn-9 fs-14 flex left" data-testid="artifact-text-visibility">
                                {extractImage(artifact)}
                                <div className="pl-4">
                                    <ClipboardButton content={extractImage(artifact)} />
                                </div>
                            </div>
                            <div className="cn-7 fs-12 flex left" data-testid="artifact-image-text">
                                {artifact}
                                <div className="pl-4">
                                    <ClipboardButton content={artifact} />
                                </div>
                            </div>
                        </div>
                    </CIListItem>
                )}
                {blobStorageEnabled && downloadArtifactUrl && isArtifactUploaded && (
                    <CIListItem
                        type="report"
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                        isSuperAdmin={isSuperAdmin}
                        renderCIListHeader={renderCIListHeader}
                    >
                        <div className="flex column left">
                            <div className="cn-9 fs-14">Reports.zip</div>
                            <button
                                type="button"
                                onClick={handleArtifact}
                                className="anchor p-0 cb-5 fs-12 flex left pointer"
                            >
                                Download
                                <Download className="ml-5 icon-dim-16" />
                            </button>
                        </div>
                    </CIListItem>
                )}
            </div>
            {!blobStorageEnabled && (
                <div className="flexbox dc__position-abs-b-20 dc__content-center w-100">
                    <div className="flexbox pt-8 pr-12 pb-8 pl-12 bcv-1 ev-2 bw-1 br-4">
                        <ICHelpOutline className="icon-dim-20 fcv-5" />
                        <span className="fs-13 fw-4 mr-8 ml-8">
                            {EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.StoreFiles}
                        </span>
                        <a
                            className="fs-13 fw-6 cb-5 dc__no-decor"
                            href={DOCUMENTATION.BLOB_STORAGE}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.ConfigureBlobStorage}
                        </a>
                        <OpenInNew className="icon-dim-20 ml-8" />
                    </div>
                </div>
            )}
        </>
    )
}

export default Artifacts
