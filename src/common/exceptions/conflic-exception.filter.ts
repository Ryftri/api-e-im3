import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
  
@Catch(ConflictException)
export class ConflictExceptionFilter implements ExceptionFilter {
    catch(exception: ConflictException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const message = exceptionResponse['message'] ?? 'Conflict';

        response.status(status).json({
            status: 'error',
            message: message,
        });
    }
}
  