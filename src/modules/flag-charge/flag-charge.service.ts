import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateFlagChargeDto } from './dto/create-flag-charge.dto';
import { UpdateFlagChargeDto } from './dto/update-flag-charge.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JsonServerService } from '../../services/json-server.service';
import { uploadFileHandler } from 'src/utils/uploadFileHandler';

@Injectable()
export class FlagChargeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jsonServerService: JsonServerService,
  ) {}

  async create(
    { reasons, comment, file }: CreateFlagChargeDto,
    id: string,
    req,
    uploadedFile?: Express.Multer.File,
  ) {
    try {
      const userId = req.user.id;
      const userRole = req.user.roles;

      const transaction = await this.jsonServerService.getTransaction(id);
      console.log(transaction);

      // Check authorization based on role
      if (userRole === 'member') {
        // Members can flag charges for themselves or their sub-members
        const allUsers = await this.jsonServerService.getUsers();
        const subMembers = allUsers.filter(
          (u: any) =>
            String(u.parentId) === String(userId) && u.roles === 'submember',
        );

        const allowedUserIds = new Set<string>([
          String(userId),
          ...subMembers.map((s: any) => String(s.id)),
        ]);

        if (!allowedUserIds.has(String(transaction.userId))) {
          throw new UnauthorizedException(
            'You can only flag charges for yourself or your sub-members',
          );
        }
      } else if (userRole === 'submember') {
        // Sub-members can only flag their own charges
        if (String(transaction.userId) !== String(userId)) {
          throw new UnauthorizedException('You can only flag your own charges');
        }
      }

      // Allow flagging of pending transactions and verified transactions
      if (transaction.status !== 'pending' && transaction.status !== 'approved') {
        throw new BadRequestException(
          'Only pending or approved transactions can be flagged',
        );
      }

      if (transaction.flagChargeId) {
        throw new BadRequestException('Transaction is already flagged');
      }

      // Handle file upload if provided
      let filePath: string | undefined;
      if (uploadedFile) {
        const uploadResult = uploadFileHandler(uploadedFile.originalname, uploadedFile);
        if (!uploadResult.success) {
          throw new BadRequestException(uploadResult.message);
        }
        filePath = uploadResult.data?.filePath;
      }

      const flagCharge = await this.jsonServerService.createFlagCharge({
        reasons,
        comment,
        file: filePath,
        userId,
        transactionId: transaction.id,
        flaggedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const updatedTransaction = await this.jsonServerService.updateTransaction(
        transaction.id,
        {
          flagChargeId: flagCharge.id,
          status: 'refused',
          updatedAt: new Date().toISOString(),
        },
      );

      return {
        success: true,
        message: 'Charge flagged successfully',
        // data: {
        //   transaction: updatedTransaction,
        //   flagCharge,
        // },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to flag charge',
        data: null,
        error: error.message,
      };
    }
  }

  findAll() {
    return `This action returns all flagCharge`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} flagCharge`;
  // }

  // update(id: number, updateFlagChargeDto: UpdateFlagChargeDto) {
  //   return `This action updates a #${id} flagCharge`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} flagCharge`;
  // }
}
