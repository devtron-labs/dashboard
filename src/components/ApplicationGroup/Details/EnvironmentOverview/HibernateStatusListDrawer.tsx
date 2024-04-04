import React, { useEffect } from 'react'
import { Drawer, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { HibernateStatusRow } from './HibernateStatusRow'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'

export default function HibernateStatusListDrawer({
    closePopup,
    responseList,
    isLoading,
    getAppListData,
    isHibernateOperation,
    hibernateInfoMap,
    isDeploymentLoading,
}) {
    useEffect(() => {
        return () => {
            getAppListData().then(() => {})
        }
    }, [])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-16 pr-20 pb-16 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">
                    {isHibernateOperation ? 'Hibernate applications' : 'Unhibernate applications'}
                </h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={isLoading}
                    onClick={closePopup}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const renderResponseBodySection = (): JSX.Element => {
        if (isLoading || isDeploymentLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="response-list-container bcn-0 dc__height-inherit dc__overflow-auto pr-20 pb-16 pl-20">
                <div
                    className="dc__position-sticky fs-12 fw-6 cn-7 dc__top-0 bcn-0 dc__border-bottom response-row dc__border-bottom pt-24 pb-8 dc__uppercase"
                    style={{ zIndex: 1 }}
                >
                    <div>Application</div>
                    <div>Status</div>
                    <div>Message</div>
                </div>
                {responseList.map((response, index) => (
                    <HibernateStatusRow
                        key={response.id}
                        rowData={response}
                        index={index}
                        isHibernateOperation={isHibernateOperation}
                        hibernateInfoMap={hibernateInfoMap}
                    />
                ))}
            </div>
        )
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width right">
                <button className="cta cancel flex h-36" data-testid="close-popup" onClick={closePopup}>
                    Close
                </button>
            </div>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="dc__window-bg h-100 bulk-ci-trigger-container">
                {renderHeaderSection()}
                {renderResponseBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
