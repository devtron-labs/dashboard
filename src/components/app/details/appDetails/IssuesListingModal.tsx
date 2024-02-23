import React, { useEffect, useRef } from 'react'
import { Drawer } from '@devtron-labs/devtron-fe-common-lib'
import { IssuesListingModalType } from './appDetails.type'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'

const IssuesListingModal = ({ errorsList, closeIssuesListingModal }: IssuesListingModalType) => {
    const issuesModalRef = useRef<HTMLDivElement>(null)
    const outsideClickHandler = (evt): void => {
        if (
            issuesModalRef.current &&
            !issuesModalRef.current.contains(evt.target) &&
            typeof closeIssuesListingModal === 'function'
        ) {
            closeIssuesListingModal()
        }
    }

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    const renderErrorRows = () => {
        return errorsList?.map((errorItem) => {
            return (
                <div className="issues-listing-modal__body__row">
                    <div className="issues-listing-modal__body__row__col-1 dc__capitalize">{errorItem.error}</div>
                    <div className="issues-listing-modal__body__row__col-2">{errorItem.message}</div>
                </div>
            )
        })
    }

    const getErrorCountText = () => {
        return errorsList.length > 1 ? `${errorsList.length} Errors` : `${errorsList.length} Error`
    }

    return (
        <Drawer position="right" width="800px" onEscape={closeIssuesListingModal}>
            <div className="issues-listing-modal bcn-0" ref={issuesModalRef}>
                <div className="issues-listing-modal__header dc__box-shadow pt-12 pr-20 pb-12 pl-20 bcn-0 flex dc__content-space">
                    <div className="issues-listing-modal__header-text flex">
                        <Error className="form__icon--error icon-dim-20" />
                        <div data-testid="issues-listing-modal-title" className="cn-9 fs-16 fw-6 ml-8 lh-24">
                            {getErrorCountText()}
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
                    {renderErrorRows()}
                </div>
            </div>
        </Drawer>
    )
}

export default IssuesListingModal
