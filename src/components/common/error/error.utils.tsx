import React from 'react'
import { AppDetails } from '../../v2/appDetails/appDetails.type'

export const renderErrorHeaderMessage = (appDetails: AppDetails, key: string, onClickActionButton?): JSX.Element => {
    return (
        <div>
            '{appDetails.clusterName}' cluster
            {appDetails.ipsAccessProvided ? ' could not' : ' does not have permission to' } pull container image from ‘
            {appDetails.dockerRegistryId}’ registry.
            {key === 'sync-error' && (
                <span className="cb-5 cursor fw-6 ml-8" onClick={onClickActionButton}>
                    {appDetails.ipsAccessProvided ? 'Possible issues?' : 'How to resolve?'}
                </span>
            )}
        </div>
    )
}
