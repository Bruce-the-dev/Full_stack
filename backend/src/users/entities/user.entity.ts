import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string;

  @Column({ default: true })
  status: boolean;

  @Column('bigint')
  createdAt: number;

  @Column({ type: 'blob', nullable: true })
  signature: Buffer;

  @Column({ type: 'blob', nullable: true })
  publicKeySpki: Buffer;
}
