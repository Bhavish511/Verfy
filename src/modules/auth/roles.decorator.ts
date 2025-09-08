import {SetMetadata} from '@nestjs/common'
import {Role} from './roles.enum'

export type Authorizer = Role 
export const ROLES_KEY = 'roles'
export const Roles = (...roles: Authorizer[]) => SetMetadata(ROLES_KEY, roles)
