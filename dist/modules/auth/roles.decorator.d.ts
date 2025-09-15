import { Role } from './roles.enum';
export type Authorizer = Role;
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Authorizer[]) => import("@nestjs/common").CustomDecorator<string>;
