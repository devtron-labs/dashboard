import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import Creatable from 'react-select/creatable'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as QuestionFilled } from '../../../../assets/icons/ic-help.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as EditIcon } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Redo } from '../../../../assets/icons/ic-arrow-counter-clockwise.svg'
import { ReactComponent as Minus } from '../../../../assets/icons/ic-minus.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ImageButtonType, ImageTaggingContainerType, ReleaseTag} from './types'
import { setImageTags } from '../../service'
import {showError, stopPropagation, TippyCustomized, TippyTheme} from '@devtron-labs/devtron-fe-common-lib'
import { getUserRole } from '../../../userGroups/userGroup.service'

export const ImageTagsContainer = ({
    ciPipelineId,
    artifactId,
    imageComment,
    imageReleaseTags,
    appReleaseTagNames,
    tagsEditable,
}: ImageTaggingContainerType) => {
    const [initialTags, setInitialTags] = useState<ReleaseTag[]>(imageReleaseTags ? imageReleaseTags : [])
    const [initialDescription, setInitialDescription] = useState(imageComment ? imageComment.comment : '')
    const [existingTags, setExistingTags] = useState(appReleaseTagNames ? appReleaseTagNames : [])
    const [newDescription, setNewDescription] = useState(imageComment ? imageComment.comment : '')
    const [isEditing, setIsEditing] = useState(false)
    const [showTagsWarning, setShowTagsWarning] = useState(false)
    const [displayedTags, setDisplayedTags] = useState<ReleaseTag[]>(imageReleaseTags ? imageReleaseTags : [])
    const [tagErrorMessage, setTagErrorMessage] = useState('')
    const [createTags, setCreateTags] = useState<ReleaseTag[]>([])
    const [softDeleteTags, setSoftDeleteTags] = useState<ReleaseTag[]>([])
    const [hardDeleteTags, setHardDeleteTags] = useState<ReleaseTag[]>([])
    const [isSuperAdmin, setSuperAdmin] = useState<boolean>(false)

    useEffect(() => {
        initialise()
    }, [])


    useEffect(() => {
        reInitState()
    }, [imageReleaseTags,imageComment,appReleaseTagNames,tagsEditable])


    async function initialise() {
        try {
            const userRole = await getUserRole()

            const superAdmin = userRole?.result?.roles?.includes('role:super-admin___')
            setSuperAdmin(superAdmin)
        } catch (err) {
            showError(err)
        }
    }

    const reInitState = () => {
        setInitialTags(imageReleaseTags ? imageReleaseTags : [])
        setInitialDescription(imageComment ? imageComment.comment : '')
        setExistingTags(appReleaseTagNames ? appReleaseTagNames : [])
        setNewDescription(imageComment ? imageComment.comment : '')
        setDisplayedTags(imageReleaseTags ? imageReleaseTags : [])
    }


    const CreatableComponents = useMemo(
        () => ({
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
            Menu: () => null,
        }),
        [],
    )

    const handleEditClick = () => {
        setIsEditing(!isEditing)
    }

    const handleDescriptionChange = (e) => {
        setNewDescription(e.target.value)
    }

    const handleCancel = () => {
        setDisplayedTags(initialTags)
        setNewDescription(initialDescription)
        setCreateTags([])
        setSoftDeleteTags([])
        setHardDeleteTags([])
        handleEditClick()
        setShowTagsWarning(false)
        setTagErrorMessage('')
    }

    const handleTagCreate = (newValue) => {
        const lowercaseValue = newValue.toLowerCase()
        setTagErrorMessage('')
        const isTagExistsInExistingTags = existingTags.includes(lowercaseValue)
        let isTagExistsInDisplayedTags = false
        for (let i = 0; i < displayedTags?.length; i++) {
            if (displayedTags[i]?.tagName.toLowerCase() === lowercaseValue) isTagExistsInDisplayedTags = true
        }
        if (isTagExistsInExistingTags || isTagExistsInDisplayedTags) {
            setTagErrorMessage('This tag is already applied on another image in this application')
            return
        }
        const newTag: ReleaseTag = {
            id: 0,
            tagName: lowercaseValue,
            appId: 0,
            deleted: false,
            artifactId: 0,
        }
        setCreateTags([...createTags, newTag])
        setDisplayedTags([...displayedTags, newTag])
        setShowTagsWarning(true)
    }

    const handleTagSoftDelete = (index) => {
        const updatedTags = [...displayedTags]
        updatedTags[index] = {
            ...updatedTags[index],
            deleted: !updatedTags[index].deleted,
        }
        const updatedTag = updatedTags[index]
        let updatedSoftDeleteTags = [...softDeleteTags]
        const tagIndex = updatedSoftDeleteTags.findIndex((tag) => tag.tagName === updatedTag.tagName)
        if (tagIndex !== -1) {
            // Tag already exists in softDeleteTags array, remove it
            updatedSoftDeleteTags.splice(tagIndex, 1)
        } else {
            // Tag doesn't exist in softDeleteTags array, add it
            updatedSoftDeleteTags.push(updatedTag)
        }
        setDisplayedTags(updatedTags)
        setSoftDeleteTags(updatedSoftDeleteTags)
    }

    const handleTagHardDelete = (index) => {
        const deletedTag = displayedTags[index]
        const updatedCreateTags = createTags.filter((tag) => tag.tagName !== deletedTag.tagName)
        setCreateTags(updatedCreateTags)
        const updatedDisplayedTags = [...displayedTags]
        updatedDisplayedTags.splice(index, 1)
        setDisplayedTags(updatedDisplayedTags)
        const updatedExistingTags = existingTags.filter((tag) => tag.toLowerCase() !== deletedTag.tagName.toLowerCase())
        setExistingTags(updatedExistingTags)
        if (deletedTag.id !== 0) {
            const updatedHardDeleteTags = [...hardDeleteTags, deletedTag]
            setHardDeleteTags(updatedHardDeleteTags)
        }
    }

    const handleSave = async () => {
        const payload = {
            createTags: createTags,
            softDeleteTags: softDeleteTags,
            imageComment: {
                id: 0,
                comment: newDescription,
                artifactId: 0,
            },
            hardDeleteTags: hardDeleteTags,
        }

        try {
            // set loading state true
            let response = await setImageTags(payload, ciPipelineId, artifactId)
            const tags = response.result?.imageReleaseTags?.map((tag) => ({
                id: tag.id,
                tagName: tag.tagName,
                deleted: tag.deleted,
                appId: 0,
                artifactId: 0,
            }))
            const comment = response.result?.imageComment?.comment
            setInitialTags(tags)
            setInitialDescription(comment)
            setDisplayedTags(tags)
            setNewDescription(comment)
            setCreateTags([])
            setSoftDeleteTags([])
            setHardDeleteTags([])
            handleEditClick()
            setShowTagsWarning(false)
            setTagErrorMessage('')
        } catch (err) {
            showError(err)
        }
    }

    const renderInfoCard = (): JSX.Element => {
        return (
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-300 h-250 fcv-5 dc__overflow-scroll"
                placement="right"
                Icon={QuestionFilled}
                heading="Release tags"
                infoText={`Release tags allow you to tag container images with readable and relatable tags eg. v1.0.`}
                showCloseButton={true}
                trigger="click"
                interactive={true}
                documentationLinkText="View Documentation"
                additionalContent={getBuildContextAdditionalContent()}
            >
                <div className="icon-dim-16 fcn-5 ml-8 cursor">
                    <Question />
                </div>
            </TippyCustomized>
        )
    }

    const getBuildContextAdditionalContent = () => {
        return (
            <div className="p-12 fs-13">
                <ul>
                    <li>
                        A release tag can only be added if a workflow has CD pipelines deploying to Production
                        environments.
                    </li>
                    <li>Multiple tags can be added to an image.</li>
                    <li>Multiple images in an application cannot have the same tag.</li>
                    <li>
                        Tags cannot be deleted once saved. Although, you can soft delete a tag if an unwanted tag has
                        been added.
                    </li>
                </ul>
            </div>
        )
    }

    const creatableRef = useRef(null)

    if (newDescription === '' && displayedTags.length === 0 && !isEditing && !tagsEditable) {
        return <div></div>
    }

    if (newDescription === '' && displayedTags.length === 0 && !isEditing) {
        return (
            <div className="bcn-0 pt-12 pr-12">
                <AddImageButton handleEditClick={handleEditClick} />
            </div>
        )
    }

    return (
        <div className="pt-12 pr-12">
            {isEditing && tagsEditable ? (
                <div className="bcn-0 dc__border-top-n1 ">
                    <div className="cn-7 mt-12 flex left">
                        <span>Release tags (eg. v1.0)</span>
                        <div className="flex row ml-0">{renderInfoCard()}</div>
                    </div>
                    <div className="mt-6" data-testId="add-tag-text-area">
                        <Creatable
                            placeholder="Type a tag and press enter"
                            onCreateOption={handleTagCreate}
                            ref={creatableRef}
                            components={CreatableComponents}
                        />
                    </div>

                    {tagErrorMessage && (
                        <div className="flex left">
                            <Error className="form__icon form__icon--error" />
                            <div className="form__error">{tagErrorMessage}</div>
                        </div>
                    )}
                    <div className="dc__flex-wrap mt-8 flex left">
                        {displayedTags?.map((tag, index) => (
                            <ImageTagButton
                                key={tag.id}
                                text={tag?.tagName}
                                isSoftDeleted={tag?.deleted}
                                isEditing={isEditing}
                                onSoftDeleteClick={(e) => {
                                    stopPropagation(e)
                                    handleTagSoftDelete(index)
                                }}
                                onHardDeleteClick={(e) => {
                                    stopPropagation(e)
                                    handleTagHardDelete(index)
                                }}
                                tagId={tag.id}
                                softDeleteTags={softDeleteTags}
                                isSuperAdmin={isSuperAdmin}
                            />
                        ))}
                    </div>
                    {showTagsWarning && (
                        <div className="cn-7 mb-8 flex left">
                            <Info
                                className="form__icon--info icon-dim-16 mr-2"
                            />
                            Tags cannot be edited/removed later
                        </div>
                    )}
                    <div className="cn-7">Comment</div>
                    <div className="flex left flex-wrap dc__gap-8 w-100 mt-6 mb-12 ">
                        <textarea
                            value={newDescription}
                            onChange={handleDescriptionChange}
                            className="flex left flex-wrap dc__gap-8 dc__description-textarea h-90"
                        />
                    </div>
                    <div className="w-100 flex right">
                        <button className="cta cancel h-32 lh-32" type="button" onClick={(e)=> {
                            stopPropagation(e)
                            handleCancel()
                        }}>
                            Cancel
                        </button>
                        <button className="cta h-32 lh-32 ml-12" type="button" onClick={(e)=>{
                            stopPropagation(e)
                            handleSave()
                        }}>
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="top br-4 bcn-0 image-tags-container" style={{ display: 'flex' }}>
                    <div className="flex left image-tag-left-border w-100">
                        <div className="ml-10">
                            <div className="mb-8 mt-8">{initialDescription}</div>
                            <div className="dc__flex-wrap flex left">
                                {initialTags?.map((tag, index) => (
                                    <ImageTagButton
                                        key={tag?.id}
                                        text={tag?.tagName}
                                        isSoftDeleted={tag?.deleted}
                                        isEditing={isEditing}
                                        onSoftDeleteClick={(e) => {
                                            stopPropagation(e)
                                            handleTagSoftDelete(index)
                                        }}
                                        onHardDeleteClick={(e) => {
                                            stopPropagation(e)
                                            handleTagHardDelete(index)
                                        }}
                                        tagId={tag.id}
                                        softDeleteTags={softDeleteTags}
                                        isSuperAdmin={isSuperAdmin}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 mr-6">
                        {tagsEditable && (
                            <EditIcon
                                className="icon-dim-16 image-tags-container-edit__icon cursor"
                                onClick={(e)=>{
                                    stopPropagation(e)
                                    handleEditClick()
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export const ImageTagButton = ({
    text,
    isSoftDeleted,
    isEditing,
    onSoftDeleteClick,
    onHardDeleteClick,
    tagId,
    softDeleteTags,
    isSuperAdmin,
}: ImageButtonType) => {
    const containerClassName = isSoftDeleted ? 'image-tag-button-soft-deleted mb-8 mr-8' : 'image-tag-button mb-8 mr-8'
    const IconComponent = isSoftDeleted ? Redo : Minus

    const [isHovered, setIsHovered] = useState(false)
    const handleMouseEnter = () => {
        if (isEditing) {
            setIsHovered(true)
        }
    }
    const handleMouseLeave = () => {
        if (isEditing) {
            setIsHovered(false)
        }
    }

    const isInSoftDeleteTags = isSoftDeleted && softDeleteTags.some((tag) => tag.tagName === text)
    const isCloseButtonVisible = tagId === 0 || isSuperAdmin

    return (
        <div className={containerClassName} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="mr-8 ml-8 mt-2 mb-2 flex">
                {isHovered && isEditing && (isInSoftDeleteTags || (tagId !== 0 && !isSoftDeleted)) && (
                    <IconComponent className="icon-dim-14 mr-2" onClick={onSoftDeleteClick} />
                )}
                {text}
                {isHovered && isEditing && isCloseButtonVisible && (
                    <Close className="icon-dim-14 mr-2 cn-5" onClick={onHardDeleteClick} />
                )}
            </div>
        </div>
    )
}

const AddImageButton = ({ handleEditClick }) => {
    const handleClick = () => {
        handleEditClick()
    }

    return (
        <div className="add-tag-button flex pt-12 pr-12" data-testId="add-tags-button" onClick={handleClick}>
            <div className="lh-16 flex">
                <Add className="icon-dim-16 cn-6" />
                <span className="cn-7">Add tags/comment</span>
            </div>
        </div>
    )
}
