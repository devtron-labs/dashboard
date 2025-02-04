import { ApplicationDeletionInfoProps } from './types'

export const ApplicationDeletionInfo = ({ isPresetValue }: ApplicationDeletionInfoProps) =>
    isPresetValue ? (
        <>
            <p className="lh-20 m-0 fs-13 cn-7 ">
                This will delete the preset value and it will no longer be available to be used for deployment.
            </p>
            <p className="lh-20 m-0 fs-13 cn-7 ">Are you sure?</p>
        </>
    ) : (
        <>
            <p className="lh-20 m-0 fs-13 cn-7">This will delete all resources associated with this application.</p>
            <p className="lh-20 m-0 fs-13 cn-7">Deleted applications cannot be restored.</p>
        </>
    )
