import React, { useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { Drawer, Progressing, showError } from '../../common'
import TagLabelSelect from './TagLabelSelect'
import { AboutAppInfoModalProps, TagType } from '../types'
import { createAppLabels } from '../service'
import { toast } from 'react-toastify'

export default function AboutTagEditModal({
    isLoading,
    appId,
    onClose,
    currentLabelTags,
    getAppMetaInfoRes,
}: AboutAppInfoModalProps) {
    const editLabelRef = useRef(null)
    const [submitting, setSubmitting] = useState(false)
    const [labelTags, setLabelTags] = useState<TagType[]>(currentLabelTags || [])

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        const isInvalid = labelTags.some((label) => !label.key || label.isInvalidKey || label.isInvalidValue)
        if (isInvalid) return
        setSubmitting(true)

        const payload = {
            id: parseInt(appId),
            labels:
                labelTags?.map((labelTag) => {
                    return { key: labelTag.key, value: labelTag.value, propagate: labelTag.propagate }
                }) || [],
        }

        try {
            await createAppLabels(payload)
            toast.success('Successfully saved')

            // Fetch the latest project & labels details
            await getAppMetaInfoRes()
        } catch (err) {
            showError(err)
        } finally {
            onClose()
            setSubmitting(false)
        }
    }

    const renderAboutModalInfo = (): JSX.Element => {
        return (
            <>
                <div className="cn-7 p-20">
                    <TagLabelSelect labelTags={labelTags} setLabelTags={setLabelTags} />
                </div>
                <div className="form__buttons dc__border-top pt-16 pb-16 pl-20 pr-20">
                    <button
                        className="cta cancel flex h-36 mr-12"
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        tabIndex={6}
                    >
                        Cancel
                    </button>
                    <button
                        className="cta flex h-36"
                        type="submit"
                        disabled={submitting}
                        onClick={handleSaveAction}
                        tabIndex={5}
                    >
                        {submitting ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </>
        )
    }

    return (
        <Drawer position="right" width="800px">
            <div className="h-100 bcn-0 create-app-container" ref={editLabelRef}>
                <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 dc__border-bottom">
                    <h2 className="fs-16 cn-9 fw-6 m-0">Manage tags</h2>
                    <Close className="icon-dim-20 cursor" onClick={onClose} />
                </div>
                {isLoading ? <Progressing pageLoader /> : renderAboutModalInfo()}
            </div>
        </Drawer>
    )
}