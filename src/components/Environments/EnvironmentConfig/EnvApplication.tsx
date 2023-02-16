import React from 'react'
import { useParams } from 'react-router-dom'
import { ConfigAppList } from '../EnvironmentGroup.types'
import ApplicationRoutes from './ApplicationRoutes'

export default function EnvApplication({ appList }: { appList?: ConfigAppList[] }) {
    return (
        <div className="pt-4 pb-4 w-100">
            <div className="cn-6 pl-8 pr-8  fs-12 fw-6 w-100">APPLICATION</div>
            {appList.map((envData) => (
                <ApplicationRoutes envListData={envData} />
            ))}
        </div>
    )
}
