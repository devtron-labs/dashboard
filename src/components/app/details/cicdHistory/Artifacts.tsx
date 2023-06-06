import React, { useEffect, useRef, useState } from 'react'
import { showError, EmptyState, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { copyToClipboard, importComponentFromFELibrary } from '../../../common'
import { useParams } from 'react-router'
import { ReactComponent as CopyIcon } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import folder from '../../../../assets/icons/ic-folder.svg'
import Creatable from 'react-select/creatable';
import noartifact from '../../../../assets/img/no-artifact@2x.png'
import { ReactComponent as QuestionIcon } from '../../../v2/assets/icons/ic-question.svg'
import Tippy from '@tippyjs/react'
import '../cIDetails/ciDetails.scss'
import { ArtifactType, CIListItemType, CopyTippyWithTextType, HistoryComponentType } from './types'
import { ReactComponent as EditIcon } from '../../../../assets/icons/ic-pencil.svg'
import { DOCUMENTATION, TERMINAL_STATUS_MAP } from '../../../../config'
import { extractImage } from '../../service'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'
import { CustomInput } from '../../../globalConfigurations/GlobalConfiguration'

const ApprovedArtifact = importComponentFromFELibrary && importComponentFromFELibrary('ApprovedArtifact')

export default function Artifacts({
    status,
    artifact,
    blobStorageEnabled,
    isArtifactUploaded,
    getArtifactPromise,
    isJobView,
    type,
}: ArtifactType) {
    const { triggerId, buildId } = useParams<{
        triggerId: string
        buildId: string
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
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated}
                subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError}
            />
        )
    } else {
        return (
            <div className="flex left column p-16">
                {!isJobView && (
                    <CIListItem type="artifact">
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
                    <CIListItem type="report">
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
    {
        /* TO replace with genericemptystate after incoporating png support */
    }
    return (
        <EmptyState>
            <EmptyState.Image>
                <MechanicalOperation />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>Building artifacts</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Generated artifact(s) will be available here after the pipeline is executed.
            </EmptyState.Subtitle>
        </EmptyState>
    )
}

const ImageTagsContainer = ({ description, tagTexts }) => {
    const [newDescription, setNewDescription] = useState(description)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedTags, setSelectedTags] = useState(
        tagTexts.map((tag) => ({ text: tag.text, isSoftDeleted: tag.isSoftDeleted })),
    )

    const handleEditClick = () => {
        setIsEditing(!isEditing)
    }

    const handleDescriptionChange = (e) => {
        setNewDescription(e.target.value)
    }

    const handleCancel = () => {
        setNewDescription(description)
        setSelectedTags(tagTexts.map((tag) => ({ text: tag.text, isSoftDeleted: tag.isSoftDeleted })))
        handleEditClick()
    }

    const handleTagCreate = (newValue) => {
        setSelectedTags([...selectedTags, { text: newValue, isSoftDeleted: false }])
    }

    const creatableRef = useRef(null)

    return (
        <div>
            {!isEditing ? (
                <div className="top mt-8 br-4 image-tags-container" style={{ display: 'flex' }}>
                    <div className="ml-10" style={{ width: '734px' }}>
                        <div className="mb-8 mt-8">{description}</div>
                        <div className="dc__flex-wrap flex left">
                            {tagTexts.map((tag, index) => (
                                <ImageTagButton key={index} text={tag.text} isSoftDeleted={tag.isSoftDeleted} />
                            ))}
                        </div>
                    </div>
                    <EditIcon
                        className="icon-dim-16 mt-8 ml-10 image-tags-container-edit__icon"
                        onClick={handleEditClick}
                    />
                </div>
            ) : (
                <div className="mt-12 dc__border-top-n1 ">
                    <div className="cn-7 mt-12 flex left">Release tags (eg. v1.0)
                    <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                    </div>
                    <div className="mb-8 mt-6">
                        <Creatable
                            placeholder="Type a tag and press enter"
                            onCreateOption={handleTagCreate}
                            ref={creatableRef}  
                        />
                    </div>
                    <div className="dc__flex-wrap flex left">
                        {selectedTags.map((tag, index) => (
                            <ImageTagButton key={index} text={tag.text} isSoftDeleted={tag.isSoftDeleted} />
                        ))}
                    </div>
                    <div className="cn-7">Comment</div>
                    <div className="flex left flex-wrap dc__gap-8 w-100 mt-6 mb-12 ">
                        <textarea
                            value={newDescription} 
                            onChange={handleDescriptionChange}
                            className="flex left flex-wrap dc__gap-8 dc__description-textarea h-90"
                        />
                    </div>
                    <div className="w-100 flex right">
                        <button className="cta cancel h-32 lh-32" type="button" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button className="cta h-32 lh-32 ml-12" type="button">
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const ImageTagButton = ({ text, isSoftDeleted }) => {
    const containerClassName = isSoftDeleted ? 'image-tag-button-soft-deleted mb-8 mr-8' : 'image-tag-button mb-8 mr-8'
    return (
        <div className={containerClassName}>
            <span className="mr-8 ml-8 mt-2 mb-2">{text}</span>
        </div>
    )
}

export const CIListItem = ({ type, userApprovalMetadata, triggeredBy, children }: CIListItemType) => {
    if (type === 'approved-artifact') {
        return ApprovedArtifact ? (
            <ApprovedArtifact
                userApprovalMetadata={userApprovalMetadata}
                triggeredBy={triggeredBy}
                children={children}
            />
        ) : null
    }

    return (
        <div
            className={`mb-16 dc__h-fit-content ci-artifact ci-artifact--${type}`}
            data-testid="hover-on-report-artifact"
        >
            <div className="ci-artifacts-grid">
                <div className="bcn-1 flex br-4 w-56">
                    <img src={type === 'artifact' ? docker : folder} className="icon-dim-24" />
                </div>
                {children}
            </div>
            {type === 'artifact' && (
                <ImageTagsContainer
                    description="The photo shows a team of firefighters standing in front of a building they have just successfully saved."
                    tagTexts={[
                        { text: 'v4.9.0', isSoftDeleted: false },
                        { text: 'django', isSoftDeleted: true },
                    ]}
                />
            )}
        </div>
    )
}
