import { UserVendorRoleStatus } from '@prisma/client';

// add-member.dto.ts
export class AddMemberDto {
  userID!: string;
  roleID!: string;
}

// update-member.dto.ts
export class UpdateMemberDto {
  roleID?: string;
  status?: UserVendorRoleStatus;
}
