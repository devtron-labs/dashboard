export enum UserStatus {
    active = 'active',
    inactive = 'inactive',
    timeToLive = 'timeToLive',
}

export enum PermissionType {
    SUPER_ADMIN = 'SUPER_ADMIN',
    SPECIFIC = 'SPECIFIC',
}

export const PERMISSION_TYPE_LABEL_MAP: Record<PermissionType, string> = {
    [PermissionType.SPECIFIC]: 'Specific permissions',
    [PermissionType.SUPER_ADMIN]: 'Super admin permission',
} as const
