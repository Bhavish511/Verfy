<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**VerifyNow** - A comprehensive club management and financial tracking system built with NestJS. This application manages club memberships, financial transactions, expense tracking, and provides role-based access control for members and sub-members.

## Key Features

- **User Management**: Member and sub-member registration with invitation codes
- **Financial Tracking**: Budget management, expense tracking, and spending limits
- **Transaction System**: Club-based transactions with approval workflows
- **Role-Based Access**: Different permissions for members vs sub-members
- **Report Generation**: Comprehensive PDF reports for financial analysis
- **Flag System**: Suspicious transaction flagging and audit trails
- **Email Integration**: User notifications and password reset functionality

## Architecture

- **Backend**: NestJS with TypeScript
- **Database**: JSON Server (integrated) with file-based persistence
- **Authentication**: JWT-based with role-based access control
- **PDF Generation**: PDFKit for comprehensive reports
- **Email**: Nodemailer integration

## Project Setup

```bash
$ npm install
```

## Running the Application

The application now runs as a single process with integrated JSON Server functionality:

```bash
# development mode (recommended)
$ npm run dev

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod

# debug mode
$ npm run start:debug
```

**Note**: The application runs on port 3000 and includes all JSON Server endpoints. No separate JSON Server process is needed.

## API Endpoints

### Authentication
- `POST /auth/login-member` - Member login
- `POST /auth/login-sub-member` - Sub-member login
- `POST /auth/reset-password` - Password reset
- `GET /auth/logout` - Logout

### Core Data (JSON Server endpoints)
- `GET/POST/PUT/PATCH/DELETE /users` - User management
- `GET/POST/PUT/PATCH/DELETE /clubs` - Club management
- `GET/POST/PUT/PATCH/DELETE /finances` - Financial data
- `GET/POST/PUT/PATCH/DELETE /transactions` - Transaction management
- `GET/POST/PUT/PATCH/DELETE /flagCharges` - Flag charge management
- `GET/POST/PUT/PATCH/DELETE /daily_expenses` - Daily expense tracking
- `GET/POST/PUT/PATCH/DELETE /invitationCode` - Invitation code management

### Application Features
- `GET /member/dashboard` - Member dashboard
- `POST /sub-member/create` - Create sub-member
- `POST /transactions/create` - Create transaction
- `GET /eov/report` - Generate PDF report

## User Roles

### Members
- Primary account holders
- Can create and manage sub-members
- Have financial allowances and spending limits
- Can approve/refuse transactions
- Generate comprehensive reports

### Sub-Members
- Secondary users under a member's account
- Have their own allowances
- Can make transactions that require member approval
- Access through invitation codes

## Database

The application uses a file-based database (`db.json`) with the following collections:
- `users` - User accounts (members and sub-members)
- `clubs` - Club information
- `finances` - Financial data and allowances
- `transactions` - Transaction records
- `flagCharges` - Flagged suspicious transactions
- `daily_expenses` - Daily expense tracking
- `invitationCode` - Sub-member invitation codes

## Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Detailed integration documentation
- [Quick Start Guide](QUICK_START.md) - Quick setup and testing guide

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
