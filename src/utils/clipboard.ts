export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

export function formatStoreCredentials(credentials: {
  storeUrl: string;
  adminUrl: string;
  email: string;
  password: string;
}): string {
  return `
URL de la tienda: ${credentials.storeUrl}
URL del panel de administración: ${credentials.adminUrl}
Email: ${credentials.email}
Contraseña: ${credentials.password}
`.trim();
}