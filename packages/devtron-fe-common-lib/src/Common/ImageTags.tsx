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

import { useEffect, useRef, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Add } from '../Assets/Icon/ic-add.svg'
import { ReactComponent as Close } from '../Assets/Icon/ic-cross.svg'
import { ReactComponent as EditIcon } from '../Assets/Icon/ic-pencil.svg'
import { ReactComponent as Redo } from '../Assets/Icon/ic-arrow-counter-clockwise.svg'
import { ReactComponent as Minus } from '../Assets/Icon/ic-minus.svg'
import { ReactComponent as Info } from '../Assets/Icon/ic-info-filled.svg'
import { ReactComponent as Error } from '../Assets/Icon/ic-warning.svg'
import { ReactComponent as Warning } from '../Assets/Icon/ic-error-exclamation.svg'
import { ReactComponent as Enter } from '../Assets/Icon/ic-enter.svg'
import { ImageButtonType, ImageTaggingContainerType, ReleaseTag } from './ImageTags.Types'
import { showError, stopPropagation } from './Helper'
import { setImageTags } from './Common.service'
import { Progressing } from './Progressing'
import { InfoIconTippy, ToastManager, ToastVariantType } from '../Shared'

export const ImageTagsContainer = ({
    // Setting it to zero in case of external pipeline
    ciPipelineId,
    artifactId,
    imageComment,
    imageReleaseTags,
    updateCurrentAppMaterial,
    appReleaseTagNames,
    setAppReleaseTagNames,
    tagsEditable,
    setTagsEditable,
    toggleCardMode,
    hideHardDelete,
    forceReInit,
    isSuperAdmin,
}: ImageTaggingContainerType) => {
    const [initialTags, setInitialTags] = useState<ReleaseTag[]>(imageReleaseTags || [])
    const [initialDescription, setInitialDescription] = useState(imageComment ? imageComment.comment : '')
    const [existingTags, setExistingTags] = useState(appReleaseTagNames || [])
    const [newDescription, setNewDescription] = useState(imageComment ? imageComment.comment : '')
    const [isEditing, setIsEditing] = useState(false)
    const [showTagsWarning, setShowTagsWarning] = useState(false)
    const [displayedTags, setDisplayedTags] = useState<ReleaseTag[]>(imageReleaseTags || [])
    const [tagErrorMessage, setTagErrorMessage] = useState('')
    const [createTags, setCreateTags] = useState<ReleaseTag[]>([])
    const [softDeleteTags, setSoftDeleteTags] = useState<ReleaseTag[]>([])
    const [hardDeleteTags, setHardDeleteTags] = useState<ReleaseTag[]>([])
    const [descriptionValidationMessage, setDescriptionValidationMessage] = useState<string>('')
    const [textInput, setTextInput] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        reInitState()
    }, [imageReleaseTags, imageComment, tagsEditable])

    useEffect(() => {
        setExistingTags(appReleaseTagNames || [])
    }, [appReleaseTagNames])

    const reInitState = () => {
        if (forceReInit || !isEditing) {
            setInitialTags(imageReleaseTags || [])
            setInitialDescription(imageComment ? imageComment.comment : '')
            setNewDescription(imageComment ? imageComment.comment : '')
            setDisplayedTags(imageReleaseTags || [])
            setIsEditing(false)
        }
    }

    const handleEditClick = () => {
        setIsEditing(!isEditing)
        if (typeof toggleCardMode === 'function') {
            toggleCardMode(artifactId)
        }
    }

    const handleDescriptionChange = (e) => {
        const description = e.target.value
        description?.length > 500
            ? setDescriptionValidationMessage('comment length cannot exceed 500 characters')
            : setDescriptionValidationMessage('')
        setNewDescription(description)
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

    const validateTag = (lowercaseValue): boolean => {
        if (
            lowercaseValue.length == 0 ||
            lowercaseValue.length >= 128 ||
            lowercaseValue[0] == '.' ||
            lowercaseValue[0] == '-'
        ) {
            setTagErrorMessage('Label name cannot be empty or exceed 128 characters or cannot start with . or -')
            return false
        }
        setTagErrorMessage('')
        const isTagExistsInExistingTags = existingTags.includes(lowercaseValue)
        let isTagExistsInDisplayedTags = false
        for (let i = 0; i < displayedTags?.length; i++) {
            if (displayedTags[i].tagName.toLowerCase() === lowercaseValue) isTagExistsInDisplayedTags = true
        }
        if (isTagExistsInExistingTags || isTagExistsInDisplayedTags || lowercaseValue === 'latest') {
            setTagErrorMessage('This label is already being used in this application')
            return false
        }
        return true
    }

    const handleTagCreate = (newValue): ReleaseTag[] => {
        const lowercaseValue = newValue.toLowerCase().trim()
        if (validateTag(lowercaseValue)) {
            const newTag: ReleaseTag = {
                id: 0,
                tagName: lowercaseValue,
                appId: 0,
                deleted: false,
                artifactId: 0,
                duplicateTag: false,
            }
            const newCreateTags = [...createTags, newTag]
            setCreateTags(newCreateTags)
            setDisplayedTags([...displayedTags, newTag])
            setShowTagsWarning(true)
            setTextInput('')
            return newCreateTags
        }
        return createTags
    }

    const handleTagSoftDelete = (index) => {
        const updatedTags = [...displayedTags]
        updatedTags[index] = {
            ...updatedTags[index],
            deleted: !updatedTags[index].deleted,
        }
        const updatedTag = updatedTags[index]
        const updatedSoftDeleteTags = [...softDeleteTags]
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

    const errorStateHandling = (err) => {
        err.forEach(({ userMessage }) => {
            const tagList = createTags.map((tags) => {
                if (userMessage?.appReleaseTags?.includes(tags.tagName)) {
                    return {
                        ...tags,
                        duplicateTag: true,
                    }
                }
                return tags
            })
            setCreateTags(tagList)

            const displayList = displayedTags.map((obj) => {
                const matchingTag = tagList.find((tag) => tag.tagName === obj.tagName)
                if (matchingTag) {
                    return { ...obj, duplicateTag: matchingTag.duplicateTag }
                }
                return obj
            })

            setDisplayedTags(displayList)
        })
    }

    const handleSave = async (tagsToBeCreated: ReleaseTag[]) => {
        if (tagErrorMessage) return

        const payload = {
            createTags: tagsToBeCreated,
            softDeleteTags,
            imageComment: {
                id: 0,
                comment: newDescription.trim(),
                artifactId: 0,
            },
            hardDeleteTags,
        }

        // set loading state true
        setLoading(true)
        setImageTags(payload, ciPipelineId ?? 0, artifactId)
            .then((res) => {
                const tags = res.result?.imageReleaseTags?.map((tag) => ({
                    id: tag.id,
                    tagName: tag.tagName,
                    deleted: tag.deleted,
                    appId: 0,
                    artifactId: 0,
                }))
                if (setAppReleaseTagNames) {
                    setAppReleaseTagNames(res.result?.appReleaseTags)
                }
                if (setTagsEditable) {
                    setTagsEditable(res.result?.tagsEditable)
                }
                setInitialTags(tags)
                setInitialDescription(res.result?.imageComment?.comment)
                setDisplayedTags(tags)
                setNewDescription(res.result?.imageComment?.comment)
                setCreateTags([])
                setSoftDeleteTags([])
                setHardDeleteTags([])
                handleEditClick()
                setShowTagsWarning(false)
                setTagErrorMessage('')
                if (updateCurrentAppMaterial) updateCurrentAppMaterial(artifactId, tags, res.result?.imageComment)
            })
            .catch((err) => {
                // Fix toast message
                if (err.errors?.[0]?.userMessage?.appReleaseTags?.length) {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: err.errors?.[0]?.internalMessage,
                    })
                    errorStateHandling(err.errors)
                } else {
                    showError(err)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const renderInfoCard = (): JSX.Element => (
        <InfoIconTippy
            heading="Image labels"
            additionalContent={getBuildContextAdditionalContent()}
            iconClassName="fcn-5 ml-4 icon-dim-16"
        />
    )

    const getBuildContextAdditionalContent = () => (
        <div className="h-250 fs-13 dc__overflow-scroll p-12">
            <div>Image labels allow you to tag container images with readable and relatable labels eg. v1.0.</div>
            <ul className="pl-20 mt-8">
                <li>A label can only be added if a workflow has CD pipelines deploying to Production environments.</li>
                <li>Multiple labels can be added to an image.</li>
                <li>Multiple images in an application cannot have the same label.</li>
                <li>
                    Labels cannot be deleted once saved. Although, you can soft delete a label if an unwanted label has
                    been added.
                </li>
            </ul>
        </div>
    )

    const creatableRef = useRef(null)

    if (newDescription === '' && displayedTags.length === 0 && !isEditing) {
        return tagsEditable ? (
            <div className="bcn-0 mt-8 add-image-button">
                <AddImageButton handleEditClick={handleEditClick} />
            </div>
        ) : (
            <div />
        )
    }

    const handleKeydown = (event) => {
        if (event.key === 'Enter' && event.target.value.trim()) {
            handleTagCreate(event.target.value.trim())
        }
    }

    const setInputValue = (e) => {
        e.target.value && validateTag(e.target.value)
        setTextInput(e.target.value)
    }

    const enterTagCreate = (e) => {
        stopPropagation(e)
        if (textInput.trim()) {
            handleTagCreate(textInput.trim())
        }
    }

    const onClickSave = () => {
        let tagsToBeCreated = createTags
        if (textInput.trim()) {
            tagsToBeCreated = handleTagCreate(textInput)
        }
        handleSave(tagsToBeCreated)
    }

    return (
        <div className="mt-8">
            {isEditing && tagsEditable ? (
                <div className="bcn-0 dc__border-top-n1 ">
                    <div className="cn-7 mt-12 flex left">
                        <div>Image labels (eg. v1.0)</div>
                        {renderInfoCard()}
                    </div>
                    <div className="mt-6 dc__position-rel-imp" data-testid="add-tag-text-area">
                        <input
                            className="form__input fs-13"
                            value={textInput}
                            onChange={setInputValue}
                            placeholder="Type a tag and press enter"
                            onKeyDown={handleKeydown}
                            onBlur={setInputValue}
                            ref={creatableRef}
                        />
                        {textInput.length > 0 && (
                            <div
                                onClick={enterTagCreate}
                                className="dc__position-abs bcn-0 flex cursor pt-2 pb-2 pr-4 pl-4 br-2 cn-7 dc__border dc__border-bottom-2"
                                style={{
                                    top: '50%',
                                    fontFamily: 'monospace',
                                    right: '8px',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <Enter className="icon-dim-16 mr-4" />
                                Enter
                            </div>
                        )}
                    </div>

                    {tagErrorMessage && (
                        <div className="flex left">
                            <Error className="form__icon form__icon--error" />
                            <div className="form__error">{tagErrorMessage}</div>
                        </div>
                    )}
                    <div className="flex-wrap mt-8 flex left">
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
                                duplicateTag={tag?.duplicateTag}
                                hideHardDelete={hideHardDelete}
                            />
                        ))}
                    </div>
                    {showTagsWarning && (
                        <div className="cn-7 mb-8 flex left">
                            <Info className="icon-dim-16 mr-2" />
                            Tags cannot be edited/removed later
                        </div>
                    )}
                    <div className="cn-7 mt-12">Comment</div>
                    <div
                        className="flex left flex-wrap dc__gap-8 w-100 mt-6 mb-12"
                        data-testid="add-image-comment-text-area"
                    >
                        <textarea
                            value={newDescription}
                            onChange={handleDescriptionChange}
                            className="flex left flex-wrap dc__gap-8 dc__description-textarea fs-13"
                            style={{ height: '90px !important' }}
                        />
                    </div>
                    {descriptionValidationMessage !== '' && (
                        <div className="flex left">
                            <Error className="form__icon form__icon--error" />
                            <div className="form__error">{descriptionValidationMessage}</div>
                        </div>
                    )}
                    <div className="w-100 flex right mt-12">
                        <button
                            className="cta flex cancel h-32 lh-32-imp"
                            type="button"
                            onClick={(e) => {
                                stopPropagation(e)
                                handleCancel()
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="cta flex h-32 lh-32-imp ml-12"
                            data-testid="save-tags-button"
                            type="button"
                            onClick={(e) => {
                                stopPropagation(e)
                                onClickSave()
                            }}
                            disabled={loading}
                        >
                            {loading ? <Progressing /> : 'Save'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="top br-4 bcn-0 image-tags-container flexbox">
                    <div
                        className="flex left image-tag-left-border w-100 mt-8 mb-8 pr-10 pl-10"
                        data-testid="image-tags-container-hover"
                    >
                        <div className="w-100">
                            {initialDescription && (
                                <div className="mb-6 fs-13 lh-20 dc__word-break-all">{initialDescription}</div>
                            )}
                            <div className="flex-wrap flex left">
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
                                        duplicateTag={tag?.duplicateTag}
                                        hideHardDelete={hideHardDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 mr-10 icon-dim-16">
                        {tagsEditable && (
                            <EditIcon
                                className="icon-dim-16 image-tags-container-edit__icon cursor"
                                data-testid="edit-tags-icon"
                                onClick={(e) => {
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
    duplicateTag,
    hideHardDelete,
}: ImageButtonType) => {
    const IconComponent = isSoftDeleted ? Redo : Minus
    const isInSoftDeleteTags = isSoftDeleted && softDeleteTags.some((tag) => tag.tagName === text)
    const canTagBeHardDelete = tagId === 0 || (isSuperAdmin && !hideHardDelete)

    const tabColor = () => {
        if (duplicateTag) {
            return 'cr-5 bcr-1 er-2'
        }
        if (isSoftDeleted) {
            return 'cy-7 bcy-1 dc__strike-through ey-2'
        }
        return 'cn-9'
    }

    return (
        <div
            className={`br-4 en-2 bw-1 mr-8 bcn-0 pt-2 pr-8 pb-2 pl-8 tag-class dc__word-break-all flex ${
                isEditing ? 'icon-hover' : ''
            } ${tabColor()}`}
        >
            {duplicateTag ? (
                <Warning className="icon-dim-12 mr-4" />
            ) : (
                <Tippy
                    className="default-tt"
                    arrow
                    placement="top"
                    content={isInSoftDeleteTags ? 'Restore tag' : 'Soft delete tag'}
                >
                    <div
                        className={`action-icon mr-4 lh-16 pt-3 ${
                            isInSoftDeleteTags || (tagId !== 0 && !isSoftDeleted) ? 'show-icon' : ''
                        }`}
                    >
                        <IconComponent
                            className={`icon-dim-12 cursor ${isSoftDeleted ? 'scn-6' : 'fcn-6'} `}
                            data-testid={`${text}-tag-soft-delete`}
                            onClick={onSoftDeleteClick}
                        />
                    </div>
                </Tippy>
            )}
            {text}
            <Tippy className="default-tt" arrow placement="top" content="Remove tag">
                <div className={`action-icon ml-4 lh-16 pt-3 ${canTagBeHardDelete ? 'show-icon' : ''}`}>
                    <Close
                        className="icon-dim-12 fcn-6 cursor"
                        data-testid={`${text}-tag-hard-delete`}
                        onClick={onHardDeleteClick}
                    />
                </div>
            </Tippy>
        </div>
    )
}

const AddImageButton = ({ handleEditClick }) => {
    const handleClick = (e) => {
        stopPropagation(e)
        handleEditClick()
    }

    return (
        <div className="add-tag-button flex pt-12 pr-12" data-testid="add-tags-button" onClick={handleClick}>
            <div className="lh-16 flex">
                <Add className="icon-dim-16 cn-6" />
                <span className="cn-7">Add labels/comment</span>
            </div>
        </div>
    )
}
