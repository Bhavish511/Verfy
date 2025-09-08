"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvitationCode = generateInvitationCode;
function generateInvitationCode(length = 4) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        code += alphabet[randomIndex];
    }
    return `verfy-${code}`;
}
//# sourceMappingURL=createGenerationCode.js.map