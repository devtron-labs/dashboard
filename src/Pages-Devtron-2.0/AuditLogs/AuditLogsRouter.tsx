import { Route, Routes } from 'react-router-dom'

import { BASE_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

import AuditLogDetail from './AuditLogDetail'
import AuditLogsList from './AuditLogsList'

const AuditLogsRouter = () => (
    <Routes>
        <Route index element={<AuditLogsList />} />
        <Route path={BASE_ROUTES.AUDIT_LOGS.DETAIL} element={<AuditLogDetail />} />
    </Routes>
)

export default AuditLogsRouter
