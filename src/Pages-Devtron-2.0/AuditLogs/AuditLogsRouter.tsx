import { Route, Routes } from 'react-router-dom'

import AuditLogsList from './AuditLogsList'

const AuditLogsRouter = () => (
    <Routes>
        <Route index element={<AuditLogsList />} />
    </Routes>
)

export default AuditLogsRouter
