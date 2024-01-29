/**
 * Permission types for users and permission groups
 */
export enum PermissionType {
    SUPER_ADMIN = 'SUPER_ADMIN',
    SPECIFIC = 'SPECIFIC',
}

export const PERMISSION_TYPE_LABEL_MAP: Record<PermissionType, string> = {
    [PermissionType.SPECIFIC]: 'Specific permissions',
    [PermissionType.SUPER_ADMIN]: 'Super admin permission',
} as const
