import React, { useMemo, useRef, useState } from 'react'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import Creatable from 'react-select/creatable'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as QuestionIcon } from '../../../v2/assets/icons/ic-question.svg'
import { ReactComponent as EditIcon } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Redo } from '../../../../assets/icons/ic-arrow-counter-clockwise.svg'
import { ReactComponent as Minus } from '../../../../assets/icons/ic-minus.svg'
import { ReactComponent as Rectangle } from '../../../../assets/icons/RectangleLine.svg'
import { ImageTagType, ReleaseTag, ImageComment } from './types'
import { setImageTags } from '../../service' 

export const ImageTagsContainer = ({ imageComment, imageReleaseTags }: ImageTagType) => {
    const [newDescription, setNewDescription] = useState(imageComment?.comment)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedTags, setSelectedTags] = useState<ReleaseTag[]>(
        imageReleaseTags?.map((tag) => ({
            id: tag.id,
            tagName: tag.tagName,
            softDeleted: tag.softDeleted,
            appId: 0,
            artifactId: 0,
        })) ?? [],
    )

    const [createTags, setCreateTags] = useState<ReleaseTag[]>([])
    const [softDeleteTags, setSoftDeleteTags] = useState<ReleaseTag[]>([])
    const [hardDeleteTags, setHardDeleteTags] = useState<ReleaseTag[]>([])
    const [imageCommentState, setImageComment] = useState<ImageComment>(
        imageComment ? { ...imageComment } : { id: 0, comment: "", artifactId: 0 },
    )

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
        if (imageReleaseTags !== null) {
            const restoredTags = imageReleaseTags.map((tag) => ({
                id: tag.id,
                tagName: tag.tagName,
                softDeleted: tag.softDeleted,
                appId: 0,
                artifactId: 0,
            }))
            setSelectedTags(restoredTags)
        } else {
            setSelectedTags([])
        }
        if (imageComment !== null) {
          const updatedImageComment: ImageComment = {
              ...imageCommentState,
          }
          setImageComment(updatedImageComment)
      } else {
        imageCommentState.comment = ""
      }
      setNewDescription(imageCommentState.comment)
        setCreateTags([])
        setSoftDeleteTags([])
        setHardDeleteTags([])

        handleEditClick()
    }

    const handleTagCreate = (newValue) => {
        const newTag: ReleaseTag = {
            id: 0,
            tagName: newValue,
            appId: 0,
            softDeleted: false,
            artifactId: 0,
        }

        setCreateTags([...createTags, newTag])
        setSelectedTags([...selectedTags, newTag])
    }

    const handleTagSoftDelete = (index) => {
        const updatedTags = [...selectedTags]
        updatedTags[index].softDeleted = !updatedTags[index].softDeleted
        setSelectedTags(updatedTags)

        // Get the corresponding tag from imageReleaseTags

        const tag = imageReleaseTags[index]

        // Update softDeleted value and add it to softDeleteTags state
        const updatedTag: ReleaseTag = {
            ...tag,
            softDeleted: updatedTags[index].softDeleted,
        }
        setSoftDeleteTags([...softDeleteTags, updatedTag])
    }

    const handleTagHardDelete = (index) => {
        const updatedSelectedTags = [...selectedTags]
        updatedSelectedTags.splice(index, 1) // Remove the tag from selectedTags
        setSelectedTags(updatedSelectedTags)

        const updatedCreateTags = [...createTags]
        updatedCreateTags.splice(index, 1) // Remove the tag from createTags
        setCreateTags(updatedCreateTags)

        const upadetSoftDeleteTags = [...softDeleteTags]
        upadetSoftDeleteTags.splice(index, 1)
        setSoftDeleteTags(upadetSoftDeleteTags)

        if (imageReleaseTags && imageReleaseTags[index]) {
            const deletedTag = imageReleaseTags[index]
            setHardDeleteTags([...hardDeleteTags, deletedTag])
        }
    }

    const handleSave = () => {
        if (imageComment !== null) {
            const updatedImageComment: ImageComment = {
                ...imageCommentState,
                comment: newDescription,
            }
            setImageComment(updatedImageComment)
        } else {
          imageCommentState.comment = newDescription
        }

        // Perform further actions with createTags, softDeleteTags, hardDeleteTags, and updatedImageComment
        // For example, you can send them to an API or perform other operations.


        const payload ={
          createTags: createTags,
          softDeleteTags: softDeleteTags,
          imageComment: imageCommentState,
          hardDeleteTags: hardDeleteTags,
        }
       
        setImageTags(payload,1,1)

        

        console.log(createTags)
        console.log(softDeleteTags)
        console.log(hardDeleteTags)
        console.log(imageCommentState)

   
        
        setCreateTags([])
        setSoftDeleteTags([])
        setHardDeleteTags([])

        handleEditClick()
    }

    const getPayload = () =>{
      return{
        createTags: createTags,

      }
    }

    const creatableRef = useRef(null)

    if (imageComment === null && imageReleaseTags === null && !isEditing) {
        return (
            <div className="mt-8">
                <AddImageButton handleEditClick={handleEditClick} />
            </div>
        )
    }

    return (
        <div>
            {!isEditing ? (
                <div className="top mt-8 br-4 image-tags-container" style={{ display: 'flex' }}>
                    <div className="flex left" style={{ width: '734px' }}>
                        <Rectangle className="image-tags-container-rectangle__icon" />
                        <div className="ml-10">
                            <div className="mb-8 mt-8">{imageComment?.comment}</div>
                            <div className="dc__flex-wrap flex left">
                                {imageReleaseTags?.map((tag, index) => (
                                    <ImageTagButton
                                        key={tag?.id}
                                        text={tag?.tagName}
                                        isSoftDeleted={tag?.softDeleted}
                                        isEditing={isEditing}
                                        onSoftDeleteClick={() => handleTagSoftDelete(index)}
                                        onHardDeleteClick={() => handleTagHardDelete(index)}
                                        tagId={tag.id}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <EditIcon
                        className="icon-dim-16 mt-8 ml-10 image-tags-container-edit__icon"
                        onClick={handleEditClick}
                    />
                </div>
            ) : (
                <div className="mt-12 dc__border-top-n1 ">
                    <div className="cn-7 mt-12 flex left">
                        Release tags (eg. v1.0)
                        <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                    </div>
                    <div className="mb-8 mt-6">
                        <Creatable
                            placeholder="Type a tag and press enter"
                            onCreateOption={handleTagCreate}
                            ref={creatableRef}
                            components={CreatableComponents}
                        />
                    </div>
                    <div className="dc__flex-wrap flex left">
                        {selectedTags?.map((tag, index) => (
                            <ImageTagButton
                                key={tag.id}
                                text={tag?.tagName}
                                isSoftDeleted={tag?.softDeleted}
                                isEditing={isEditing}
                                onSoftDeleteClick={() => handleTagSoftDelete(index)}
                                onHardDeleteClick={() => handleTagHardDelete(index)}
                                tagId={tag.id}
                            />
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
                        <button className="cta h-32 lh-32 ml-12" type="button" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const ImageTagButton = ({ text, isSoftDeleted, isEditing, onSoftDeleteClick, onHardDeleteClick, tagId }) => {
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
    return (
        <div className={containerClassName} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="mr-8 ml-8 mt-2 mb-2 flex">
                {isHovered && tagId !== 0 && isEditing && (
                    <IconComponent className="icon-dim-14 mr-2" onClick={onSoftDeleteClick} />
                )}
                {text}
                {isHovered && isEditing && <Close className="icon-dim-14 mr-2 cn-5" onClick={onHardDeleteClick} />}
            </div>
        </div>
    )
}

const AddImageButton = ({ handleEditClick }) => {
    const handleClick = () => {
        handleEditClick()
    }

    return (
        <div className="add-tag-button flex" onClick={handleClick}>
            <div className="lh-16 flex">
                <Add className="icon-dim-16 cn-6" />
                <span className="cn-7">Add tags/comment</span>
            </div>
        </div>
    )
}


