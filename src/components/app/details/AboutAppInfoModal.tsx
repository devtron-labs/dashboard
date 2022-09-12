import React from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import moment from 'moment'
import { Moment12HourFormat } from '../../../config';
import { Progressing } from '../../common';
import TagLabelSelect from './TagLabelSelect';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';
import { validateTags } from '../appLabelCommon'

export default function AboutAppInfoModal({ onClose, appMetaResult, isLoading, labelTags, handleInputChange, handleTagsChange, handleKeyDown, handleCreatableBlur, handleSubmit, submitting }) {

    const renderAboutModalInfoHeader = () => {
        return <div className="modal__header">
            <div className="fs-20 cn-9 fw-6">About</div>
            <button className="dc__transparent" onClick={() => onClose(false)}>
                <Close className="icon-dim-24 cursor" />
            </button>
        </div>
    }

    const renderValidationMessaging = () => {
        if (labelTags.tagError !== "") {
            return <div className="cr-5 fs-11">
                <Error className="form__icon form__icon--error" />{labelTags.tagError}
            </div>
        }
    }

    const renderAboutModalInfo = () => {
        return <div>
            <div className="pt-12">
                <div className="cn-6 fs-12 mb-2">App name</div>
                <div className="cn-9 fs-14 mb-16">{appMetaResult?.appName}</div>
            </div>
            <div>
                <div className="cn-6 fs-12 mb-2">Created on</div>
                <div className="cn-9 fs-14 mb-16">{moment(appMetaResult?.createdOn).format(Moment12HourFormat)}</div>
            </div>
            <div>
                <div className="cn-6 fs-12 mb-2">Created by</div>
                <div className="cn-9 fs-14 mb-16">{appMetaResult?.createdBy}</div>
            </div>
            <div>
                <div className="cn-6 fs-12 mb-2">Project</div>
                <div className="cn-9 fs-14 mb-16">{appMetaResult?.projectName}</div>
            </div>
            <TagLabelSelect validateTags={validateTags} labelTags={labelTags} onInputChange={handleInputChange} onTagsChange={handleTagsChange} onKeyDown={handleKeyDown} onCreatableBlur={handleCreatableBlur} />
            {renderValidationMessaging()}
            <div className='form__buttons mt-40'>
                <button className=' cta' type="submit" disabled={submitting} onClick={(e) => { e.preventDefault(); handleSubmit(e) }} tabIndex={5} >
                    {submitting ? <Progressing /> : ' Save'}
                </button>
            </div>
        </div>
    }

    return (<div>
        {renderAboutModalInfoHeader()}
        {isLoading ? <div className="flex" style={{ minHeight: "400px" }}>
            <Progressing pageLoader />
        </div> : renderAboutModalInfo()}
    </div>
    )
}