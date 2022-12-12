import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { User } from './entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {

  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ){}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync( signupInput.password, 10 )
      });
      
      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll( roles: ValidRoles[] ): Promise<User[]> {
    if( roles.length === 0 ){
      return await this.usersRepository.find(
        //TODO: Esto ya no es necesario cuando en la entidad se pone la propiedad lazy: true
        // {
        //   relations: {
        //     lastUpdateBy: true
        //   }
        // }
      );
    } 
    
    return this.usersRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {

      throw new NotFoundException(`User with email ${email} not found`);
      
      // this.handleDBError({
      //   code: 'error-001',
      //   detail: `User with email ${email} not found`
      // });  
    }
    
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {

      throw new NotFoundException(`User with id ${id} not found`);
      
    }
    
  }

  async update(id: String, updateUserInput: UpdateUserInput, updateBy: User): Promise<User> {
    try {
      const user = await this.usersRepository.preload({...updateUserInput});
      user.lastUpdateBy = updateBy;
      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    
    const userToBlock = await this.findOneById( id );
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;

    return await this.usersRepository.save(userToBlock);

  }

  private handleDBError( error: any): never {
    this.logger.error( error );
    if( error.code === '23505'){
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }

    if(error.code === 'error-001'){
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Please check server logs');
  }
}
