import React, { useMemo, useRef, useState } from 'react'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import Creatable from 'react-select/creatable'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as QuestionIcon } from '../../../v2/assets/icons/ic-question.svg'
import { ReactComponent as EditIcon } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Redo } from '../../../../assets/icons/ic-arrow-counter-clockwise.svg'
import { ReactComponent as Minus } from '../../../../assets/icons/ic-minus.svg'
import { ReactComponent as Rectangle } from '../../../../assets/icons/RectangleLine.svg'

export const ImageTagsContainer = ({ description, tagTexts }) => {
    const [newDescription, setNewDescription] = useState(description)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedTags, setSelectedTags] = useState(
        tagTexts.map((tag) => ({ text: tag.text, isSoftDeleted: tag.isSoftDeleted })),
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
        setNewDescription(description)
        setSelectedTags(tagTexts.map((tag) => ({ text: tag.text, isSoftDeleted: tag.isSoftDeleted })))
        handleEditClick()
    }

    const handleTagCreate = (newValue) => {
        setSelectedTags([...selectedTags, { text: newValue, isSoftDeleted: false }])
    }

    const handleTagSoftDelete = (index) => {
        const updatedTags = [...selectedTags]
        updatedTags[index].isSoftDeleted = !updatedTags[index].isSoftDeleted
        setSelectedTags(updatedTags)
    }

    const handleTagHardDelete = (index) => {
        const updatedTags = [...selectedTags]
        updatedTags.splice(index, 1) // Remove the tag from the array
        setSelectedTags(updatedTags)
    }

    const creatableRef = useRef(null)

    if (tagTexts.length === 0 && description === '' && !isEditing) {
        return (
            <div className="mt-8">
                <AddImageButton onClick={handleEditClick} />
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
                            <div className="mb-8 mt-8">{description}</div>
                            <div className="dc__flex-wrap flex left">
                                {tagTexts.map((tag, index) => (
                                    <ImageTagButton
                                        key={index}
                                        text={tag.text}
                                        isSoftDeleted={tag.isSoftDeleted}
                                        isEditing={isEditing}
                                        onSoftDeleteClick={() => handleTagSoftDelete(index)}
                                        onHardDeleteClick={() => handleTagHardDelete(index)}
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
                        {selectedTags.map((tag, index) => (
                            <ImageTagButton
                                key={index}
                                text={tag.text}
                                isSoftDeleted={tag.isSoftDeleted}
                                isEditing={isEditing}
                                onSoftDeleteClick={() => handleTagSoftDelete(index)}
                                onHardDeleteClick={() => handleTagHardDelete(index)}
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
                        <button className="cta h-32 lh-32 ml-12" type="button">
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const ImageTagButton = ({ text, isSoftDeleted, isEditing, onSoftDeleteClick, onHardDeleteClick }) => {
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
                {isHovered && isEditing && <IconComponent className="icon-dim-14 mr-2" onClick={onSoftDeleteClick} />}
                {text}
                {isHovered && isEditing && <Close className="icon-dim-14 mr-2 cn-5" onClick={onHardDeleteClick} />}
            </div>
        </div>
    )
}

const AddImageButton = ({ onClick }) => {
    return (
        <div className="add-tag-button flex" onClick={onClick}>
            <div className="lh-16 flex">
                <Add className="icon-dim-16 cn-6" />
                <span className="cn-7">Add tags/comment</span>
            </div>
        </div>
    )
}


