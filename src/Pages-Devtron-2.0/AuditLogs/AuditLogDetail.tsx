import dayjs from 'dayjs'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    ComponentSizeType,
    DATE_TIME_FORMATS,
    Drawer,
    Icon,
    MODES,
} from '@devtron-labs/devtron-fe-common-lib'

import { AuditLogDetailType } from './types'

import './auditLog.scss'

interface AuditLogDetailProps {
    auditLog: AuditLogDetailType
    onClose: () => void
}

const AuditLogDetail = ({ auditLog, onClose }: AuditLogDetailProps) => (
    <Drawer position="right" width="600px" onClose={onClose} onEscape={onClose}>
        <div className="flexbox-col h-100 bg__primary fs-13 cn-9">
            <div className="flex dc__content-space px-20 py-12 dc__border-bottom">
                <div className="flex left dc__gap-8 dc__mxw-90">
                    <Icon name="ic-file-log-search" color="B500" size={20} />
                    <h2 className="m-0 fs-16 fw-6 cn-9 lh-1-5 dc__truncate">{auditLog.action}</h2>
                </div>
                <Button
                    dataTestId="audit-log-detail-close"
                    ariaLabel="Close"
                    icon={<Icon name="ic-close-large" color={null} />}
                    onClick={onClose}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                    size={ComponentSizeType.xs}
                    showAriaLabelInTippy={false}
                />
            </div>

            <div className="p-20 flexbox-col dc__gap-16 flex-grow-1 dc__overflow-hidden">
                <div className="dc__grid dc__gap-12 en-2 bw-1 br-8 p-16">
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Timestamp</p>
                        <p className="m-0 cn-9 lh-20">
                            {auditLog.timeStamp
                                ? dayjs(auditLog.timeStamp).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)
                                : '-'}
                        </p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Type</p>
                        <p className="m-0 lh-20">{auditLog.requestMethod || '-'}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Module</p>
                        <p className="m-0 lh-20">{auditLog.module || '-'}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">User</p>
                        <p className="m-0 lh-20">{auditLog.user || '-'}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Resource Name</p>
                        <p className="m-0 lh-20">{auditLog.resourceName || '-'}</p>
                    </div>
                    <div className="audit-logs__grid dc__grid dc__gap-16">
                        <p className="m-0 lh-20">Resource Type</p>
                        <p className="m-0 lh-20">{auditLog.resourceType || '-'}</p>
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
                            value={JSON.stringify(auditLog.payload ?? {}, null, 2)}
                            height="fitToParent"
                        />
                    </div>
                </div>
            </div>
        </div>
    </Drawer>
)

export default AuditLogDetail
