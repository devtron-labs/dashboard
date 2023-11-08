import React from 'react'
import { Drawer } from '@devtron-labs/devtron-fe-common-lib'
import { IssuesListingModalType } from './appDetails.type'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'

const IssuesListingModal = ({ closeIssuesListingModal }: IssuesListingModalType) => {
    return (
        <Drawer position="right" width="800px" onEscape={closeIssuesListingModal}>
            <div className="issues-listing-modal bcn-0">
                <div className="issues-listing-modal__header dc__box-shadow pt-12 pr-20 pb-12 pl-20 bcn-0 flex dc__content-space">
                    <div className="issues-listing-modal__header-text flex">
                        <Error className="form__icon--error icon-dim-20" />
                        {/* @TODO: Get this errors count from the api data */}
                        <div data-testid="issues-listing-modal-title" className="cn-9 fs-16 fw-6 ml-8 lh-24">
                            3 Errors
                        </div>
                    </div>
                    <span className="cursor" onClick={closeIssuesListingModal} data-testid="issues-listing-modal-cross">
                        <Close className="icon-dim-20" />
                    </span>
                </div>
                <div className="issues-listing-modal__body" data-testid="issues-listing-modal-body">
                    <div className="issues-listing-modal__body__head-row">
                        <div className="issues-listing-modal__body__head-row__col-1">ERROR</div>
                        <div className="issues-listing-modal__body__head-row__col-2">MESSAGE</div>
                    </div>
                    <div className="issues-listing-modal__body__row">
                        <div className="issues-listing-modal__body__row__col-1">error1</div>
                        <div className="issues-listing-modal__body__row__col-2">
                            Description of error1. Lorem Ipsum is simply dummy text of the printing and typesetting
                            industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
                            an unknown printer took a galley of type and scrambled it to make a type specimen book. It
                            has survived not only five centuries, but also the leap into electronic typesetting,
                            remaining essentially unchanged. It was popularised in the 1960s with the release of
                            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                            software like Aldus PageMaker including versions of Lorem Ipsum.
                        </div>
                    </div>
                    <div className="issues-listing-modal__body__row">
                        <div className="issues-listing-modal__body__row__col-1">error2</div>
                        <div className="issues-listing-modal__body__row__col-2">Description of error2</div>
                    </div>
                    <div className="issues-listing-modal__body__row">
                        <div className="issues-listing-modal__body__row__col-1">error3</div>
                        <div className="issues-listing-modal__body__row__col-2">Description of error3</div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default IssuesListingModal
