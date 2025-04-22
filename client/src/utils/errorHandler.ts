import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  errors?: { msg: string }[];
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse;
    
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => err.msg).join(', ');
    }
    
    if (data?.message) {
      return data.message;
    }
    
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const handleApiError = (error: unknown): void => {
  const errorMessage = getErrorMessage(error);
  console.error('API Error:', errorMessage);
  // You can add additional error handling logic here
  // For example, showing a toast notification
}; 