"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubMemberDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_sub_member_dto_1 = require("./create-sub-member.dto");
class UpdateSubMemberDto extends (0, mapped_types_1.PartialType)(create_sub_member_dto_1.CreateSubMemberDto) {
}
exports.UpdateSubMemberDto = UpdateSubMemberDto;
//# sourceMappingURL=update-sub-member.dto.js.map