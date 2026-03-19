import type { Response } from "express";
import HttpStatus from 'http-status-codes';

interface PaginationInfo {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface ApiResponseData {
    success: boolean;
    message: string;
    data?: any;
    pagination?: PaginationInfo;
    errors?: any[];
    timestamp: string;
}

export class ApiResponse {
    static success(
        res: Response,
        data: any = null,
        message: string = 'Success',
        statusCode: number = HttpStatus.OK
    ): Response {
        const responseData: ApiResponseData = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        };

        return res.status(statusCode).json(responseData);
    }

    static error(
        res: Response,
        message: string = 'Something went wrong',
        statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
        errors: any[] = []
    ): Response {
        const responseData: ApiResponseData = {
            success: false,
            message,
            errors: (errors.length > 0 ? errors : undefined) as any[],
            timestamp: new Date().toISOString(),
        };

        return res.status(statusCode).json(responseData);
    }

    static paginated(
        res: Response,
        data: any[],
        total: number,
        page: number,
        limit: number,
        message: string = 'Success'
    ): Response {
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        const responseData: ApiResponseData = {
            success: true,
            message,
            data,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext,
                hasPrev,
            },
            timestamp: new Date().toISOString(),
        };

        return res.status(HttpStatus.OK).json(responseData);
    }

    static created(
        res: Response,
        data: any,
        message: string = 'Resource created successfully'
    ): Response {
        return this.success(res, data, message, HttpStatus.CREATED);
    }

    static badRequest(
        res: Response,
        message: string = 'Bad Request',
        errors: any[] = []
    ): Response {
        return this.error(res, message, HttpStatus.BAD_REQUEST, errors);
    }

    static unauthorized(
        res: Response,
        message: string = 'Unauthorized'
    ): Response {
        return this.error(res, message, HttpStatus.UNAUTHORIZED);
    }

    static forbidden(
        res: Response,
        message: string = 'Forbidden'
    ): Response {
        return this.error(res, message, HttpStatus.FORBIDDEN);
    }

    static notFound(
        res: Response,
        message: string = 'Not Found'
    ): Response {
        return this.error(res, message, HttpStatus.NOT_FOUND);
    }

    static conflict(
        res: Response,
        message: string = 'Conflict',
        errors: any[] = []
    ): Response {
        return this.error(res, message, HttpStatus.CONFLICT, errors);
    }

    static validationError(
        res: Response,
        errors: any[],
        message: string = 'Validation Error'
    ): Response {
        return this.error(res, message, HttpStatus.UNPROCESSABLE_ENTITY, errors);
    }

    static serverError(
        res: Response,
        message: string = 'Internal Server Error',
        errors: any[] = []
    ): Response {
        return this.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR, errors);
    }

    static noContent(res: Response): Response {
        return res.status(HttpStatus.NO_CONTENT).send();
    }

    static accepted(
        res: Response,
        data: any,
        message: string = 'Request accepted'
    ): Response {
        return this.success(res, data, message, HttpStatus.ACCEPTED);
    }
}