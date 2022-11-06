//TODO: Implementar enum como GraphQL Enum Type

import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {
    admin = 'admin',
    user = 'user',
    superUser = 'superUser'
}

registerEnumType( ValidRoles, { name: 'ValidRoles', description: 'Estos son los roles permitidos' })