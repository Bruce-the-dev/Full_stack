import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';
import * as protobuf from 'protobufjs';
import * as path from 'path';

@Controller('users')
export class UsersController {
  private protoRoot: protobuf.Root | null = null;

  constructor(private readonly usersService: UsersService) {
    protobuf
      .load(path.join(__dirname, '..', '..', 'users.proto'))
      .then((root) => {
        this.protoRoot = root;
        console.log('Proto loaded');
      })
      .catch((err) => {
        console.error('proto load error', err);
      });
  }

  @Post()
  async create(@Body() body: { email: string; role?: string }) {
    return this.usersService.createUser(body.email, body.role);
  }

  @Get()
  async list() {
    return this.usersService.listUsers();
  }

  @Get('export')
  async exportAll(@Res() res: Response) {
    const users = await this.usersService.getAllUsersForExport();
    if (!this.protoRoot) {
      return res.status(500).send('proto not loaded yet');
    }
    const UsersMessage = this.protoRoot.lookupType('users.Users');

    const payload = {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: Number(u.createdAt),
        signature: u.signature,
        publicKeySpki: u.publicKeySpki,
      })),
    };

    const err = UsersMessage.verify(payload);
    if (err) {
      return res.status(500).send(err.toString());
    }
    const message = UsersMessage.create(payload);
    const buffer = UsersMessage.encode(message).finish();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(Buffer.from(buffer));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
  @Delete('all')
  async deleteAll() {
    return this.usersService.deleteAllUsers();
  }
}
