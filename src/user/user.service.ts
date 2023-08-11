import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createData: CreateUserDto) {
    const user = await this.repo.create(createData);
    this.repo.save(user);
  }

  find(email: string) {
    return this.repo.findBy({ email });
  }
}
