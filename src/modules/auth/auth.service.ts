import { SubMemberService } from './../sub-member/sub-member.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { EmailService } from '../email/email.service';
import { JsonServerService } from '../../services/json-server.service';
import { uploadFileHandler } from 'src/utils/uploadFileHandler';
interface User {
  id: string | number;
  email: string;
  password?: string;
  roles: string;
  currently_at?: string | number;
}

interface InvitationCode {
  id: string | number;
  invitationCode: string;
  subMemberId: string | number;
  status: 'active' | 'used' | 'expired';
  expiresAt: string;
  usedAt?: string;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly emailService: EmailService,
    private readonly jsonServerService: JsonServerService,
  ) {}

  fields = {
    financeId: null,
    currently_at: null,
    roles: 'member',
    userId: null,
    transactionId: null,
    dailyExpensesId: null,
  };
  async signUp({
    email,
    password,
    fullname,
  }: LoginDto & { fullname?: string }) {
    try {
      // Check if user already exists
      const existingUsers = await this.jsonServerService.getUsers({ email });
      if (existingUsers && existingUsers.length > 0) {
        throw new BadRequestException('User with this email already exists!');
      }

      // Create finance record for the new member
      const finance = await this.jsonServerService.createFinance({
        totalAllowance: 0, // Will be set later
        totalSpent: 0,
      });

      // Create new member
      const newMember = await this.jsonServerService.createUser({
        fullname: fullname || 'New Member',
        email,
        password,
        roles: 'member',
        financeId: finance.id,
        currently_at: null, // Will be set when they join a club
        userId: null,
        phone: null,
        address: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Member registered successfully!',
        data: {
          user: {
            id: newMember.id,
            fullname: newMember.fullname,
            email: newMember.email,
            roles: newMember.roles,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed',
        error: error.message,
      };
    }
  }

  async LoginforMember({ email, password }: LoginDto) {
    try {
      const users = await this.jsonServerService.getUsers({ email });
      const user = users[0];
      if (!user) throw new BadRequestException('Incorrect email or password!');

      if (user.password !== password)
        throw new BadRequestException('Incorrect email or password!');
      if (user.roles === 'submember') {
        throw new UnauthorizedException('Sub-members are not allowed to login as member');  
      }
      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: '1d',
        },
      );
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'Login Successful!',
        data: { user:userWithoutPassword, accessToken },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  // Verify sub-member credentials (Step 1) - ROLE CHECK HERE
  async verifySubMemberCredentials(
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    message: string;
    data : {userId: string | number;
    email: string;
    role: string}
    
  }> {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required!');
      }

      const users = await this.jsonServerService.getUsers({ email });
      const user = users[0] as User;

      if (!user) {
        throw new BadRequestException('Incorrect email or password!');
      }

      if (user.password !== password) {
        throw new BadRequestException('Incorrect email or password!');
      }

      // ✅ ROLE CHECK - Only here, not in completeLogin
      if (user.roles !== 'submember') {
        throw new BadRequestException('This endpoint is only for sub-members!');
      }

      return {
        success: true,
        message: 'Credentials verified. Please provide invitation code.',
        data: {
          userId: user.id,
          email: user.email,
          role: user.roles
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Verification failed');
    }
  }

  // Complete sub-member login with invitation code (Step 2) - NO ROLE CHECK HERE
  async completeSubMemberLogin(
    userId: string | number,
    invitationCode: string,
  ) {
    try {
      console.log(userId);
      console.log(invitationCode);
      
      if (!userId || !invitationCode) {
        throw new BadRequestException(
          'User ID and invitation code are required!',
        );
      }

      // Get user but DON'T check role again - just verify existence
      const users = await this.jsonServerService.getUsers({ id: userId });
      const user = users[0] as User;
      console.log(user);
      
      if (!user) {
        throw new BadRequestException('User not found!');
      }

      // ❌ REMOVED ROLE CHECK - Already done in verifyCredentials
      // if (user.roles !== 'submember') {
      //   throw new BadRequestException('Invalid user or permissions changed!');
      // }

      // Validate invitation code only
      const invitationCodes = await this.jsonServerService.getInvitationCodes({
        invitationCode,
      });
      const match = invitationCodes[0] as InvitationCode;
      console.log(match.status);
      
      console.log(invitationCodes[0]);
      
      if (!match) {
        throw new BadRequestException('Invalid invitation code!');
      }

      if (String(match.subMemberId) !== String(userId)) {
        throw new BadRequestException(
          'Invitation code does not match this sub-member!',
        );
      }

      // if (match.status !== 'active') {
      //   throw new BadRequestException('Invitation code is no longer active!');
      // }

      const now = new Date();
      const expiresAt = new Date(match.expiresAt);

      if (now > expiresAt) {
        await this.jsonServerService.updateInvitationCode(match.id, {
          status: 'expired',
        });
        throw new BadRequestException('Invitation code has expired!');
      }

      // Mark invitation code as used
      // await this.jsonServerService.updateInvitationCode(match.id, {
      //   status: 'used',
      //   usedAt: now.toISOString(),
      // });

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: '1d',
        },
      );

      // Remove password from user object before returning
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Sub-member login successful!',
        data: {
          user:userWithoutPassword,
          accessToken,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Login completion failed');
    }
  }
  async logout(accessToken: string) {
    // just return success, since JWTs are stateless
    return {
      success: true,
      message: 'Logout successful!',
    };
  }
  async findOne(id: number) {
    const member = await this.jsonServerService.getUser(id);
    return member;
  }
  async findOneWithEmail(email: string) {
    try {
      const users = await this.jsonServerService.findOneByField('users', 'email', email);      
      if (!users || (Array.isArray(users) && users.length === 0)) {
        throw new NotFoundException('Invalid Email!');
      }

      // Optionally pick the first:
      const user = Array.isArray(users) ? users[0] : users;

      return { success: true, email: user.email };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async resetPassword({ email, newPassword }: UpdateAuthDto) {
    try {
      const users = await this.jsonServerService.findOneByField('users', 'email', email);      
      if (!users || users.length === 0)
        throw new NotFoundException('User not found!');
      
      const updatedUser = await this.jsonServerService.updateUser(users.id, {
        password: newPassword,
      });
      return { success: true, message: 'Password Reset!'
        , //data: updatedUsed
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateProfile(userId: string, updateData: any) {
    try {
      // Check if user exists
      const user = await this.jsonServerService.getUser(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if email is being updated and if it's already taken
      if (updateData.email && updateData.email !== user.email) {
        const existingUsers = await this.jsonServerService.getUsers({
          email: updateData.email,
        });
        if (existingUsers && existingUsers.length > 0) {
          throw new BadRequestException('Email already exists');
        }
      }

      // Update user profile
      const updatedUser = await this.jsonServerService.updateUser(userId, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            profilePicture: updatedUser.profilePicture,
            roles: updatedUser.roles,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      };
    }
  }

  // async updateProfilePicture(userId: string, profilePicture: string) {
  //   try {
  //     // Check if user exists
  //     const user = await this.jsonServerService.getUser(userId);
  //     if (!user) {
  //       throw new BadRequestException('User not found');
  //     }

  //     // Update profile picture
  //     const updatedUser = await this.jsonServerService.updateUser(userId, {
  //       profilePicture,
  //       updatedAt: new Date().toISOString()
  //     });

  //     return {
  //       success: true,
  //       message: 'Profile picture updated successfully',
  //       data: {
  //         user: {
  //           id: updatedUser.id,
  //           fullname: updatedUser.fullname,
  //           email: updatedUser.email,
  //           profilePicture: updatedUser.profilePicture
  //         }
  //       }
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Failed to update profile picture',
  //       error: error.message,
  //     };
  //   }
  // }
  async updateProfilePicture(userId: number, file?: Express.Multer.File) {
  try {
    if (!file) {
      // Clear profile picture
      const updatedUser = await this.jsonServerService.updateUser(userId, {
        profilePic: null,
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: 'Profile picture removed successfully',
        data: {
          user: {
            id: updatedUser.id,
            fullname: updatedUser.fullname,
            profilePic: null,
          },
        },
      };
    }

    const image_handler = uploadFileHandler(file.originalname, file);
    if (!image_handler.success) {
      throw new BadRequestException(image_handler?.message || 'Image upload failed');
    }

    const updatedUser = await this.jsonServerService.updateUser(userId, {
      profilePic: image_handler.data?.filePath, // save full URL/path
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          fullname: updatedUser.fullname,
          profilePic: updatedUser.profilePic, // return URL/path for frontend
        },
      },
    };
  } catch (error) {
    throw new InternalServerErrorException(error?.message || 'Failed to update profile picture');
  }
}


  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
