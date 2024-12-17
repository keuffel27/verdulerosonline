/**
 * Valida un número de teléfono
 * @param phoneNumber Número de teléfono a validar
 * @returns boolean indicando si el número es válido
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Eliminar todos los caracteres no numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Verificar que el número tenga entre 10 y 15 dígitos
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    return false;
  }
  
  // Verificar que el número comience con un código de país válido
  // Por ahora solo aceptamos números que comiencen con +54 (Argentina)
  if (!cleanNumber.startsWith('54')) {
    return false;
  }
  
  return true;
}

/**
 * Formatea un número de teléfono al formato internacional
 * @param phoneNumber Número de teléfono a formatear
 * @returns Número de teléfono formateado
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Eliminar todos los caracteres no numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Asegurarse de que el número comience con el código de país
  if (!cleanNumber.startsWith('54')) {
    throw new Error('Invalid country code. Only Argentine numbers are supported.');
  }
  
  // Formatear el número al formato internacional
  return `+${cleanNumber}`;
}
