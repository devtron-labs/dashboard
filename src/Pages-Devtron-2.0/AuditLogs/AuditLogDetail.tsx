import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import {
    BreadCrumb,
    CodeEditor,
    DATE_TIME_FORMATS,
    Icon,
    MODES,
    PageHeader,
    Progressing,
    ROUTER_URLS,
    useBreadcrumb,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { getAuditLogDetail } from './service'
import { AuditLogParamsType } from './types'

import './auditLog.scss'

const AuditLogDetail = () => {
    const { auditLogId = '' } = useParams<AuditLogParamsType>()

    const { data: auditLog, isFetching } = useQuery({
        queryFn: async () => {
            const response = await getAuditLogDetail(auditLogId)
            return response
        },
        queryKey: ['audit-log-detail', auditLogId],
        enabled: !!auditLogId,
    })

    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.AUDIT_LOGS_DETAIL,
        {
            alias: {
                'audit-logs': {
                    component: <Icon name="ic-file-log-search" color="B500" size={24} />,
                    linked: true,
                },
                ':auditLogId': {
                    component: <span className="fs-16 fw-6 cn-9 lh-1-5">{auditLog?.action || 'Details'}</span>,
                    linked: false,
                },
            },
        },
        [auditLog?.action],
    )

    if (isFetching) {
        return (
            <div className="flex-grow-1 bg__primary">
                <Progressing pageLoader />
            </div>
        )
    }

    const breadCrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.AUDIT_LOGS_DETAIL} />

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden bg__primary fs-13 cn-9">
            <PageHeader breadCrumbs={breadCrumbs} isBreadcrumbs />

            <div className="p-20 flexbox-col dc__gap-16 flex-grow-1 dc__overflow-hidden">
                <div className="dc__grid dc__gap-12 en-2 bw-1 br-8 p-16">
                    <div className="dc__border-bottom-n1 pb-16">
                        <span className="fs-16 fw-6">{auditLog.action}</span>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Timestamp</p>
                        <p className="m-0 cn-9 lh-20">
                            {dayjs(auditLog.timestamp).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                        </p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Type</p>
                        <p className="m-0 lh-20">{auditLog.type}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Module</p>
                        <p className="m-0 lh-20">{auditLog.module}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Action</p>
                        <p className="m-0 lh-20">{auditLog.action}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">User</p>
                        <p className="m-0 lh-20">{auditLog.user}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Resource</p>
                        <p className="m-0 lh-20">{auditLog.resource}</p>
                    </div>
                </div>

                <div className="flexbox-col flex-grow-1 dc__overflow-hidden en-2 bw-1 br-8">
                    <div className="px-16 py-12 dc__border-bottom bg__secondary">
                        <h3 className="m-0 fs-13 fw-6 cn-9 lh-20">Payload</h3>
                    </div>

                    <div className="flex-grow-1 dc__overflow-hidden">
                        <CodeEditor
                            readOnly
                            mode={MODES.JSON}
                            noParsing
                            value={JSON.stringify(auditLog.payload, null, 2)}
                            height="fitToParent"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuditLogDetail
