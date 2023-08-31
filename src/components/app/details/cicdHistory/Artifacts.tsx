import React, { useEffect, useState } from 'react'
import { showError, GenericEmptyState, ImageTagsContainer, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { copyToClipboard, importComponentFromFELibrary } from '../../../common'
import { useParams } from 'react-router'
import { ReactComponent as CopyIcon } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help.svg'
import { ReactComponent as Down } from '../../../../assets/icons/ic-arrow-down.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import folder from '../../../../assets/icons/ic-folder.svg'
import noartifact from '../../../../assets/img/no-artifact@2x.png'
import Tippy from '@tippyjs/react'
import '../cIDetails/ciDetails.scss'
import { ArtifactType, CIListItemType, CopyTippyWithTextType, HistoryComponentType } from './types'
import { DOCUMENTATION, TERMINAL_STATUS_MAP } from '../../../../config'
import { extractImage } from '../../service'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Docker } from '../../../../assets/icons/misc/docker.svg'
import { useHistory } from 'react-router-dom'

let ApprovalInfoTippy = null

export default function Artifacts({
    status,
    artifact,
    blobStorageEnabled,
    isArtifactUploaded,
    getArtifactPromise,
    ciPipelineId,
    artifactId,
    isJobView,
    imageComment,
    imageReleaseTags,
    type,
    appReleaseTagNames,
    tagsEditable,
    hideImageTaggingHardDelete,
    customTag,
    appWorkflowId,
}: ArtifactType) {
    const history = useHistory()
    const { triggerId, buildId, appId } = useParams<{
        triggerId: string
        buildId: string
        appId: string
    }>()
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    async function handleArtifact(e) {
        try {
            const response = await getArtifactPromise()
            const b = await (response as any).blob()
            const a = document.createElement('a')
            a.href = URL.createObjectURL(b)
            a.download = `${buildId || triggerId}.zip`
            a.click()
        } catch (err) {
            showError(err)
        }
    }

    const redirectToBuildPipeline = () => {
        history.push(`/app/${appId}/edit/workflow/${appWorkflowId}/ci-pipeline/${ciPipelineId}/build`)
    }

    if (status.toLowerCase() === TERMINAL_STATUS_MAP.RUNNING || status.toLowerCase() === TERMINAL_STATUS_MAP.STARTING) {
        return <CIProgressView />
    } else if (isJobView && !blobStorageEnabled) {
        return (
            <div className="flex column p-24 w-100 h-100">
                <GenericEmptyState
                    title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoFilesFound}
                    subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.BlobStorageNotConfigured}
                    image={noartifact}
                />
                <div className="flexbox pt-8 pr-12 pb-8 pl-12 bcv-1 ev-2 bw-1 br-4 dc__position-abs-b-20">
                    <Question className="icon-dim-20 fcv-5" />
                    <span className="fs-13 fw-4 mr-8 ml-8">
                        {EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.StoreFiles}
                    </span>
                    <a className="fs-13 fw-6 cb-5 dc__no-decor" href={DOCUMENTATION.BLOB_STORAGE} target="_blank">
                        {EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.ConfigureBlobStorage}
                    </a>
                    <OpenInNew className="icon-dim-20 ml-8" />
                </div>
            </div>
        )
    } else if (isJobView && !isArtifactUploaded) {
        return (
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoFilesFound}
                subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoFilesGenerated}
                image={noartifact}
            />
        )
    } else if (
        status.toLowerCase() === TERMINAL_STATUS_MAP.FAILED ||
        status.toLowerCase() === TERMINAL_STATUS_MAP.CANCELLED
    ) {
        return (
            <div className={`${customTag ? "flex column pt-20 pb-20" : "h-100"}`}>
                <GenericEmptyState
                    title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated}
                    subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError}
                    classname={`${customTag ? "dc__h-fit-content" : ""}`}
                />
                {customTag && (
                    <div className="custom-image-tag__warning-wrapper br-4 w-300 en-2 bw-1">
                        <InfoColourBar
                            message="Desired image tag already exists"
                            classname="warn dc__no-border"
                            Icon={Warn}
                            iconClass="warning-icon"
                        />
                        <div className="p-12 bcn-0 fs-12">
                            <div className="pb-10 dc__border-bottom">
                                <span className="fw-6">Desired Image tag:</span><br/>
                                <div className="br-4 dc__bg-n50 pl-4 pr-4 flex left dc__w-fit-content dc__ff-monospace cn-7">
                                    <Docker className="icon-dim-16 mr-8 m-auto" />
                                    {customTag.tagPattern.replace('{x}', customTag.counterX.toString())}
                                </div>
                            </div>
                            <div className="pt-10">
                                <span className="fw-6 fs-12 ">Pattern used to generate tag:</span>
                                <div className="br-4  p-4 fs-12 flex left dc__ff-monospace">{customTag.tagPattern}</div>
                                <div onClick={redirectToBuildPipeline} className="cb-5 cursor fs-13">
                                    Modify Pattern
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    } else {
        return (
            <div className="flex left column p-16">
                {!isJobView && type !== HistoryComponentType.CD && (
                    <CIListItem
                        type="artifact"
                        ciPipelineId={ciPipelineId}
                        artifactId={artifactId}
                        imageComment={imageComment}
                        imageReleaseTags={imageReleaseTags}
                        appReleaseTagNames={appReleaseTagNames}
                        tagsEditable={tagsEditable}
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                    >
                        <div className="flex column left hover-trigger">
                            <div className="cn-9 fs-14 flex left" data-testid="artifact-text-visibility">
                                <CopyTippyWithText
                                    copyText={extractImage(artifact)}
                                    copied={copied}
                                    setCopied={setCopied}
                                />
                            </div>
                            <div className="cn-7 fs-12 flex left" data-testid="artifact-image-text">
                                <CopyTippyWithText copyText={artifact} copied={copied} setCopied={setCopied} />
                            </div>
                        </div>
                    </CIListItem>
                )}
                {blobStorageEnabled && getArtifactPromise && (type === HistoryComponentType.CD || isArtifactUploaded) && (
                    <CIListItem type="report" hideImageTaggingHardDelete={hideImageTaggingHardDelete}>
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
        )
    }
}

export const CopyTippyWithText = ({ copyText, copied, setCopied }: CopyTippyWithTextType): JSX.Element => {
    const onClickCopyToClipboard = (e): void => {
        copyToClipboard(e.target.dataset.copyText, () => setCopied(true))
    }
    return (
        <>
            {copyText}
            <Tippy
                className="default-tt"
                arrow={false}
                placement="bottom"
                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                trigger="mouseenter click"
                interactive={true}
            >
                <CopyIcon
                    data-copy-text={copyText}
                    className="pointer ml-6 icon-dim-16"
                    onClick={onClickCopyToClipboard}
                />
            </Tippy>
        </>
    )
}

const CIProgressView = (): JSX.Element => {
    return (
        <GenericEmptyState
            SvgImage={MechanicalOperation}
            title={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.TITLE}
            subTitle={EMPTY_STATE_STATUS.CI_PROGRESS_VIEW.SUBTITLE}
        />
    )
}

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
}: CIListItemType) => {
    if(!ApprovalInfoTippy) ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
    return (
        <>
            {type === 'deployed-artifact' && (
                <div className="flex mb-12 dc__width-inherit">
                    <div className="w-50 text-underline-dashed-300" />
                    <Down className="icon-dim-16 ml-8 mr-8" />
                    <div className="w-50 text-underline-dashed-300" />
                </div>
            )}
            {ApprovalInfoTippy && userApprovalMetadata && (
                <div className="dc__width-inherit bcn-0 dc__border dc__top-radius-4">
                    <div className="pt-8 pr-16 pb-8 pl-16 lh-20">
                        <ApprovalInfoTippy
                            showCount={true}
                            userApprovalMetadata={userApprovalMetadata}
                            triggeredBy={triggeredBy}
                        />
                    </div>
                </div>
            )}
            <div
                className={`dc__h-fit-content ci-artifact ci-artifact--${type} image-tag-parent-card bcn-0 br-4 dc__border p-12 w-100 dc__mxw-800 ${
                    ApprovalInfoTippy && userApprovalMetadata ? 'dc__no-top-radius dc__no-top-border' : ''
                }`}
                data-testid="hover-on-report-artifact"
            >
                <div className="ci-artifacts-grid flex left">
                    <div className="bcn-1 flex br-4 icon-dim-40">
                        <img src={type === 'report' ? folder : docker} className="icon-dim-20" />
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
                    />
                )}
            </div>
        </>
    )
}
