import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    default: false,
  })
  admin: boolean;
}
