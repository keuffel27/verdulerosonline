interface SendStoreCredentialsParams {
  ownerEmail: string;
  ownerPassword: string;
  storeName: string;
  storeUrl: string;
  panelUrl: string;
}

export async function sendStoreCredentials(params: SendStoreCredentialsParams) {
  // In a real application, this would send an email
  // For now, we'll just log it
  console.log('Sending store credentials email:', params);
}