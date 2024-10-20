/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { get } from '@Common/Api'
import { ResponseType } from '@Common/Types'
import { getUrlWithSearchParams } from '@Common/Helper'
import { ROUTES } from '@Common/Constants'
import { ApiResponseResultType, ExecutionDetailsPayload } from './types'
import { parseExecutionDetailResponse } from './utils'

export const getExecutionDetails = async (
    executionDetailPayload: ExecutionDetailsPayload,
): Promise<ResponseType<ApiResponseResultType>> => {
    const url = getUrlWithSearchParams(ROUTES.SECURITY_SCAN_EXECUTION_DETAILS, executionDetailPayload)
    const response = await get(url)
    const parsedResult = {
        ...(response.result || {}),
        scanExecutionId: response.result?.ScanExecutionId,
        lastExecution: response.result?.executionTime,
        objectType: response.result?.objectType,
        vulnerabilities:
            response.result?.vulnerabilities?.map((cve) => ({
                name: cve.cveName,
                severity: cve.severity,
                package: cve.package,
                version: cve.currentVersion,
                fixedVersion: cve.fixedVersion,
                permission: cve.permission,
            })) || [],
    }
    return { ...response, result: parseExecutionDetailResponse(parsedResult) }
}
