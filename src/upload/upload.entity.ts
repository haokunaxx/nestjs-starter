import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export default class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash: string;

  @Column()
  name: string;

  // @Column()
  // mineType: string;

  // @Column()
  // size: number;
}
