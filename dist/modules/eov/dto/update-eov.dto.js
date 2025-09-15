"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEovDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_eov_dto_1 = require("./create-eov.dto");
class UpdateEovDto extends (0, mapped_types_1.PartialType)(create_eov_dto_1.CreateEovDto) {
}
exports.UpdateEovDto = UpdateEovDto;
//# sourceMappingURL=update-eov.dto.js.map