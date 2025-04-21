// NOTE: This API is used to check if the license is valid or not at APP.TSX level

import {
    DevtronLicenseDTO,
    DevtronLicenseInfo,
    get,
    parseDevtronLicenseData,
    ROUTES,
} from '@devtron-labs/devtron-fe-common-lib'

// Only gives complete response if the license is invalid else return only fingerprint
export const getDevtronLicenseInfo = async (): Promise<DevtronLicenseInfo> => {
    const { result } = await get<DevtronLicenseDTO>(ROUTES.LICENSE_DATA, { preventLicenseRedirect: true })
    return parseDevtronLicenseData(result)
}
