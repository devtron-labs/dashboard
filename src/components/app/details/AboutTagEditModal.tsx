import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-cross.svg'
import { Drawer, Progressing, showError } from '../../common'
import TagLabelSelect from './TagLabelSelect'
import { AboutAppInfoModalProps, TagType } from '../types'
import { createAppLabels } from '../service'
import { toast } from 'react-toastify'
import { DEFAULT_TAG_DATA } from '../config'

export default function AboutTagEditModal({
    isLoading,
    appId,
    onClose,
    currentLabelTags,
    getAppMetaInfoRes,
}: AboutAppInfoModalProps) {
    const editLabelRef = useRef(null)
    const [submitting, setSubmitting] = useState(false)
    const [labelTags, setLabelTags] = useState<TagType[]>(
        currentLabelTags?.length ? currentLabelTags : [DEFAULT_TAG_DATA],
    )

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof onClose === 'function') {
            evt.preventDefault()
            onClose(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (editLabelRef.current && !editLabelRef.current.contains(evt.target) && typeof onClose === 'function') {
            onClose(evt)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    const handleSaveAction = async (e): Promise<void> => {
        e.preventDefault()
        const _labelTags = []
        let invalidLabels = false
        for (let index = 0; index < labelTags.length; index++) {
            const element = labelTags[index]
            if (element.isInvalidKey || element.isInvalidValue) {
                invalidLabels = true
                break
            } else if (element.key) {
                _labelTags.push({ key: element.key, value: element.value, propagate: element.propagate })
            }
        }
        if (invalidLabels) {
            toast.error('Some required fields are missing or invalid')
            return
        }
        setSubmitting(true)

        const payload = {
            id: parseInt(appId),
            labels: _labelTags,
        }

        try {
            await createAppLabels(payload)
            toast.success('Successfully saved')
            // Fetch the latest project & labels details
            await getAppMetaInfoRes()
        } catch (err) {
            showError(err)
        } finally {
            onClose(e)
            setSubmitting(false)
        }
    }

    const renderAboutModalInfo = (): JSX.Element => {
        return (
            <>
                <div className="cn-7 p-20 dc__overflow-scroll" style={{ height: 'calc(100vh - 122px)' }}>
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
