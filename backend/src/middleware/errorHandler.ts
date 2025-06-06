import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  emergencyContext?: {
    userId?: string;
    emergencyId?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public emergencyContext?: {
    userId?: string;
    emergencyId?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true,
    emergencyContext?: AppError['emergencyContext']
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.emergencyContext = emergencyContext;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class EmergencyError extends AppError {
  constructor(
    message: string,
    userId?: string,
    emergencyId?: string,
    location?: { latitude: number; longitude: number }
  ) {
    super(message, 500, true, {
      userId,
      emergencyId,
      location,
      severity: 'CRITICAL'
    });
  }
}

export class CarrierError extends AppError {
  public carrier: string;
  
  constructor(message: string, carrier: string, statusCode: number = 503) {
    super(`Carrier ${carrier} error: ${message}`, statusCode);
    this.carrier = carrier;
  }
}

export class SecurityError extends AppError {
  constructor(message: string, statusCode: number = 403) {
    super(`Security violation: ${message}`, statusCode, true, { severity: 'HIGH' });
  }
}

const handleZodError = (error: ZodError): AppError => {
  const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
  return new AppError(`Validation failed: ${errors.join(', ')}`, 400);
};

const handlePrismaError = (error: PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      return new AppError('Duplicate field value', 409);
    case 'P2025':
      return new AppError('Record not found', 404);
    case 'P2003':
      return new AppError('Foreign key constraint failed', 400);
    case 'P2014':
      return new AppError('Invalid ID', 400);
    default:
      return new AppError('Database error', 500);
  }
};

const logError = (error: AppError, req: Request) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      emergencyContext: error.emergencyContext
    }
  };

  // Emergency errors need immediate attention
  if (error.emergencyContext?.severity === 'CRITICAL') {
    console.error('🚨 EMERGENCY ERROR - IMMEDIATE ATTENTION REQUIRED:', errorLog);
    
    // In production, send to monitoring service (Sentry, DataDog, etc.)
    // sendEmergencyAlert(errorLog);
  } else {
    console.error('Error:', errorLog);
  }

  // Log to MongoDB for persistent storage
  // await logService.saveError(errorLog);
};

const sendErrorResponse = (error: AppError, req: Request, res: Response) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Base error response
  const errorResponse: any = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Add emergency context if present
  if (error.emergencyContext) {
    errorResponse.error.emergencyContext = {
      severity: error.emergencyContext.severity,
      hasLocationData: !!error.emergencyContext.location,
      userId: error.emergencyContext.userId ? 'present' : 'missing',
      emergencyId: error.emergencyContext.emergencyId ? 'present' : 'missing'
    };
  }

  // Add stack trace in development
  if (isDevelopment) {
    errorResponse.error.stack = error.stack;
    errorResponse.error.details = {
      isOperational: error.isOperational,
      emergencyContext: error.emergencyContext
    };
  }

  // Add request ID for tracking
  if (req.headers['x-request-id']) {
    errorResponse.error.requestId = req.headers['x-request-id'];
  }

  res.status(error.statusCode).json(errorResponse);
};

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Convert known errors to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = handleZodError(error);
  } else if (error instanceof PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else {
    // Unknown error
    appError = new AppError(
      process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
      500,
      false
    );
  }

  // Log the error
  logError(appError, req);

  // Send response
  sendErrorResponse(appError, req, res);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Emergency-specific error handlers
export const emergencyAsyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Wrap in emergency error context
      if (!(error instanceof AppError)) {
        error = new EmergencyError(
          error.message,
          req.user?.id,
          req.params.emergencyId,
          req.body.location
        );
      }
      next(error);
    });
  };
};

// Carrier integration error handler
export const carrierErrorHandler = (carrier: string) => {
  return (fn: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await fn(req, res, next);
      } catch (error: any) {
        const carrierError = new CarrierError(error.message, carrier);
        next(carrierError);
      }
    };
  };
};

// Rate limiting error
export const createRateLimitError = () => {
  return new AppError('Too many requests, please try again later', 429);
};

// Security errors
export const createSecurityError = (message: string) => {
  return new SecurityError(message);
};

// Emergency timeout error
export const createEmergencyTimeoutError = (userId: string) => {
  return new EmergencyError(
    'Emergency response timeout - manual intervention required',
    userId
  );
};

export default globalErrorHandler; 