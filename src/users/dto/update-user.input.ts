import { CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field( () => [ValidRoles], { nullable: true })
  @IsOptional()
  @IsArray()
  roles?: ValidRoles[];

  @Field( () => Boolean, { nullable: true } )
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
