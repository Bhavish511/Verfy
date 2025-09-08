export function generateInvitationCode(length = 4): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randomIndex];
  }

  return `verfy-${code}`;
}
