export const validation = {
  isValidDate: (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 255);
  },

  sanitizeObject: <T extends Record<string, any>>(obj: T): T => {
    const sanitized = { ...obj };
    Object.keys(sanitized).forEach((key) => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = validation.sanitizeInput(sanitized[key]);
      }
    });
    return sanitized;
  },
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateBookingForm = (
  date: string,
  time: string,
  paymentMethod: string,
  notes: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!date) {
    errors.push({ field: 'date', message: 'Data é obrigatória' });
  } else if (!validation.isValidDate(date)) {
    errors.push({ field: 'date', message: 'Selecione uma data futura' });
  }

  if (!time) {
    errors.push({ field: 'time', message: 'Horário é obrigatório' });
  }

  if (!paymentMethod) {
    errors.push({
      field: 'paymentMethod',
      message: 'Selecione um método de pagamento',
    });
  }

  if (notes && notes.length > 500) {
    errors.push({
      field: 'notes',
      message: 'Observações não podem ter mais de 500 caracteres',
    });
  }

  return errors;
};
