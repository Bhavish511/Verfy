import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Param, 
  Query, 
  Body, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { JsonServerService } from '../services/json-server.service';

@Controller()
export class JsonServerController {
  private readonly logger = new Logger(JsonServerController.name);

  constructor(private readonly jsonServerService: JsonServerService) {}

  // Users endpoints
  @Get('users')
  async getUsers(@Query() query: any) {
    try {
      return await this.jsonServerService.getUsers(query);
    } catch (error) {
      this.logger.error('Error getting users:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getUser(id);
    } catch (error) {
      this.logger.error(`Error getting user ${id}:`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('users')
  async createUser(@Body() body: any) {
    try {
      return await this.jsonServerService.createUser(body);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('users/:id')
  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateUser(id, body);
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  // Clubs endpoints
  @Get('clubs')
  async getClubs(@Query() query: any) {
    try {
      return await this.jsonServerService.getClubs(query);
    } catch (error) {
      this.logger.error('Error getting clubs:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('clubs/:id')
  async getClub(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getClub(id);
    } catch (error) {
      this.logger.error(`Error getting club ${id}:`, error);
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('clubs')
  async createClub(@Body() body: any) {
    try {
      return await this.jsonServerService.createClub(body);
    } catch (error) {
      this.logger.error('Error creating club:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('clubs/:id')
  @Patch('clubs/:id')
  async updateClub(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateClub(id, body);
    } catch (error) {
      this.logger.error(`Error updating club ${id}:`, error);
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('clubs/:id')
  async deleteClub(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteClub(id);
      return { message: 'Club deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting club ${id}:`, error);
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }
  }

  // Finances endpoints
  @Get('finances')
  async getFinances(@Query() query: any) {
    try {
      return await this.jsonServerService.getFinances(query);
    } catch (error) {
      this.logger.error('Error getting finances:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('finances/:id')
  async getFinance(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getFinance(id);
    } catch (error) {
      this.logger.error(`Error getting finance ${id}:`, error);
      throw new HttpException('Finance not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('finances')
  async createFinance(@Body() body: any) {
    try {
      return await this.jsonServerService.createFinance(body);
    } catch (error) {
      this.logger.error('Error creating finance:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('finances/:id')
  @Patch('finances/:id')
  async updateFinance(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateFinance(id, body);
    } catch (error) {
      this.logger.error(`Error updating finance ${id}:`, error);
      throw new HttpException('Finance not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('finances/:id')
  async deleteFinance(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteFinance(id);
      return { message: 'Finance deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting finance ${id}:`, error);
      throw new HttpException('Finance not found', HttpStatus.NOT_FOUND);
    }
  }

  // Transactions endpoints
  @Get('transactions')
  async getTransactions(@Query() query: any) {
    try {
      return await this.jsonServerService.getTransactions(query);
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getTransaction(id);
    } catch (error) {
      this.logger.error(`Error getting transaction ${id}:`, error);
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('transactions')
  async createTransaction(@Body() body: any) {
    try {
      return await this.jsonServerService.createTransaction(body);
    } catch (error) {
      this.logger.error('Error creating transaction:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('transactions/:id')
  @Patch('transactions/:id')
  async updateTransaction(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateTransaction(id, body);
    } catch (error) {
      this.logger.error(`Error updating transaction ${id}:`, error);
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('transactions/:id')
  async deleteTransaction(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteTransaction(id);
      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting transaction ${id}:`, error);
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
  }

  // Flag Charges endpoints
  @Get('flagCharges')
  async getFlagCharges(@Query() query: any) {
    try {
      return await this.jsonServerService.getFlagCharges(query);
    } catch (error) {
      this.logger.error('Error getting flag charges:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('flagCharges/:id')
  async getFlagCharge(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getFlagCharge(id);
    } catch (error) {
      this.logger.error(`Error getting flag charge ${id}:`, error);
      throw new HttpException('Flag charge not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('flagCharges')
  async createFlagCharge(@Body() body: any) {
    try {
      return await this.jsonServerService.createFlagCharge(body);
    } catch (error) {
      this.logger.error('Error creating flag charge:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('flagCharges/:id')
  @Patch('flagCharges/:id')
  async updateFlagCharge(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateFlagCharge(id, body);
    } catch (error) {
      this.logger.error(`Error updating flag charge ${id}:`, error);
      throw new HttpException('Flag charge not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('flagCharges/:id')
  async deleteFlagCharge(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteFlagCharge(id);
      return { message: 'Flag charge deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting flag charge ${id}:`, error);
      throw new HttpException('Flag charge not found', HttpStatus.NOT_FOUND);
    }
  }

  // Daily Expenses endpoints
  @Get('daily_expenses')
  async getDailyExpenses(@Query() query: any) {
    try {
      return await this.jsonServerService.getDailyExpenses(query);
    } catch (error) {
      this.logger.error('Error getting daily expenses:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('daily_expenses/:id')
  async getDailyExpense(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getDailyExpense(id);
    } catch (error) {
      this.logger.error(`Error getting daily expense ${id}:`, error);
      throw new HttpException('Daily expense not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('daily_expenses')
  async createDailyExpense(@Body() body: any) {
    try {
      return await this.jsonServerService.createDailyExpense(body);
    } catch (error) {
      this.logger.error('Error creating daily expense:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('daily_expenses/:id')
  @Patch('daily_expenses/:id')
  async updateDailyExpense(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateDailyExpense(id, body);
    } catch (error) {
      this.logger.error(`Error updating daily expense ${id}:`, error);
      throw new HttpException('Daily expense not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('daily_expenses/:id')
  async deleteDailyExpense(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteDailyExpense(id);
      return { message: 'Daily expense deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting daily expense ${id}:`, error);
      throw new HttpException('Daily expense not found', HttpStatus.NOT_FOUND);
    }
  }

  // Invitation Codes endpoints
  @Get('invitationCode')
  async getInvitationCodes(@Query() query: any) {
    try {
      return await this.jsonServerService.getInvitationCodes(query);
    } catch (error) {
      this.logger.error('Error getting invitation codes:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('invitationCode/:id')
  async getInvitationCode(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getInvitationCode(id);
    } catch (error) {
      this.logger.error(`Error getting invitation code ${id}:`, error);
      throw new HttpException('Invitation code not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('invitationCode')
  async createInvitationCode(@Body() body: any) {
    try {
      return await this.jsonServerService.createInvitationCode(body);
    } catch (error) {
      this.logger.error('Error creating invitation code:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('invitationCode/:id')
  @Patch('invitationCode/:id')
  async updateInvitationCode(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateInvitationCode(id, body);
    } catch (error) {
      this.logger.error(`Error updating invitation code ${id}:`, error);
      throw new HttpException('Invitation code not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('invitationCode/:id')
  async deleteInvitationCode(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteInvitationCode(id);
      return { message: 'Invitation code deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting invitation code ${id}:`, error);
      throw new HttpException('Invitation code not found', HttpStatus.NOT_FOUND);
    }
  }

  // User Clubs endpoints
  @Get('user_clubs')
  async getUserClubs(@Query() query: any) {
    try {
      return await this.jsonServerService.getUserClubs(query);
    } catch (error) {
      this.logger.error('Error getting user clubs:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user_clubs/:id')
  async getUserClub(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getUserClub(id);
    } catch (error) {
      this.logger.error(`Error getting user club ${id}:`, error);
      throw new HttpException('User club not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('user_clubs')
  async createUserClub(@Body() body: any) {
    try {
      return await this.jsonServerService.createUserClub(body);
    } catch (error) {
      this.logger.error('Error creating user club:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('user_clubs/:id')
  @Patch('user_clubs/:id')
  async updateUserClub(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateUserClub(id, body);
    } catch (error) {
      this.logger.error(`Error updating user club ${id}:`, error);
      throw new HttpException('User club not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('user_clubs/:id')
  async deleteUserClub(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteUserClub(id);
      return { message: 'User club deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting user club ${id}:`, error);
      throw new HttpException('User club not found', HttpStatus.NOT_FOUND);
    }
  }
  // Notification Endpoints
  @Get('notifications')
  async getNotifications(@Query() query:any){
    try {
      return await this.jsonServerService.getNotifications(query);
    } catch (error) {
      this.logger.error('Error getting notifications:',error);
      throw new HttpException('Internal server error',HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('notifications/:id')
  async getNotification(@Param('id') id:string){
    try {
      return await this.jsonServerService.getNotification(id);
    } catch (error) {
      this.logger.error(`Error getting Notification ${id}:`,error);
      throw new HttpException('Notification Not Found',HttpStatus.NOT_FOUND)
    }
  }
  @Post('notifications')
  async createNotification(@Body() body:any){
    try {
      return await this.jsonServerService.createNotification(body);
    } catch (error) {
      this.logger.error('Error creating Notification:',error);
      throw new HttpException('Internal server error',HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('notifications/:id')
  @Patch('notifications/:id')
  async updateNotification(@Param('id') id:string, @Body() body: any){
    try {
      return await this.jsonServerService.updateNotification(id,body);
    } catch (error) {
      this.logger.error(`Error updating Notification ${id}:`,error);
      throw new HttpException('Notification Not Found',HttpStatus.NOT_FOUND)
    }
  }

  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id:string){
    try {
      return await this.jsonServerService.deleteNotification(id);
    } catch (error) {
      this.logger.error(`Error deleting Notification ${id}:`, error);
      throw new HttpException('Notification Not Found', HttpStatus.NOT_FOUND);
    }
  }
  // Feedbacks endpoints
  @Get('feedbacks')
  async getFeedbacks(@Query() query: any) {
    try {
      return await this.jsonServerService.getFeedbacks(query);
    } catch (error) {
      this.logger.error('Error getting feedbacks:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('feedbacks/:id')
  async getFeedback(@Param('id') id: string) {
    try {
      return await this.jsonServerService.getFeedback(id);
    } catch (error) {
      this.logger.error(`Error getting feedback ${id}:`, error);
      throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('feedbacks')
  async createFeedback(@Body() body: any) {
    try {
      return await this.jsonServerService.createFeedback(body);
    } catch (error) {
      this.logger.error('Error creating feedback:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('feedbacks/:id')
  @Patch('feedbacks/:id')
  async updateFeedback(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.jsonServerService.updateFeedback(id, body);
    } catch (error) {
      this.logger.error(`Error updating feedback ${id}:`, error);
      throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('feedbacks/:id')
  async deleteFeedback(@Param('id') id: string) {
    try {
      await this.jsonServerService.deleteFeedback(id);
      return { message: 'Feedback deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting feedback ${id}:`, error);
      throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
    }
  }


  // Database management endpoints
  @Get('stats')
  async getDatabaseStats() {
    try {
      return await this.jsonServerService.getDatabaseStats();
    } catch (error) {
      this.logger.error('Error getting database stats:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('backup')
  async backupDatabase() {
    try {
      const backupPath = await this.jsonServerService.backupDatabase();
      return { 
        success: true, 
        message: 'Database backup created successfully',
        backupPath 
      };
    } catch (error) {
      this.logger.error('Error creating database backup:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('restore')
  async restoreDatabase(@Body() body: { backupPath: string }) {
    try {
      await this.jsonServerService.restoreDatabase(body.backupPath);
      return { 
        success: true, 
        message: 'Database restored successfully' 
      };
    } catch (error) {
      this.logger.error('Error restoring database:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}