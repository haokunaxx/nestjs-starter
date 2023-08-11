import { PrimaryGeneratedColumn, Column } from 'typeorm';

export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  isAdmin: boolean;
}
