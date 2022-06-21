import React from 'react';
import './nodeType.scss';

function getFilteredPodStatus(podStatusObj) {
    const podStatusKeys = Object.keys(podStatusObj)

    if (podStatusKeys.length > 2 && podStatusObj['running'] === 0) {
        return podStatusKeys.filter((n) => n !== 'all' && n !== 'running')
    }

    return podStatusKeys.filter((n) => n !== 'all')
}

function PodTabSection({
    podTab,
    selectPodTab,
    podStatus,
    isNew,
}: {
    podTab: string
    selectPodTab: (string) => void
    podStatus: { running; all }
    isNew: boolean
}) {
    const dataTestId = isNew ? 'all-pods-new' : 'all-pods-old'
    return (
        <div
            className={
                isNew
                    ? `lh-1-4-33 no-decor pod-tab ${
                          podTab === 'new' ? 'pod-tab__active' : ''
                      } border-right flex left column pl-16 pr-16 pointer `
                    : `pod-tab ${
                          podTab === 'old' ? 'pod-tab__active border-right' : 'pod-tab__transparent-top'
                      } no-decor flex left column pl-16 pr-16 pointer  `
            }
            onClick={(e) => selectPodTab(isNew ? 'new' : 'old')}
            data-testid={dataTestId}
        >
            <div className="fs-14 fw-6 pt-12 ">
                {' '}
                {isNew ? 'New Pods' : 'Old Pods'} ({podStatus.all}){' '}
            </div>
            <div className="flex left fs-12 cn-9 pb-12">
            {getFilteredPodStatus(podStatus).map((status, idx) => (
                    <React.Fragment key={idx}>
                        {!!idx && <span className="bullet mr-4 ml-4"></span>}
                        <span key={idx} data-testid={isNew && `new-pod-status-${status}`}>
                            {podStatus[status]} {status}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default PodTabSection;