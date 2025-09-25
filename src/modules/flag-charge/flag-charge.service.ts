import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFlagChargeDto } from './dto/create-flag-charge.dto';
import { JsonServerService } from '../../services/json-server.service';
import { uploadFileHandler } from 'src/utils/uploadFileHandler';

@Injectable()
export class FlagChargeService {
  constructor(private readonly jsonServerService: JsonServerService) {}

  async create(
    { reasons, comment }: CreateFlagChargeDto,
    id: string,
    req,
    uploadedFile?: Express.Multer.File,
  ) {
    try {
      const userId = req.user.id;
      const userRole = req.user.roles;

      // 1. Get transaction
      const transaction = await this.jsonServerService.getTransaction(id);
      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      // 2. Role-based authorization
      if (userRole === 'member') {
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
        if (String(transaction.userId) !== String(userId)) {
          throw new UnauthorizedException('You can only flag your own charges');
        }
      }
      const actingUser = await this.jsonServerService.getUser(userId);
      if (String(transaction.clubId) !== String(actingUser.currently_at)) {
        throw new UnauthorizedException(
          'You can only flag charges in your current club',
        );
      }
      // 3. Validation: only pending or approved can be flagged
      if (
        transaction.status !== 'pending' &&
        transaction.status !== 'approved'
      ) {
        throw new BadRequestException(
          'Only pending or approved transactions can be flagged',
        );
      }

      if (transaction.flagChargeId) {
        throw new BadRequestException('Transaction is already flagged');
      }

      // 4. Handle file upload
      let filePath: string | undefined;
      if (uploadedFile) {
        const uploadResult = uploadFileHandler(
          uploadedFile.originalname,
          uploadedFile,
        );
        if (!uploadResult.success) {
          throw new BadRequestException(uploadResult.message);
        }
        filePath = uploadResult.data?.filePath;
      }
      const parsedReasons =
        typeof reasons === 'string' ? JSON.parse(reasons) : reasons;
      const cleanComment =
        typeof comment === 'string' && comment.startsWith('"')
          ? JSON.parse(comment)
          : comment;
      // 5. Create flag charge record
      const flagCharge = await this.jsonServerService.createFlagCharge({
        reasons: parsedReasons,
        comment:cleanComment,
        file: filePath,
        userId,
        transactionId: transaction.id,
        flaggedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 6. Update transaction
      const updatedTransaction = await this.jsonServerService.updateTransaction(
        transaction.id,
        {
          flagChargeId: flagCharge.id,
          status: 'refused',
          verifyCharge: false,
          date: transaction.date, // preserve original date
          createdAt: transaction.createdAt,
          updatedAt: new Date().toISOString(),
        },
      );

      // 7. Attach userName to transaction
      const allUsers = await this.jsonServerService.getUsers();
      const userInfo = allUsers.find(
        (u: any) => String(u.id) === String(updatedTransaction.userId),
      );
      const parentInfo = allUsers.find(
        (u: any) => String(u.id) === String(userId),
      );

      // 8. Get club info
      const clubDetails = await this.jsonServerService.getClub(
        transaction.clubId,
      );

      //* Flag-charge Notifications
      const parentBody = `You flagged the transaction of $${transaction.bill} made by ${userInfo?.fullname} in ${clubDetails?.name}.`;
      await this.jsonServerService.createNotification({
        userId,
        clubId: clubDetails.id,
        title: 'Transaction Flagged',
        body: parentBody,
      });

      if (userInfo?.roles === 'submember') {
        const childBody = `Your transaction of $${transaction.bill} was flagged by ${parentInfo?.fullname} in ${clubDetails?.name}. Please review it.`;
        await this.jsonServerService.createNotification({
          userId: transaction.userId,
          clubId: clubDetails.id,
          title: 'Transaction Flagged',
          body: childBody,
        });
      }

      return {
        success: true,
        message: 'Charge flagged successfully',
        data: {
          ...updatedTransaction,
          userName: userInfo?.fullname || userInfo?.userName || null,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
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
