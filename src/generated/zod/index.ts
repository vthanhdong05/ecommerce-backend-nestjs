import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);

export const UserScalarFieldEnumSchema = z.enum([
  'id',
  'email',
  'password',
  'firstName',
  'lastName',
  'fullAddress',
  'city',
  'province',
  'country',
  'phone',
  'status',
  'createdAt',
  'createdBy',
  'updatedAt',
  'deletedAt',
]);

export const VendorScalarFieldEnumSchema = z.enum([
  'id',
  'userID',
  'name',
  'slug',
  'description',
  'logoUrl',
  'taxCode',
  'totalProducts',
  'totalOrders',
  'status',
  'createdAt',
  'createdBy',
  'updatedAt',
  'deletedAt',
]);

export const RoleScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'description',
  'roleType',
  'createdAt',
  'createdBy',
  'updatedAt',
  'deletedAt',
]);

export const PermissionScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'description',
  'key',
  'isSystemPermission',
  'createdAt',
  'createdBy',
  'updatedAt',
  'deletedAt',
]);

export const RolePermissionScalarFieldEnumSchema = z.enum([
  'roleID',
  'permissionID',
  'createdAt',
  'createdBy',
]);

export const UserSystemRoleScalarFieldEnumSchema = z.enum([
  'id',
  'userID',
  'roleID',
  'status',
  'createdAt',
  'createdBy',
]);

export const UserVendorRoleScalarFieldEnumSchema = z.enum([
  'id',
  'userID',
  'vendorID',
  'roleID',
  'status',
  'createdAt',
  'createdBy',
]);

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const QueryModeSchema = z.enum(['default', 'insensitive']);

export const NullsOrderSchema = z.enum(['first', 'last']);

export const UserStatusSchema = z.enum(['active', 'inactive']);

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`;

export const VendorStatusSchema = z.enum(['active', 'inactive']);

export type VendorStatusType = `${z.infer<typeof VendorStatusSchema>}`;

export const RoleTypeSchema = z.enum(['SUPER_ADMIN', 'SYSTEM', 'VENDOR']);

export type RoleTypeType = `${z.infer<typeof RoleTypeSchema>}`;

export const UserSystemRoleStatusSchema = z.enum(['active', 'inactive']);

export type UserSystemRoleStatusType = `${z.infer<typeof UserSystemRoleStatusSchema>}`;

export const UserVendorRoleStatusSchema = z.enum(['active', 'inactive']);

export type UserVendorRoleStatusType = `${z.infer<typeof UserVendorRoleStatusSchema>}`;

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  status: UserStatusSchema,
  id: z.uuid(),
  email: z.string(),
  password: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullAddress: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// VENDOR SCHEMA
/////////////////////////////////////////

export const VendorSchema = z.object({
  status: VendorStatusSchema,
  id: z.uuid(),
  userID: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  taxCode: z.string().nullable(),
  totalProducts: z.number().int(),
  totalOrders: z.number().int(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type Vendor = z.infer<typeof VendorSchema>;

/////////////////////////////////////////
// ROLE SCHEMA
/////////////////////////////////////////

export const RoleSchema = z.object({
  roleType: RoleTypeSchema,
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type Role = z.infer<typeof RoleSchema>;

/////////////////////////////////////////
// PERMISSION SCHEMA
/////////////////////////////////////////

export const PermissionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  key: z.string(),
  isSystemPermission: z.boolean(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type Permission = z.infer<typeof PermissionSchema>;

/////////////////////////////////////////
// ROLE PERMISSION SCHEMA
/////////////////////////////////////////

export const RolePermissionSchema = z.object({
  roleID: z.string(),
  permissionID: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});

export type RolePermission = z.infer<typeof RolePermissionSchema>;

/////////////////////////////////////////
// USER SYSTEM ROLE SCHEMA
/////////////////////////////////////////

export const UserSystemRoleSchema = z.object({
  status: UserSystemRoleStatusSchema,
  id: z.uuid(),
  userID: z.string(),
  roleID: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});

export type UserSystemRole = z.infer<typeof UserSystemRoleSchema>;

/////////////////////////////////////////
// USER VENDOR ROLE SCHEMA
/////////////////////////////////////////

export const UserVendorRoleSchema = z.object({
  status: UserVendorRoleStatusSchema,
  id: z.uuid(),
  userID: z.string(),
  vendorID: z.string(),
  roleID: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});

export type UserVendorRole = z.infer<typeof UserVendorRoleSchema>;

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z
  .object({
    vendors: z.union([z.boolean(), z.lazy(() => VendorFindManyArgsSchema)]).optional(),
    userSystemRoles: z
      .union([z.boolean(), z.lazy(() => UserSystemRoleFindManyArgsSchema)])
      .optional(),
    userVendorRoles: z
      .union([z.boolean(), z.lazy(() => UserVendorRoleFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z
  .object({
    select: z.lazy(() => UserSelectSchema).optional(),
    include: z.lazy(() => UserIncludeSchema).optional(),
  })
  .strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z
  .object({
    vendors: z.boolean().optional(),
    userSystemRoles: z.boolean().optional(),
    userVendorRoles: z.boolean().optional(),
  })
  .strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z
  .object({
    id: z.boolean().optional(),
    email: z.boolean().optional(),
    password: z.boolean().optional(),
    firstName: z.boolean().optional(),
    lastName: z.boolean().optional(),
    fullAddress: z.boolean().optional(),
    city: z.boolean().optional(),
    province: z.boolean().optional(),
    country: z.boolean().optional(),
    phone: z.boolean().optional(),
    status: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    vendors: z.union([z.boolean(), z.lazy(() => VendorFindManyArgsSchema)]).optional(),
    userSystemRoles: z
      .union([z.boolean(), z.lazy(() => UserSystemRoleFindManyArgsSchema)])
      .optional(),
    userVendorRoles: z
      .union([z.boolean(), z.lazy(() => UserVendorRoleFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// VENDOR
//------------------------------------------------------

export const VendorIncludeSchema: z.ZodType<Prisma.VendorInclude> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    userVendorRoles: z
      .union([z.boolean(), z.lazy(() => UserVendorRoleFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => VendorCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const VendorArgsSchema: z.ZodType<Prisma.VendorDefaultArgs> = z
  .object({
    select: z.lazy(() => VendorSelectSchema).optional(),
    include: z.lazy(() => VendorIncludeSchema).optional(),
  })
  .strict();

export const VendorCountOutputTypeArgsSchema: z.ZodType<Prisma.VendorCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => VendorCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export const VendorCountOutputTypeSelectSchema: z.ZodType<Prisma.VendorCountOutputTypeSelect> = z
  .object({
    userVendorRoles: z.boolean().optional(),
  })
  .strict();

export const VendorSelectSchema: z.ZodType<Prisma.VendorSelect> = z
  .object({
    id: z.boolean().optional(),
    userID: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    description: z.boolean().optional(),
    logoUrl: z.boolean().optional(),
    taxCode: z.boolean().optional(),
    totalProducts: z.boolean().optional(),
    totalOrders: z.boolean().optional(),
    status: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    userVendorRoles: z
      .union([z.boolean(), z.lazy(() => UserVendorRoleFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => VendorCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// ROLE
//------------------------------------------------------

export const RoleIncludeSchema: z.ZodType<Prisma.RoleInclude> = z
  .object({
    userSystemRoles: z
      .union([z.boolean(), z.lazy(() => UserSystemRoleFindManyArgsSchema)])
      .optional(),
    userVendorRoles: z
      .union([z.boolean(), z.lazy(() => UserVendorRoleFindManyArgsSchema)])
      .optional(),
    rolePermissions: z
      .union([z.boolean(), z.lazy(() => RolePermissionFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => RoleCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const RoleArgsSchema: z.ZodType<Prisma.RoleDefaultArgs> = z
  .object({
    select: z.lazy(() => RoleSelectSchema).optional(),
    include: z.lazy(() => RoleIncludeSchema).optional(),
  })
  .strict();

export const RoleCountOutputTypeArgsSchema: z.ZodType<Prisma.RoleCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => RoleCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export const RoleCountOutputTypeSelectSchema: z.ZodType<Prisma.RoleCountOutputTypeSelect> = z
  .object({
    userSystemRoles: z.boolean().optional(),
    userVendorRoles: z.boolean().optional(),
    rolePermissions: z.boolean().optional(),
  })
  .strict();

export const RoleSelectSchema: z.ZodType<Prisma.RoleSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    description: z.boolean().optional(),
    roleType: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    userSystemRoles: z
      .union([z.boolean(), z.lazy(() => UserSystemRoleFindManyArgsSchema)])
      .optional(),
    userVendorRoles: z
      .union([z.boolean(), z.lazy(() => UserVendorRoleFindManyArgsSchema)])
      .optional(),
    rolePermissions: z
      .union([z.boolean(), z.lazy(() => RolePermissionFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => RoleCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// PERMISSION
//------------------------------------------------------

export const PermissionIncludeSchema: z.ZodType<Prisma.PermissionInclude> = z
  .object({
    rolePermissions: z
      .union([z.boolean(), z.lazy(() => RolePermissionFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => PermissionCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const PermissionArgsSchema: z.ZodType<Prisma.PermissionDefaultArgs> = z
  .object({
    select: z.lazy(() => PermissionSelectSchema).optional(),
    include: z.lazy(() => PermissionIncludeSchema).optional(),
  })
  .strict();

export const PermissionCountOutputTypeArgsSchema: z.ZodType<Prisma.PermissionCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => PermissionCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export const PermissionCountOutputTypeSelectSchema: z.ZodType<Prisma.PermissionCountOutputTypeSelect> =
  z
    .object({
      rolePermissions: z.boolean().optional(),
    })
    .strict();

export const PermissionSelectSchema: z.ZodType<Prisma.PermissionSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    description: z.boolean().optional(),
    key: z.boolean().optional(),
    isSystemPermission: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    rolePermissions: z
      .union([z.boolean(), z.lazy(() => RolePermissionFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => PermissionCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// ROLE PERMISSION
//------------------------------------------------------

export const RolePermissionIncludeSchema: z.ZodType<Prisma.RolePermissionInclude> = z
  .object({
    role: z.union([z.boolean(), z.lazy(() => RoleArgsSchema)]).optional(),
    permission: z.union([z.boolean(), z.lazy(() => PermissionArgsSchema)]).optional(),
  })
  .strict();

export const RolePermissionArgsSchema: z.ZodType<Prisma.RolePermissionDefaultArgs> = z
  .object({
    select: z.lazy(() => RolePermissionSelectSchema).optional(),
    include: z.lazy(() => RolePermissionIncludeSchema).optional(),
  })
  .strict();

export const RolePermissionSelectSchema: z.ZodType<Prisma.RolePermissionSelect> = z
  .object({
    roleID: z.boolean().optional(),
    permissionID: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    role: z.union([z.boolean(), z.lazy(() => RoleArgsSchema)]).optional(),
    permission: z.union([z.boolean(), z.lazy(() => PermissionArgsSchema)]).optional(),
  })
  .strict();

// USER SYSTEM ROLE
//------------------------------------------------------

export const UserSystemRoleIncludeSchema: z.ZodType<Prisma.UserSystemRoleInclude> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    role: z.union([z.boolean(), z.lazy(() => RoleArgsSchema)]).optional(),
  })
  .strict();

export const UserSystemRoleArgsSchema: z.ZodType<Prisma.UserSystemRoleDefaultArgs> = z
  .object({
    select: z.lazy(() => UserSystemRoleSelectSchema).optional(),
    include: z.lazy(() => UserSystemRoleIncludeSchema).optional(),
  })
  .strict();

export const UserSystemRoleSelectSchema: z.ZodType<Prisma.UserSystemRoleSelect> = z
  .object({
    id: z.boolean().optional(),
    userID: z.boolean().optional(),
    roleID: z.boolean().optional(),
    status: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    role: z.union([z.boolean(), z.lazy(() => RoleArgsSchema)]).optional(),
  })
  .strict();

// USER VENDOR ROLE
//------------------------------------------------------

export const UserVendorRoleIncludeSchema: z.ZodType<Prisma.UserVendorRoleInclude> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    role: z.union([z.boolean(), z.lazy(() => RoleArgsSchema)]).optional(),
  })
  .strict();

export const UserVendorRoleArgsSchema: z.ZodType<Prisma.UserVendorRoleDefaultArgs> = z
  .object({
    select: z.lazy(() => UserVendorRoleSelectSchema).optional(),
    include: z.lazy(() => UserVendorRoleIncludeSchema).optional(),
  })
  .strict();

export const UserVendorRoleSelectSchema: z.ZodType<Prisma.UserVendorRoleSelect> = z
  .object({
    id: z.boolean().optional(),
    userID: z.boolean().optional(),
    vendorID: z.boolean().optional(),
    roleID: z.boolean().optional(),
    status: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    vendor: z.union([z.boolean(), z.lazy(() => VendorArgsSchema)]).optional(),
    role: z.union([z.boolean(), z.lazy(() => RoleArgsSchema)]).optional(),
  })
  .strict();

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => UserWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  email: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  password: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  firstName: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  lastName: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  fullAddress: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  city: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  province: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  country: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  phone: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  status: z
    .union([z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema)])
    .optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  createdBy: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  deletedAt: z
    .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
    .optional()
    .nullable(),
  vendors: z.lazy(() => VendorListRelationFilterSchema).optional(),
  userSystemRoles: z.lazy(() => UserSystemRoleListRelationFilterSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    email: z.lazy(() => SortOrderSchema).optional(),
    password: z.lazy(() => SortOrderSchema).optional(),
    firstName: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    lastName: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    fullAddress: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    city: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    province: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    country: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    phone: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    vendors: z.lazy(() => VendorOrderByRelationAggregateInputSchema).optional(),
    userSystemRoles: z.lazy(() => UserSystemRoleOrderByRelationAggregateInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleOrderByRelationAggregateInputSchema).optional(),
  });

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z
  .union([
    z.object({
      id: z.uuid(),
      email: z.string(),
    }),
    z.object({
      id: z.uuid(),
    }),
    z.object({
      email: z.string(),
    }),
  ])
  .and(
    z.strictObject({
      id: z.uuid().optional(),
      email: z.string().optional(),
      AND: z
        .union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
        .optional(),
      OR: z
        .lazy(() => UserWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
        .optional(),
      password: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      firstName: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      lastName: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      fullAddress: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      city: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      province: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      country: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      phone: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      status: z
        .union([z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema)])
        .optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      createdBy: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      vendors: z.lazy(() => VendorListRelationFilterSchema).optional(),
      userSystemRoles: z.lazy(() => UserSystemRoleListRelationFilterSchema).optional(),
      userVendorRoles: z.lazy(() => UserVendorRoleListRelationFilterSchema).optional(),
    }),
  );

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    email: z.lazy(() => SortOrderSchema).optional(),
    password: z.lazy(() => SortOrderSchema).optional(),
    firstName: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    lastName: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    fullAddress: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    city: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    province: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    country: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    phone: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  });

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    email: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    password: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    firstName: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    lastName: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    city: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    province: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    country: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    phone: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => EnumUserStatusWithAggregatesFilterSchema),
        z.lazy(() => UserStatusSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  });

export const VendorWhereInputSchema: z.ZodType<Prisma.VendorWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => VendorWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  description: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  logoUrl: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  taxCode: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  totalProducts: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  totalOrders: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
  status: z
    .union([z.lazy(() => EnumVendorStatusFilterSchema), z.lazy(() => VendorStatusSchema)])
    .optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  createdBy: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  deletedAt: z
    .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
    .optional()
    .nullable(),
  user: z
    .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
    .optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleListRelationFilterSchema).optional(),
});

export const VendorOrderByWithRelationInputSchema: z.ZodType<Prisma.VendorOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    slug: z.lazy(() => SortOrderSchema).optional(),
    description: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    logoUrl: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    taxCode: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleOrderByRelationAggregateInputSchema).optional(),
  });

export const VendorWhereUniqueInputSchema: z.ZodType<Prisma.VendorWhereUniqueInput> = z
  .union([
    z.object({
      id: z.uuid(),
      slug: z.string(),
    }),
    z.object({
      id: z.uuid(),
    }),
    z.object({
      slug: z.string(),
    }),
  ])
  .and(
    z.strictObject({
      id: z.uuid().optional(),
      slug: z.string().optional(),
      AND: z
        .union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()])
        .optional(),
      OR: z
        .lazy(() => VendorWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([z.lazy(() => VendorWhereInputSchema), z.lazy(() => VendorWhereInputSchema).array()])
        .optional(),
      userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      description: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      logoUrl: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      taxCode: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      totalProducts: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
      totalOrders: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
      status: z
        .union([z.lazy(() => EnumVendorStatusFilterSchema), z.lazy(() => VendorStatusSchema)])
        .optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      createdBy: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      user: z
        .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
        .optional(),
      userVendorRoles: z.lazy(() => UserVendorRoleListRelationFilterSchema).optional(),
    }),
  );

export const VendorOrderByWithAggregationInputSchema: z.ZodType<Prisma.VendorOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    slug: z.lazy(() => SortOrderSchema).optional(),
    description: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    logoUrl: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    taxCode: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => VendorCountOrderByAggregateInputSchema).optional(),
    _avg: z.lazy(() => VendorAvgOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => VendorMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => VendorMinOrderByAggregateInputSchema).optional(),
    _sum: z.lazy(() => VendorSumOrderByAggregateInputSchema).optional(),
  });

export const VendorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VendorScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => VendorScalarWhereWithAggregatesInputSchema),
        z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => VendorScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => VendorScalarWhereWithAggregatesInputSchema),
        z.lazy(() => VendorScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    description: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    totalProducts: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    totalOrders: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumVendorStatusWithAggregatesFilterSchema),
        z.lazy(() => VendorStatusSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  });

export const RoleWhereInputSchema: z.ZodType<Prisma.RoleWhereInput> = z.strictObject({
  AND: z
    .union([z.lazy(() => RoleWhereInputSchema), z.lazy(() => RoleWhereInputSchema).array()])
    .optional(),
  OR: z
    .lazy(() => RoleWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([z.lazy(() => RoleWhereInputSchema), z.lazy(() => RoleWhereInputSchema).array()])
    .optional(),
  id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  description: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  roleType: z
    .union([z.lazy(() => EnumRoleTypeFilterSchema), z.lazy(() => RoleTypeSchema)])
    .optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  createdBy: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  deletedAt: z
    .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
    .optional()
    .nullable(),
  userSystemRoles: z.lazy(() => UserSystemRoleListRelationFilterSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleListRelationFilterSchema).optional(),
  rolePermissions: z.lazy(() => RolePermissionListRelationFilterSchema).optional(),
});

export const RoleOrderByWithRelationInputSchema: z.ZodType<Prisma.RoleOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    roleType: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    userSystemRoles: z.lazy(() => UserSystemRoleOrderByRelationAggregateInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleOrderByRelationAggregateInputSchema).optional(),
    rolePermissions: z.lazy(() => RolePermissionOrderByRelationAggregateInputSchema).optional(),
  });

export const RoleWhereUniqueInputSchema: z.ZodType<Prisma.RoleWhereUniqueInput> = z
  .union([
    z.object({
      id: z.uuid(),
      name: z.string(),
    }),
    z.object({
      id: z.uuid(),
    }),
    z.object({
      name: z.string(),
    }),
  ])
  .and(
    z.strictObject({
      id: z.uuid().optional(),
      name: z.string().optional(),
      AND: z
        .union([z.lazy(() => RoleWhereInputSchema), z.lazy(() => RoleWhereInputSchema).array()])
        .optional(),
      OR: z
        .lazy(() => RoleWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([z.lazy(() => RoleWhereInputSchema), z.lazy(() => RoleWhereInputSchema).array()])
        .optional(),
      description: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      roleType: z
        .union([z.lazy(() => EnumRoleTypeFilterSchema), z.lazy(() => RoleTypeSchema)])
        .optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      createdBy: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      userSystemRoles: z.lazy(() => UserSystemRoleListRelationFilterSchema).optional(),
      userVendorRoles: z.lazy(() => UserVendorRoleListRelationFilterSchema).optional(),
      rolePermissions: z.lazy(() => RolePermissionListRelationFilterSchema).optional(),
    }),
  );

export const RoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.RoleOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    roleType: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => RoleCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => RoleMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => RoleMinOrderByAggregateInputSchema).optional(),
  });

export const RoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RoleScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => RoleScalarWhereWithAggregatesInputSchema),
        z.lazy(() => RoleScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => RoleScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => RoleScalarWhereWithAggregatesInputSchema),
        z.lazy(() => RoleScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    description: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    roleType: z
      .union([z.lazy(() => EnumRoleTypeWithAggregatesFilterSchema), z.lazy(() => RoleTypeSchema)])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  });

export const PermissionWhereInputSchema: z.ZodType<Prisma.PermissionWhereInput> = z.strictObject({
  AND: z
    .union([
      z.lazy(() => PermissionWhereInputSchema),
      z.lazy(() => PermissionWhereInputSchema).array(),
    ])
    .optional(),
  OR: z
    .lazy(() => PermissionWhereInputSchema)
    .array()
    .optional(),
  NOT: z
    .union([
      z.lazy(() => PermissionWhereInputSchema),
      z.lazy(() => PermissionWhereInputSchema).array(),
    ])
    .optional(),
  id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  description: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  key: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  isSystemPermission: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  createdBy: z
    .union([z.lazy(() => StringNullableFilterSchema), z.string()])
    .optional()
    .nullable(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  deletedAt: z
    .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
    .optional()
    .nullable(),
  rolePermissions: z.lazy(() => RolePermissionListRelationFilterSchema).optional(),
});

export const PermissionOrderByWithRelationInputSchema: z.ZodType<Prisma.PermissionOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    key: z.lazy(() => SortOrderSchema).optional(),
    isSystemPermission: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    rolePermissions: z.lazy(() => RolePermissionOrderByRelationAggregateInputSchema).optional(),
  });

export const PermissionWhereUniqueInputSchema: z.ZodType<Prisma.PermissionWhereUniqueInput> = z
  .union([
    z.object({
      id: z.uuid(),
      name_key: z.lazy(() => PermissionNameKeyCompoundUniqueInputSchema),
    }),
    z.object({
      id: z.uuid(),
    }),
    z.object({
      name_key: z.lazy(() => PermissionNameKeyCompoundUniqueInputSchema),
    }),
  ])
  .and(
    z.strictObject({
      id: z.uuid().optional(),
      name_key: z.lazy(() => PermissionNameKeyCompoundUniqueInputSchema).optional(),
      AND: z
        .union([
          z.lazy(() => PermissionWhereInputSchema),
          z.lazy(() => PermissionWhereInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => PermissionWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => PermissionWhereInputSchema),
          z.lazy(() => PermissionWhereInputSchema).array(),
        ])
        .optional(),
      name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      description: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      key: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      isSystemPermission: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      createdBy: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      rolePermissions: z.lazy(() => RolePermissionListRelationFilterSchema).optional(),
    }),
  );

export const PermissionOrderByWithAggregationInputSchema: z.ZodType<Prisma.PermissionOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    key: z.lazy(() => SortOrderSchema).optional(),
    isSystemPermission: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => PermissionCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => PermissionMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => PermissionMinOrderByAggregateInputSchema).optional(),
  });

export const PermissionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PermissionScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => PermissionScalarWhereWithAggregatesInputSchema),
        z.lazy(() => PermissionScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PermissionScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PermissionScalarWhereWithAggregatesInputSchema),
        z.lazy(() => PermissionScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    description: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    key: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    isSystemPermission: z
      .union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  });

export const RolePermissionWhereInputSchema: z.ZodType<Prisma.RolePermissionWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => RolePermissionWhereInputSchema),
        z.lazy(() => RolePermissionWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => RolePermissionWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => RolePermissionWhereInputSchema),
        z.lazy(() => RolePermissionWhereInputSchema).array(),
      ])
      .optional(),
    roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    permissionID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    role: z
      .union([z.lazy(() => RoleScalarRelationFilterSchema), z.lazy(() => RoleWhereInputSchema)])
      .optional(),
    permission: z
      .union([
        z.lazy(() => PermissionScalarRelationFilterSchema),
        z.lazy(() => PermissionWhereInputSchema),
      ])
      .optional(),
  });

export const RolePermissionOrderByWithRelationInputSchema: z.ZodType<Prisma.RolePermissionOrderByWithRelationInput> =
  z.strictObject({
    roleID: z.lazy(() => SortOrderSchema).optional(),
    permissionID: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    role: z.lazy(() => RoleOrderByWithRelationInputSchema).optional(),
    permission: z.lazy(() => PermissionOrderByWithRelationInputSchema).optional(),
  });

export const RolePermissionWhereUniqueInputSchema: z.ZodType<Prisma.RolePermissionWhereUniqueInput> =
  z
    .object({
      roleID_permissionID: z.lazy(() => RolePermissionRoleIDPermissionIDCompoundUniqueInputSchema),
    })
    .and(
      z.strictObject({
        roleID_permissionID: z
          .lazy(() => RolePermissionRoleIDPermissionIDCompoundUniqueInputSchema)
          .optional(),
        AND: z
          .union([
            z.lazy(() => RolePermissionWhereInputSchema),
            z.lazy(() => RolePermissionWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => RolePermissionWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => RolePermissionWhereInputSchema),
            z.lazy(() => RolePermissionWhereInputSchema).array(),
          ])
          .optional(),
        roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        permissionID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        createdBy: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        role: z
          .union([z.lazy(() => RoleScalarRelationFilterSchema), z.lazy(() => RoleWhereInputSchema)])
          .optional(),
        permission: z
          .union([
            z.lazy(() => PermissionScalarRelationFilterSchema),
            z.lazy(() => PermissionWhereInputSchema),
          ])
          .optional(),
      }),
    );

export const RolePermissionOrderByWithAggregationInputSchema: z.ZodType<Prisma.RolePermissionOrderByWithAggregationInput> =
  z.strictObject({
    roleID: z.lazy(() => SortOrderSchema).optional(),
    permissionID: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => RolePermissionCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => RolePermissionMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => RolePermissionMinOrderByAggregateInputSchema).optional(),
  });

export const RolePermissionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RolePermissionScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => RolePermissionScalarWhereWithAggregatesInputSchema),
        z.lazy(() => RolePermissionScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => RolePermissionScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => RolePermissionScalarWhereWithAggregatesInputSchema),
        z.lazy(() => RolePermissionScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    roleID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    permissionID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const UserSystemRoleWhereInputSchema: z.ZodType<Prisma.UserSystemRoleWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserSystemRoleWhereInputSchema),
        z.lazy(() => UserSystemRoleWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserSystemRoleWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserSystemRoleWhereInputSchema),
        z.lazy(() => UserSystemRoleWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumUserSystemRoleStatusFilterSchema),
        z.lazy(() => UserSystemRoleStatusSchema),
      ])
      .optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    user: z
      .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
      .optional(),
    role: z
      .union([z.lazy(() => RoleScalarRelationFilterSchema), z.lazy(() => RoleWhereInputSchema)])
      .optional(),
  });

export const UserSystemRoleOrderByWithRelationInputSchema: z.ZodType<Prisma.UserSystemRoleOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    role: z.lazy(() => RoleOrderByWithRelationInputSchema).optional(),
  });

export const UserSystemRoleWhereUniqueInputSchema: z.ZodType<Prisma.UserSystemRoleWhereUniqueInput> =
  z
    .union([
      z.object({
        id: z.uuid(),
        userID_roleID: z.lazy(() => UserSystemRoleUserIDRoleIDCompoundUniqueInputSchema),
      }),
      z.object({
        id: z.uuid(),
      }),
      z.object({
        userID_roleID: z.lazy(() => UserSystemRoleUserIDRoleIDCompoundUniqueInputSchema),
      }),
    ])
    .and(
      z.strictObject({
        id: z.uuid().optional(),
        userID_roleID: z.lazy(() => UserSystemRoleUserIDRoleIDCompoundUniqueInputSchema).optional(),
        AND: z
          .union([
            z.lazy(() => UserSystemRoleWhereInputSchema),
            z.lazy(() => UserSystemRoleWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => UserSystemRoleWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => UserSystemRoleWhereInputSchema),
            z.lazy(() => UserSystemRoleWhereInputSchema).array(),
          ])
          .optional(),
        userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        status: z
          .union([
            z.lazy(() => EnumUserSystemRoleStatusFilterSchema),
            z.lazy(() => UserSystemRoleStatusSchema),
          ])
          .optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        createdBy: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        user: z
          .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
          .optional(),
        role: z
          .union([z.lazy(() => RoleScalarRelationFilterSchema), z.lazy(() => RoleWhereInputSchema)])
          .optional(),
      }),
    );

export const UserSystemRoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserSystemRoleOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => UserSystemRoleCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => UserSystemRoleMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => UserSystemRoleMinOrderByAggregateInputSchema).optional(),
  });

export const UserSystemRoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserSystemRoleScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserSystemRoleScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    roleID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumUserSystemRoleStatusWithAggregatesFilterSchema),
        z.lazy(() => UserSystemRoleStatusSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const UserVendorRoleWhereInputSchema: z.ZodType<Prisma.UserVendorRoleWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserVendorRoleWhereInputSchema),
        z.lazy(() => UserVendorRoleWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserVendorRoleWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserVendorRoleWhereInputSchema),
        z.lazy(() => UserVendorRoleWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumUserVendorRoleStatusFilterSchema),
        z.lazy(() => UserVendorRoleStatusSchema),
      ])
      .optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    user: z
      .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
      .optional(),
    vendor: z
      .union([z.lazy(() => VendorScalarRelationFilterSchema), z.lazy(() => VendorWhereInputSchema)])
      .optional(),
    role: z
      .union([z.lazy(() => RoleScalarRelationFilterSchema), z.lazy(() => RoleWhereInputSchema)])
      .optional(),
  });

export const UserVendorRoleOrderByWithRelationInputSchema: z.ZodType<Prisma.UserVendorRoleOrderByWithRelationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    vendorID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    vendor: z.lazy(() => VendorOrderByWithRelationInputSchema).optional(),
    role: z.lazy(() => RoleOrderByWithRelationInputSchema).optional(),
  });

export const UserVendorRoleWhereUniqueInputSchema: z.ZodType<Prisma.UserVendorRoleWhereUniqueInput> =
  z
    .union([
      z.object({
        id: z.uuid(),
        userID_vendorID: z.lazy(() => UserVendorRoleUserIDVendorIDCompoundUniqueInputSchema),
      }),
      z.object({
        id: z.uuid(),
      }),
      z.object({
        userID_vendorID: z.lazy(() => UserVendorRoleUserIDVendorIDCompoundUniqueInputSchema),
      }),
    ])
    .and(
      z.strictObject({
        id: z.uuid().optional(),
        userID_vendorID: z
          .lazy(() => UserVendorRoleUserIDVendorIDCompoundUniqueInputSchema)
          .optional(),
        AND: z
          .union([
            z.lazy(() => UserVendorRoleWhereInputSchema),
            z.lazy(() => UserVendorRoleWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => UserVendorRoleWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => UserVendorRoleWhereInputSchema),
            z.lazy(() => UserVendorRoleWhereInputSchema).array(),
          ])
          .optional(),
        userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        vendorID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        status: z
          .union([
            z.lazy(() => EnumUserVendorRoleStatusFilterSchema),
            z.lazy(() => UserVendorRoleStatusSchema),
          ])
          .optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        createdBy: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        user: z
          .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
          .optional(),
        vendor: z
          .union([
            z.lazy(() => VendorScalarRelationFilterSchema),
            z.lazy(() => VendorWhereInputSchema),
          ])
          .optional(),
        role: z
          .union([z.lazy(() => RoleScalarRelationFilterSchema), z.lazy(() => RoleWhereInputSchema)])
          .optional(),
      }),
    );

export const UserVendorRoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserVendorRoleOrderByWithAggregationInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    vendorID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    _count: z.lazy(() => UserVendorRoleCountOrderByAggregateInputSchema).optional(),
    _max: z.lazy(() => UserVendorRoleMaxOrderByAggregateInputSchema).optional(),
    _min: z.lazy(() => UserVendorRoleMinOrderByAggregateInputSchema).optional(),
  });

export const UserVendorRoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserVendorRoleScalarWhereWithAggregatesInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserVendorRoleScalarWhereWithAggregatesInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereWithAggregatesInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereWithAggregatesInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    vendorID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    roleID: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumUserVendorRoleStatusWithAggregatesFilterSchema),
        z.lazy(() => UserVendorRoleStatusSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  fullAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  vendors: z.lazy(() => VendorCreateNestedManyWithoutUserInputSchema).optional(),
  userSystemRoles: z.lazy(() => UserSystemRoleCreateNestedManyWithoutUserInputSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    vendors: z.lazy(() => VendorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedCreateNestedManyWithoutUserInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutUserInputSchema)
      .optional(),
  });

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  password: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  firstName: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  lastName: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  fullAddress: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  city: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  province: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  country: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  phone: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  status: z
    .union([
      z.lazy(() => UserStatusSchema),
      z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  createdAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  createdBy: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  updatedAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  deletedAt: z
    .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  vendors: z.lazy(() => VendorUpdateManyWithoutUserNestedInputSchema).optional(),
  userSystemRoles: z.lazy(() => UserSystemRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    vendors: z.lazy(() => VendorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedUpdateManyWithoutUserNestedInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutUserNestedInputSchema)
      .optional(),
  });

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  fullAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const VendorCreateInputSchema: z.ZodType<Prisma.VendorCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  taxCode: z.string().optional().nullable(),
  totalProducts: z.number().int().optional(),
  totalOrders: z.number().int().optional(),
  status: z.lazy(() => VendorStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutVendorsInputSchema),
  userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const VendorUncheckedCreateInputSchema: z.ZodType<Prisma.VendorUncheckedCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    totalProducts: z.number().int().optional(),
    totalOrders: z.number().int().optional(),
    status: z.lazy(() => VendorStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutVendorInputSchema)
      .optional(),
  });

export const VendorUpdateInputSchema: z.ZodType<Prisma.VendorUpdateInput> = z.strictObject({
  id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  description: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  logoUrl: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  taxCode: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  totalProducts: z
    .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
    .optional(),
  totalOrders: z
    .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
    .optional(),
  status: z
    .union([
      z.lazy(() => VendorStatusSchema),
      z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  createdAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  createdBy: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  updatedAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  deletedAt: z
    .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVendorsNestedInputSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VendorUncheckedUpdateInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutVendorNestedInputSchema)
      .optional(),
  });

export const VendorCreateManyInputSchema: z.ZodType<Prisma.VendorCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userID: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  taxCode: z.string().optional().nullable(),
  totalProducts: z.number().int().optional(),
  totalOrders: z.number().int().optional(),
  status: z.lazy(() => VendorStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const VendorUpdateManyMutationInputSchema: z.ZodType<Prisma.VendorUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const VendorUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RoleCreateInputSchema: z.ZodType<Prisma.RoleCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  roleType: z.lazy(() => RoleTypeSchema).optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  userSystemRoles: z.lazy(() => UserSystemRoleCreateNestedManyWithoutRoleInputSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutRoleInputSchema).optional(),
  rolePermissions: z.lazy(() => RolePermissionCreateNestedManyWithoutRoleInputSchema).optional(),
});

export const RoleUncheckedCreateInputSchema: z.ZodType<Prisma.RoleUncheckedCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
  });

export const RoleUpdateInputSchema: z.ZodType<Prisma.RoleUpdateInput> = z.strictObject({
  id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  description: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  roleType: z
    .union([
      z.lazy(() => RoleTypeSchema),
      z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
    ])
    .optional(),
  createdAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  createdBy: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  updatedAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  deletedAt: z
    .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  userSystemRoles: z.lazy(() => UserSystemRoleUpdateManyWithoutRoleNestedInputSchema).optional(),
  userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutRoleNestedInputSchema).optional(),
  rolePermissions: z.lazy(() => RolePermissionUpdateManyWithoutRoleNestedInputSchema).optional(),
});

export const RoleUncheckedUpdateInputSchema: z.ZodType<Prisma.RoleUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
  });

export const RoleCreateManyInputSchema: z.ZodType<Prisma.RoleCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  roleType: z.lazy(() => RoleTypeSchema).optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const RoleUpdateManyMutationInputSchema: z.ZodType<Prisma.RoleUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.RoleUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const PermissionCreateInputSchema: z.ZodType<Prisma.PermissionCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  key: z.string(),
  isSystemPermission: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  rolePermissions: z
    .lazy(() => RolePermissionCreateNestedManyWithoutPermissionInputSchema)
    .optional(),
});

export const PermissionUncheckedCreateInputSchema: z.ZodType<Prisma.PermissionUncheckedCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    key: z.string(),
    isSystemPermission: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedCreateNestedManyWithoutPermissionInputSchema)
      .optional(),
  });

export const PermissionUpdateInputSchema: z.ZodType<Prisma.PermissionUpdateInput> = z.strictObject({
  id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  description: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  isSystemPermission: z
    .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
    .optional(),
  createdAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  createdBy: z
    .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  updatedAt: z
    .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
    .optional(),
  deletedAt: z
    .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
    .optional()
    .nullable(),
  rolePermissions: z
    .lazy(() => RolePermissionUpdateManyWithoutPermissionNestedInputSchema)
    .optional(),
});

export const PermissionUncheckedUpdateInputSchema: z.ZodType<Prisma.PermissionUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    isSystemPermission: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedUpdateManyWithoutPermissionNestedInputSchema)
      .optional(),
  });

export const PermissionCreateManyInputSchema: z.ZodType<Prisma.PermissionCreateManyInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    key: z.string(),
    isSystemPermission: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
  });

export const PermissionUpdateManyMutationInputSchema: z.ZodType<Prisma.PermissionUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    isSystemPermission: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const PermissionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PermissionUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    isSystemPermission: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionCreateInputSchema: z.ZodType<Prisma.RolePermissionCreateInput> =
  z.strictObject({
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    role: z.lazy(() => RoleCreateNestedOneWithoutRolePermissionsInputSchema),
    permission: z.lazy(() => PermissionCreateNestedOneWithoutRolePermissionsInputSchema),
  });

export const RolePermissionUncheckedCreateInputSchema: z.ZodType<Prisma.RolePermissionUncheckedCreateInput> =
  z.strictObject({
    roleID: z.string(),
    permissionID: z.string(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const RolePermissionUpdateInputSchema: z.ZodType<Prisma.RolePermissionUpdateInput> =
  z.strictObject({
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutRolePermissionsNestedInputSchema).optional(),
    permission: z
      .lazy(() => PermissionUpdateOneRequiredWithoutRolePermissionsNestedInputSchema)
      .optional(),
  });

export const RolePermissionUncheckedUpdateInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateInput> =
  z.strictObject({
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    permissionID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionCreateManyInputSchema: z.ZodType<Prisma.RolePermissionCreateManyInput> =
  z.strictObject({
    roleID: z.string(),
    permissionID: z.string(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const RolePermissionUpdateManyMutationInputSchema: z.ZodType<Prisma.RolePermissionUpdateManyMutationInput> =
  z.strictObject({
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateManyInput> =
  z.strictObject({
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    permissionID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleCreateInputSchema: z.ZodType<Prisma.UserSystemRoleCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutUserSystemRolesInputSchema),
    role: z.lazy(() => RoleCreateNestedOneWithoutUserSystemRolesInputSchema),
  });

export const UserSystemRoleUncheckedCreateInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserSystemRoleUpdateInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutUserSystemRolesNestedInputSchema).optional(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutUserSystemRolesNestedInputSchema).optional(),
  });

export const UserSystemRoleUncheckedUpdateInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleCreateManyInputSchema: z.ZodType<Prisma.UserSystemRoleCreateManyInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserSystemRoleUpdateManyMutationInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleCreateInputSchema: z.ZodType<Prisma.UserVendorRoleCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutUserVendorRolesInputSchema),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutUserVendorRolesInputSchema),
    role: z.lazy(() => RoleCreateNestedOneWithoutUserVendorRolesInputSchema),
  });

export const UserVendorRoleUncheckedCreateInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    vendorID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleUpdateInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
  });

export const UserVendorRoleUncheckedUpdateInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleCreateManyInputSchema: z.ZodType<Prisma.UserVendorRoleCreateManyInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    vendorID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleUpdateManyMutationInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyMutationInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
});

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z
    .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
    .optional()
    .nullable(),
});

export const EnumUserStatusFilterSchema: z.ZodType<Prisma.EnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z
    .lazy(() => UserStatusSchema)
    .array()
    .optional(),
  notIn: z
    .lazy(() => UserStatusSchema)
    .array()
    .optional(),
  not: z
    .union([z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema)])
    .optional(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
});

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)])
      .optional()
      .nullable(),
  });

export const VendorListRelationFilterSchema: z.ZodType<Prisma.VendorListRelationFilter> =
  z.strictObject({
    every: z.lazy(() => VendorWhereInputSchema).optional(),
    some: z.lazy(() => VendorWhereInputSchema).optional(),
    none: z.lazy(() => VendorWhereInputSchema).optional(),
  });

export const UserSystemRoleListRelationFilterSchema: z.ZodType<Prisma.UserSystemRoleListRelationFilter> =
  z.strictObject({
    every: z.lazy(() => UserSystemRoleWhereInputSchema).optional(),
    some: z.lazy(() => UserSystemRoleWhereInputSchema).optional(),
    none: z.lazy(() => UserSystemRoleWhereInputSchema).optional(),
  });

export const UserVendorRoleListRelationFilterSchema: z.ZodType<Prisma.UserVendorRoleListRelationFilter> =
  z.strictObject({
    every: z.lazy(() => UserVendorRoleWhereInputSchema).optional(),
    some: z.lazy(() => UserVendorRoleWhereInputSchema).optional(),
    none: z.lazy(() => UserVendorRoleWhereInputSchema).optional(),
  });

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const VendorOrderByRelationAggregateInputSchema: z.ZodType<Prisma.VendorOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserSystemRoleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserSystemRoleOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserVendorRoleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserVendorRoleOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    email: z.lazy(() => SortOrderSchema).optional(),
    password: z.lazy(() => SortOrderSchema).optional(),
    firstName: z.lazy(() => SortOrderSchema).optional(),
    lastName: z.lazy(() => SortOrderSchema).optional(),
    fullAddress: z.lazy(() => SortOrderSchema).optional(),
    city: z.lazy(() => SortOrderSchema).optional(),
    province: z.lazy(() => SortOrderSchema).optional(),
    country: z.lazy(() => SortOrderSchema).optional(),
    phone: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    email: z.lazy(() => SortOrderSchema).optional(),
    password: z.lazy(() => SortOrderSchema).optional(),
    firstName: z.lazy(() => SortOrderSchema).optional(),
    lastName: z.lazy(() => SortOrderSchema).optional(),
    fullAddress: z.lazy(() => SortOrderSchema).optional(),
    city: z.lazy(() => SortOrderSchema).optional(),
    province: z.lazy(() => SortOrderSchema).optional(),
    country: z.lazy(() => SortOrderSchema).optional(),
    phone: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    email: z.lazy(() => SortOrderSchema).optional(),
    password: z.lazy(() => SortOrderSchema).optional(),
    firstName: z.lazy(() => SortOrderSchema).optional(),
    lastName: z.lazy(() => SortOrderSchema).optional(),
    fullAddress: z.lazy(() => SortOrderSchema).optional(),
    city: z.lazy(() => SortOrderSchema).optional(),
    province: z.lazy(() => SortOrderSchema).optional(),
    country: z.lazy(() => SortOrderSchema).optional(),
    phone: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
  });

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  });

export const EnumUserStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => UserStatusSchema).optional(),
    in: z
      .lazy(() => UserStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => NestedEnumUserStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
  });

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  });

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  });

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
});

export const EnumVendorStatusFilterSchema: z.ZodType<Prisma.EnumVendorStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => VendorStatusSchema).optional(),
    in: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => VendorStatusSchema), z.lazy(() => NestedEnumVendorStatusFilterSchema)])
      .optional(),
  });

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> =
  z.strictObject({
    is: z.lazy(() => UserWhereInputSchema).optional(),
    isNot: z.lazy(() => UserWhereInputSchema).optional(),
  });

export const VendorCountOrderByAggregateInputSchema: z.ZodType<Prisma.VendorCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    slug: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    logoUrl: z.lazy(() => SortOrderSchema).optional(),
    taxCode: z.lazy(() => SortOrderSchema).optional(),
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const VendorAvgOrderByAggregateInputSchema: z.ZodType<Prisma.VendorAvgOrderByAggregateInput> =
  z.strictObject({
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
  });

export const VendorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VendorMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    slug: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    logoUrl: z.lazy(() => SortOrderSchema).optional(),
    taxCode: z.lazy(() => SortOrderSchema).optional(),
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const VendorMinOrderByAggregateInputSchema: z.ZodType<Prisma.VendorMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    slug: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    logoUrl: z.lazy(() => SortOrderSchema).optional(),
    taxCode: z.lazy(() => SortOrderSchema).optional(),
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const VendorSumOrderByAggregateInputSchema: z.ZodType<Prisma.VendorSumOrderByAggregateInput> =
  z.strictObject({
    totalProducts: z.lazy(() => SortOrderSchema).optional(),
    totalOrders: z.lazy(() => SortOrderSchema).optional(),
  });

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> =
  z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedIntFilterSchema).optional(),
    _max: z.lazy(() => NestedIntFilterSchema).optional(),
  });

export const EnumVendorStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumVendorStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => VendorStatusSchema).optional(),
    in: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => NestedEnumVendorStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumVendorStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumVendorStatusFilterSchema).optional(),
  });

export const EnumRoleTypeFilterSchema: z.ZodType<Prisma.EnumRoleTypeFilter> = z.strictObject({
  equals: z.lazy(() => RoleTypeSchema).optional(),
  in: z
    .lazy(() => RoleTypeSchema)
    .array()
    .optional(),
  notIn: z
    .lazy(() => RoleTypeSchema)
    .array()
    .optional(),
  not: z
    .union([z.lazy(() => RoleTypeSchema), z.lazy(() => NestedEnumRoleTypeFilterSchema)])
    .optional(),
});

export const RolePermissionListRelationFilterSchema: z.ZodType<Prisma.RolePermissionListRelationFilter> =
  z.strictObject({
    every: z.lazy(() => RolePermissionWhereInputSchema).optional(),
    some: z.lazy(() => RolePermissionWhereInputSchema).optional(),
    none: z.lazy(() => RolePermissionWhereInputSchema).optional(),
  });

export const RolePermissionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RolePermissionOrderByRelationAggregateInput> =
  z.strictObject({
    _count: z.lazy(() => SortOrderSchema).optional(),
  });

export const RoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.RoleCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    roleType: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const RoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RoleMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    roleType: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const RoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.RoleMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    roleType: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const EnumRoleTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoleTypeWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => RoleTypeSchema).optional(),
    in: z
      .lazy(() => RoleTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => RoleTypeSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => NestedEnumRoleTypeWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumRoleTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumRoleTypeFilterSchema).optional(),
  });

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([z.boolean(), z.lazy(() => NestedBoolFilterSchema)]).optional(),
});

export const PermissionNameKeyCompoundUniqueInputSchema: z.ZodType<Prisma.PermissionNameKeyCompoundUniqueInput> =
  z.strictObject({
    name: z.string(),
    key: z.string(),
  });

export const PermissionCountOrderByAggregateInputSchema: z.ZodType<Prisma.PermissionCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    key: z.lazy(() => SortOrderSchema).optional(),
    isSystemPermission: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const PermissionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PermissionMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    key: z.lazy(() => SortOrderSchema).optional(),
    isSystemPermission: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const PermissionMinOrderByAggregateInputSchema: z.ZodType<Prisma.PermissionMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    description: z.lazy(() => SortOrderSchema).optional(),
    key: z.lazy(() => SortOrderSchema).optional(),
    isSystemPermission: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    deletedAt: z.lazy(() => SortOrderSchema).optional(),
  });

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> =
  z.strictObject({
    equals: z.boolean().optional(),
    not: z.union([z.boolean(), z.lazy(() => NestedBoolWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedBoolFilterSchema).optional(),
    _max: z.lazy(() => NestedBoolFilterSchema).optional(),
  });

export const RoleScalarRelationFilterSchema: z.ZodType<Prisma.RoleScalarRelationFilter> =
  z.strictObject({
    is: z.lazy(() => RoleWhereInputSchema).optional(),
    isNot: z.lazy(() => RoleWhereInputSchema).optional(),
  });

export const PermissionScalarRelationFilterSchema: z.ZodType<Prisma.PermissionScalarRelationFilter> =
  z.strictObject({
    is: z.lazy(() => PermissionWhereInputSchema).optional(),
    isNot: z.lazy(() => PermissionWhereInputSchema).optional(),
  });

export const RolePermissionRoleIDPermissionIDCompoundUniqueInputSchema: z.ZodType<Prisma.RolePermissionRoleIDPermissionIDCompoundUniqueInput> =
  z.strictObject({
    roleID: z.string(),
    permissionID: z.string(),
  });

export const RolePermissionCountOrderByAggregateInputSchema: z.ZodType<Prisma.RolePermissionCountOrderByAggregateInput> =
  z.strictObject({
    roleID: z.lazy(() => SortOrderSchema).optional(),
    permissionID: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const RolePermissionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.RolePermissionMaxOrderByAggregateInput> =
  z.strictObject({
    roleID: z.lazy(() => SortOrderSchema).optional(),
    permissionID: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const RolePermissionMinOrderByAggregateInputSchema: z.ZodType<Prisma.RolePermissionMinOrderByAggregateInput> =
  z.strictObject({
    roleID: z.lazy(() => SortOrderSchema).optional(),
    permissionID: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const EnumUserSystemRoleStatusFilterSchema: z.ZodType<Prisma.EnumUserSystemRoleStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => NestedEnumUserSystemRoleStatusFilterSchema),
      ])
      .optional(),
  });

export const UserSystemRoleUserIDRoleIDCompoundUniqueInputSchema: z.ZodType<Prisma.UserSystemRoleUserIDRoleIDCompoundUniqueInput> =
  z.strictObject({
    userID: z.string(),
    roleID: z.string(),
  });

export const UserSystemRoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserSystemRoleCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserSystemRoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserSystemRoleMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserSystemRoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserSystemRoleMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const EnumUserSystemRoleStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserSystemRoleStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => NestedEnumUserSystemRoleStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumUserSystemRoleStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumUserSystemRoleStatusFilterSchema).optional(),
  });

export const EnumUserVendorRoleStatusFilterSchema: z.ZodType<Prisma.EnumUserVendorRoleStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => NestedEnumUserVendorRoleStatusFilterSchema),
      ])
      .optional(),
  });

export const VendorScalarRelationFilterSchema: z.ZodType<Prisma.VendorScalarRelationFilter> =
  z.strictObject({
    is: z.lazy(() => VendorWhereInputSchema).optional(),
    isNot: z.lazy(() => VendorWhereInputSchema).optional(),
  });

export const UserVendorRoleUserIDVendorIDCompoundUniqueInputSchema: z.ZodType<Prisma.UserVendorRoleUserIDVendorIDCompoundUniqueInput> =
  z.strictObject({
    userID: z.string(),
    vendorID: z.string(),
  });

export const UserVendorRoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserVendorRoleCountOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    vendorID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserVendorRoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserVendorRoleMaxOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    vendorID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const UserVendorRoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserVendorRoleMinOrderByAggregateInput> =
  z.strictObject({
    id: z.lazy(() => SortOrderSchema).optional(),
    userID: z.lazy(() => SortOrderSchema).optional(),
    vendorID: z.lazy(() => SortOrderSchema).optional(),
    roleID: z.lazy(() => SortOrderSchema).optional(),
    status: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    createdBy: z.lazy(() => SortOrderSchema).optional(),
  });

export const EnumUserVendorRoleStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserVendorRoleStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => NestedEnumUserVendorRoleStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumUserVendorRoleStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumUserVendorRoleStatusFilterSchema).optional(),
  });

export const VendorCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.VendorCreateNestedManyWithoutUserInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => VendorCreateWithoutUserInputSchema),
        z.lazy(() => VendorCreateWithoutUserInputSchema).array(),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => VendorCreateManyUserInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleCreateNestedManyWithoutUserInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyUserInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleCreateNestedManyWithoutUserInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyUserInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const VendorUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedCreateNestedManyWithoutUserInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => VendorCreateWithoutUserInputSchema),
        z.lazy(() => VendorCreateWithoutUserInputSchema).array(),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => VendorCreateManyUserInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedCreateNestedManyWithoutUserInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyUserInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateNestedManyWithoutUserInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyUserInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.string().optional(),
  });

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.string().optional().nullable(),
  });

export const EnumUserStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserStatusFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => UserStatusSchema).optional(),
  });

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.coerce.date().optional(),
  });

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.coerce.date().optional().nullable(),
  });

export const VendorUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.VendorUpdateManyWithoutUserNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => VendorCreateWithoutUserInputSchema),
        z.lazy(() => VendorCreateWithoutUserInputSchema).array(),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => VendorUpsertWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => VendorUpsertWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => VendorCreateManyUserInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => VendorUpdateWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => VendorUpdateWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => VendorUpdateManyWithWhereWithoutUserInputSchema),
        z.lazy(() => VendorUpdateManyWithWhereWithoutUserInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => VendorScalarWhereInputSchema),
        z.lazy(() => VendorScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyWithoutUserNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyUserInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutUserInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyWithoutUserNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyUserInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutUserInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const VendorUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateManyWithoutUserNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => VendorCreateWithoutUserInputSchema),
        z.lazy(() => VendorCreateWithoutUserInputSchema).array(),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => VendorCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => VendorUpsertWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => VendorUpsertWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => VendorCreateManyUserInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => VendorWhereUniqueInputSchema),
        z.lazy(() => VendorWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => VendorUpdateWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => VendorUpdateWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => VendorUpdateManyWithWhereWithoutUserInputSchema),
        z.lazy(() => VendorUpdateManyWithWhereWithoutUserInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => VendorScalarWhereInputSchema),
        z.lazy(() => VendorScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateManyWithoutUserNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyUserInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutUserInputSchema),
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutUserInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyWithoutUserNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutUserInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyUserInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutUserInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutUserInputSchema),
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutUserInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserCreateNestedOneWithoutVendorsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutVendorsInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutVendorsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutVendorsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorsInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  });

export const UserVendorRoleCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleCreateNestedManyWithoutVendorInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyVendorInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUncheckedCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateNestedManyWithoutVendorInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyVendorInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.number().optional(),
    increment: z.number().optional(),
    decrement: z.number().optional(),
    multiply: z.number().optional(),
    divide: z.number().optional(),
  });

export const EnumVendorStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumVendorStatusFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => VendorStatusSchema).optional(),
  });

export const UserUpdateOneRequiredWithoutVendorsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutVendorsNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutVendorsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutVendorsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVendorsInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutVendorsInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => UserUpdateToOneWithWhereWithoutVendorsInputSchema),
        z.lazy(() => UserUpdateWithoutVendorsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutVendorsInputSchema),
      ])
      .optional(),
  });

export const UserVendorRoleUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyWithoutVendorNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutVendorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyVendorInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutVendorInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutVendorInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUncheckedUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyWithoutVendorNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutVendorInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutVendorInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyVendorInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutVendorInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutVendorInputSchema),
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutVendorInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleCreateNestedManyWithoutRoleInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyRoleInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleCreateNestedManyWithoutRoleInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyRoleInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionCreateNestedManyWithoutRoleInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyRoleInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleUncheckedCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedCreateNestedManyWithoutRoleInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyRoleInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUncheckedCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateNestedManyWithoutRoleInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyRoleInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionUncheckedCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUncheckedCreateNestedManyWithoutRoleInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyRoleInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const EnumRoleTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoleTypeFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => RoleTypeSchema).optional(),
  });

export const UserSystemRoleUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyWithoutRoleNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyRoleInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutRoleInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyWithoutRoleNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyRoleInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutRoleInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.RolePermissionUpdateManyWithoutRoleNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyRoleInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutRoleInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => RolePermissionScalarWhereInputSchema),
        z.lazy(() => RolePermissionScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserSystemRoleUncheckedUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateManyWithoutRoleNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUpsertWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserSystemRoleCreateManyRoleInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
        z.lazy(() => UserSystemRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUpdateWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutRoleInputSchema),
        z.lazy(() => UserSystemRoleUpdateManyWithWhereWithoutRoleInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const UserVendorRoleUncheckedUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyWithoutRoleNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema).array(),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUpsertWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => UserVendorRoleCreateManyRoleInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
        z.lazy(() => UserVendorRoleWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUpdateWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutRoleInputSchema),
        z.lazy(() => UserVendorRoleUpdateManyWithWhereWithoutRoleInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionUncheckedUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateManyWithoutRoleNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateWithoutRoleInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutRoleInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyRoleInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutRoleInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutRoleInputSchema),
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutRoleInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => RolePermissionScalarWhereInputSchema),
        z.lazy(() => RolePermissionScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionCreateNestedManyWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionCreateNestedManyWithoutPermissionInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyPermissionInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionUncheckedCreateNestedManyWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUncheckedCreateNestedManyWithoutPermissionInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyPermissionInputEnvelopeSchema).optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
  });

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.boolean().optional(),
  });

export const RolePermissionUpdateManyWithoutPermissionNestedInputSchema: z.ZodType<Prisma.RolePermissionUpdateManyWithoutPermissionNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyPermissionInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => RolePermissionScalarWhereInputSchema),
        z.lazy(() => RolePermissionScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const RolePermissionUncheckedUpdateManyWithoutPermissionNestedInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateManyWithoutPermissionNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema).array(),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionCreateOrConnectWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUpsertWithWhereUniqueWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    createMany: z.lazy(() => RolePermissionCreateManyPermissionInputEnvelopeSchema).optional(),
    set: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => RolePermissionWhereUniqueInputSchema),
        z.lazy(() => RolePermissionWhereUniqueInputSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUpdateWithWhereUniqueWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutPermissionInputSchema),
        z.lazy(() => RolePermissionUpdateManyWithWhereWithoutPermissionInputSchema).array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => RolePermissionScalarWhereInputSchema),
        z.lazy(() => RolePermissionScalarWhereInputSchema).array(),
      ])
      .optional(),
  });

export const RoleCreateNestedOneWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleCreateNestedOneWithoutRolePermissionsInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RoleCreateWithoutRolePermissionsInputSchema),
        z.lazy(() => RoleUncheckedCreateWithoutRolePermissionsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => RoleCreateOrConnectWithoutRolePermissionsInputSchema).optional(),
    connect: z.lazy(() => RoleWhereUniqueInputSchema).optional(),
  });

export const PermissionCreateNestedOneWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionCreateNestedOneWithoutRolePermissionsInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => PermissionCreateWithoutRolePermissionsInputSchema),
        z.lazy(() => PermissionUncheckedCreateWithoutRolePermissionsInputSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => PermissionCreateOrConnectWithoutRolePermissionsInputSchema)
      .optional(),
    connect: z.lazy(() => PermissionWhereUniqueInputSchema).optional(),
  });

export const RoleUpdateOneRequiredWithoutRolePermissionsNestedInputSchema: z.ZodType<Prisma.RoleUpdateOneRequiredWithoutRolePermissionsNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RoleCreateWithoutRolePermissionsInputSchema),
        z.lazy(() => RoleUncheckedCreateWithoutRolePermissionsInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => RoleCreateOrConnectWithoutRolePermissionsInputSchema).optional(),
    upsert: z.lazy(() => RoleUpsertWithoutRolePermissionsInputSchema).optional(),
    connect: z.lazy(() => RoleWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => RoleUpdateToOneWithWhereWithoutRolePermissionsInputSchema),
        z.lazy(() => RoleUpdateWithoutRolePermissionsInputSchema),
        z.lazy(() => RoleUncheckedUpdateWithoutRolePermissionsInputSchema),
      ])
      .optional(),
  });

export const PermissionUpdateOneRequiredWithoutRolePermissionsNestedInputSchema: z.ZodType<Prisma.PermissionUpdateOneRequiredWithoutRolePermissionsNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => PermissionCreateWithoutRolePermissionsInputSchema),
        z.lazy(() => PermissionUncheckedCreateWithoutRolePermissionsInputSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => PermissionCreateOrConnectWithoutRolePermissionsInputSchema)
      .optional(),
    upsert: z.lazy(() => PermissionUpsertWithoutRolePermissionsInputSchema).optional(),
    connect: z.lazy(() => PermissionWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => PermissionUpdateToOneWithWhereWithoutRolePermissionsInputSchema),
        z.lazy(() => PermissionUpdateWithoutRolePermissionsInputSchema),
        z.lazy(() => PermissionUncheckedUpdateWithoutRolePermissionsInputSchema),
      ])
      .optional(),
  });

export const UserCreateNestedOneWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserSystemRolesInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutUserSystemRolesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutUserSystemRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserSystemRolesInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  });

export const RoleCreateNestedOneWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleCreateNestedOneWithoutUserSystemRolesInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RoleCreateWithoutUserSystemRolesInputSchema),
        z.lazy(() => RoleUncheckedCreateWithoutUserSystemRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => RoleCreateOrConnectWithoutUserSystemRolesInputSchema).optional(),
    connect: z.lazy(() => RoleWhereUniqueInputSchema).optional(),
  });

export const EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserSystemRoleStatusFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => UserSystemRoleStatusSchema).optional(),
  });

export const UserUpdateOneRequiredWithoutUserSystemRolesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserSystemRolesNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutUserSystemRolesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutUserSystemRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserSystemRolesInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutUserSystemRolesInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => UserUpdateToOneWithWhereWithoutUserSystemRolesInputSchema),
        z.lazy(() => UserUpdateWithoutUserSystemRolesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutUserSystemRolesInputSchema),
      ])
      .optional(),
  });

export const RoleUpdateOneRequiredWithoutUserSystemRolesNestedInputSchema: z.ZodType<Prisma.RoleUpdateOneRequiredWithoutUserSystemRolesNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RoleCreateWithoutUserSystemRolesInputSchema),
        z.lazy(() => RoleUncheckedCreateWithoutUserSystemRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => RoleCreateOrConnectWithoutUserSystemRolesInputSchema).optional(),
    upsert: z.lazy(() => RoleUpsertWithoutUserSystemRolesInputSchema).optional(),
    connect: z.lazy(() => RoleWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => RoleUpdateToOneWithWhereWithoutUserSystemRolesInputSchema),
        z.lazy(() => RoleUpdateWithoutUserSystemRolesInputSchema),
        z.lazy(() => RoleUncheckedUpdateWithoutUserSystemRolesInputSchema),
      ])
      .optional(),
  });

export const UserCreateNestedOneWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserVendorRolesInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutUserVendorRolesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserVendorRolesInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  });

export const VendorCreateNestedOneWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorCreateNestedOneWithoutUserVendorRolesInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => VendorCreateWithoutUserVendorRolesInputSchema),
        z.lazy(() => VendorUncheckedCreateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => VendorCreateOrConnectWithoutUserVendorRolesInputSchema)
      .optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
  });

export const RoleCreateNestedOneWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleCreateNestedOneWithoutUserVendorRolesInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RoleCreateWithoutUserVendorRolesInputSchema),
        z.lazy(() => RoleUncheckedCreateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => RoleCreateOrConnectWithoutUserVendorRolesInputSchema).optional(),
    connect: z.lazy(() => RoleWhereUniqueInputSchema).optional(),
  });

export const EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserVendorRoleStatusFieldUpdateOperationsInput> =
  z.strictObject({
    set: z.lazy(() => UserVendorRoleStatusSchema).optional(),
  });

export const UserUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserVendorRolesNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutUserVendorRolesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserVendorRolesInputSchema).optional(),
    upsert: z.lazy(() => UserUpsertWithoutUserVendorRolesInputSchema).optional(),
    connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => UserUpdateToOneWithWhereWithoutUserVendorRolesInputSchema),
        z.lazy(() => UserUpdateWithoutUserVendorRolesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
  });

export const VendorUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema: z.ZodType<Prisma.VendorUpdateOneRequiredWithoutUserVendorRolesNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => VendorCreateWithoutUserVendorRolesInputSchema),
        z.lazy(() => VendorUncheckedCreateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => VendorCreateOrConnectWithoutUserVendorRolesInputSchema)
      .optional(),
    upsert: z.lazy(() => VendorUpsertWithoutUserVendorRolesInputSchema).optional(),
    connect: z.lazy(() => VendorWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => VendorUpdateToOneWithWhereWithoutUserVendorRolesInputSchema),
        z.lazy(() => VendorUpdateWithoutUserVendorRolesInputSchema),
        z.lazy(() => VendorUncheckedUpdateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
  });

export const RoleUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema: z.ZodType<Prisma.RoleUpdateOneRequiredWithoutUserVendorRolesNestedInput> =
  z.strictObject({
    create: z
      .union([
        z.lazy(() => RoleCreateWithoutUserVendorRolesInputSchema),
        z.lazy(() => RoleUncheckedCreateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
    connectOrCreate: z.lazy(() => RoleCreateOrConnectWithoutUserVendorRolesInputSchema).optional(),
    upsert: z.lazy(() => RoleUpsertWithoutUserVendorRolesInputSchema).optional(),
    connect: z.lazy(() => RoleWhereUniqueInputSchema).optional(),
    update: z
      .union([
        z.lazy(() => RoleUpdateToOneWithWhereWithoutUserVendorRolesInputSchema),
        z.lazy(() => RoleUpdateWithoutUserVendorRolesInputSchema),
        z.lazy(() => RoleUncheckedUpdateWithoutUserVendorRolesInputSchema),
      ])
      .optional(),
  });

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
});

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
      .optional()
      .nullable(),
  });

export const NestedEnumUserStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => UserStatusSchema).optional(),
    in: z
      .lazy(() => UserStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserStatusSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema)])
      .optional(),
  });

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
});

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)])
      .optional()
      .nullable(),
  });

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
  });

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
});

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  });

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> =
  z.strictObject({
    equals: z.number().optional().nullable(),
    in: z.number().array().optional().nullable(),
    notIn: z.number().array().optional().nullable(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z
      .union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
      .optional()
      .nullable(),
  });

export const NestedEnumUserStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => UserStatusSchema).optional(),
    in: z
      .lazy(() => UserStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => NestedEnumUserStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
  });

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  });

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> =
  z.strictObject({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)])
      .optional()
      .nullable(),
    _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  });

export const NestedEnumVendorStatusFilterSchema: z.ZodType<Prisma.NestedEnumVendorStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => VendorStatusSchema).optional(),
    in: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => VendorStatusSchema), z.lazy(() => NestedEnumVendorStatusFilterSchema)])
      .optional(),
  });

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> =
  z.strictObject({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedIntFilterSchema).optional(),
    _max: z.lazy(() => NestedIntFilterSchema).optional(),
  });

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
});

export const NestedEnumVendorStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumVendorStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => VendorStatusSchema).optional(),
    in: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => VendorStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => NestedEnumVendorStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumVendorStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumVendorStatusFilterSchema).optional(),
  });

export const NestedEnumRoleTypeFilterSchema: z.ZodType<Prisma.NestedEnumRoleTypeFilter> =
  z.strictObject({
    equals: z.lazy(() => RoleTypeSchema).optional(),
    in: z
      .lazy(() => RoleTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => RoleTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => RoleTypeSchema), z.lazy(() => NestedEnumRoleTypeFilterSchema)])
      .optional(),
  });

export const NestedEnumRoleTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoleTypeWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => RoleTypeSchema).optional(),
    in: z
      .lazy(() => RoleTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => RoleTypeSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => NestedEnumRoleTypeWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumRoleTypeFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumRoleTypeFilterSchema).optional(),
  });

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([z.boolean(), z.lazy(() => NestedBoolFilterSchema)]).optional(),
});

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> =
  z.strictObject({
    equals: z.boolean().optional(),
    not: z.union([z.boolean(), z.lazy(() => NestedBoolWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedBoolFilterSchema).optional(),
    _max: z.lazy(() => NestedBoolFilterSchema).optional(),
  });

export const NestedEnumUserSystemRoleStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserSystemRoleStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => NestedEnumUserSystemRoleStatusFilterSchema),
      ])
      .optional(),
  });

export const NestedEnumUserSystemRoleStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserSystemRoleStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserSystemRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => NestedEnumUserSystemRoleStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumUserSystemRoleStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumUserSystemRoleStatusFilterSchema).optional(),
  });

export const NestedEnumUserVendorRoleStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserVendorRoleStatusFilter> =
  z.strictObject({
    equals: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => NestedEnumUserVendorRoleStatusFilterSchema),
      ])
      .optional(),
  });

export const NestedEnumUserVendorRoleStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserVendorRoleStatusWithAggregatesFilter> =
  z.strictObject({
    equals: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    in: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => UserVendorRoleStatusSchema)
      .array()
      .optional(),
    not: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => NestedEnumUserVendorRoleStatusWithAggregatesFilterSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedEnumUserVendorRoleStatusFilterSchema).optional(),
    _max: z.lazy(() => NestedEnumUserVendorRoleStatusFilterSchema).optional(),
  });

export const VendorCreateWithoutUserInputSchema: z.ZodType<Prisma.VendorCreateWithoutUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    totalProducts: z.number().int().optional(),
    totalOrders: z.number().int().optional(),
    status: z.lazy(() => VendorStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleCreateNestedManyWithoutVendorInputSchema)
      .optional(),
  });

export const VendorUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedCreateWithoutUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    totalProducts: z.number().int().optional(),
    totalOrders: z.number().int().optional(),
    status: z.lazy(() => VendorStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutVendorInputSchema)
      .optional(),
  });

export const VendorCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.VendorCreateOrConnectWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => VendorCreateWithoutUserInputSchema),
      z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema),
    ]),
  });

export const VendorCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.VendorCreateManyUserInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => VendorCreateManyUserInputSchema),
      z.lazy(() => VendorCreateManyUserInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const UserSystemRoleCreateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleCreateWithoutUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    role: z.lazy(() => RoleCreateNestedOneWithoutUserSystemRolesInputSchema),
  });

export const UserSystemRoleUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedCreateWithoutUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    roleID: z.string(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserSystemRoleCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleCreateOrConnectWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema),
      z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema),
    ]),
  });

export const UserSystemRoleCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserSystemRoleCreateManyUserInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => UserSystemRoleCreateManyUserInputSchema),
      z.lazy(() => UserSystemRoleCreateManyUserInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const UserVendorRoleCreateWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleCreateWithoutUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutUserVendorRolesInputSchema),
    role: z.lazy(() => RoleCreateNestedOneWithoutUserVendorRolesInputSchema),
  });

export const UserVendorRoleUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateWithoutUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    vendorID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleCreateOrConnectWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema),
      z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema),
    ]),
  });

export const UserVendorRoleCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserVendorRoleCreateManyUserInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => UserVendorRoleCreateManyUserInputSchema),
      z.lazy(() => UserVendorRoleCreateManyUserInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const VendorUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.VendorUpsertWithWhereUniqueWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => VendorUpdateWithoutUserInputSchema),
      z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema),
    ]),
    create: z.union([
      z.lazy(() => VendorCreateWithoutUserInputSchema),
      z.lazy(() => VendorUncheckedCreateWithoutUserInputSchema),
    ]),
  });

export const VendorUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.VendorUpdateWithWhereUniqueWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => VendorUpdateWithoutUserInputSchema),
      z.lazy(() => VendorUncheckedUpdateWithoutUserInputSchema),
    ]),
  });

export const VendorUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.VendorUpdateManyWithWhereWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => VendorScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => VendorUpdateManyMutationInputSchema),
      z.lazy(() => VendorUncheckedUpdateManyWithoutUserInputSchema),
    ]),
  });

export const VendorScalarWhereInputSchema: z.ZodType<Prisma.VendorScalarWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => VendorScalarWhereInputSchema),
        z.lazy(() => VendorScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => VendorScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => VendorScalarWhereInputSchema),
        z.lazy(() => VendorScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    description: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    totalProducts: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    totalOrders: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    status: z
      .union([z.lazy(() => EnumVendorStatusFilterSchema), z.lazy(() => VendorStatusSchema)])
      .optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  });

export const UserSystemRoleUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUpsertWithWhereUniqueWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => UserSystemRoleUpdateWithoutUserInputSchema),
      z.lazy(() => UserSystemRoleUncheckedUpdateWithoutUserInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserSystemRoleCreateWithoutUserInputSchema),
      z.lazy(() => UserSystemRoleUncheckedCreateWithoutUserInputSchema),
    ]),
  });

export const UserSystemRoleUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateWithWhereUniqueWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => UserSystemRoleUpdateWithoutUserInputSchema),
      z.lazy(() => UserSystemRoleUncheckedUpdateWithoutUserInputSchema),
    ]),
  });

export const UserSystemRoleUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyWithWhereWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => UserSystemRoleUpdateManyMutationInputSchema),
      z.lazy(() => UserSystemRoleUncheckedUpdateManyWithoutUserInputSchema),
    ]),
  });

export const UserSystemRoleScalarWhereInputSchema: z.ZodType<Prisma.UserSystemRoleScalarWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserSystemRoleScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserSystemRoleScalarWhereInputSchema),
        z.lazy(() => UserSystemRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumUserSystemRoleStatusFilterSchema),
        z.lazy(() => UserSystemRoleStatusSchema),
      ])
      .optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUpsertWithWhereUniqueWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => UserVendorRoleUpdateWithoutUserInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateWithoutUserInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserVendorRoleCreateWithoutUserInputSchema),
      z.lazy(() => UserVendorRoleUncheckedCreateWithoutUserInputSchema),
    ]),
  });

export const UserVendorRoleUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateWithWhereUniqueWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => UserVendorRoleUpdateWithoutUserInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateWithoutUserInputSchema),
    ]),
  });

export const UserVendorRoleUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyWithWhereWithoutUserInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => UserVendorRoleUpdateManyMutationInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateManyWithoutUserInputSchema),
    ]),
  });

export const UserVendorRoleScalarWhereInputSchema: z.ZodType<Prisma.UserVendorRoleScalarWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => UserVendorRoleScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => UserVendorRoleScalarWhereInputSchema),
        z.lazy(() => UserVendorRoleScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    vendorID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    status: z
      .union([
        z.lazy(() => EnumUserVendorRoleStatusFilterSchema),
        z.lazy(() => UserVendorRoleStatusSchema),
      ])
      .optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const UserCreateWithoutVendorsInputSchema: z.ZodType<Prisma.UserCreateWithoutVendorsInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z.lazy(() => UserSystemRoleCreateNestedManyWithoutUserInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutUserInputSchema).optional(),
  });

export const UserUncheckedCreateWithoutVendorsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutVendorsInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedCreateNestedManyWithoutUserInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutUserInputSchema)
      .optional(),
  });

export const UserCreateOrConnectWithoutVendorsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutVendorsInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserCreateWithoutVendorsInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutVendorsInputSchema),
    ]),
  });

export const UserVendorRoleCreateWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleCreateWithoutVendorInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutUserVendorRolesInputSchema),
    role: z.lazy(() => RoleCreateNestedOneWithoutUserVendorRolesInputSchema),
  });

export const UserVendorRoleUncheckedCreateWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateWithoutVendorInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleCreateOrConnectWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleCreateOrConnectWithoutVendorInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema),
      z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema),
    ]),
  });

export const UserVendorRoleCreateManyVendorInputEnvelopeSchema: z.ZodType<Prisma.UserVendorRoleCreateManyVendorInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => UserVendorRoleCreateManyVendorInputSchema),
      z.lazy(() => UserVendorRoleCreateManyVendorInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const UserUpsertWithoutVendorsInputSchema: z.ZodType<Prisma.UserUpsertWithoutVendorsInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => UserUpdateWithoutVendorsInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutVendorsInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutVendorsInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutVendorsInputSchema),
    ]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
  });

export const UserUpdateToOneWithWhereWithoutVendorsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutVendorsInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutVendorsInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutVendorsInputSchema),
    ]),
  });

export const UserUpdateWithoutVendorsInputSchema: z.ZodType<Prisma.UserUpdateWithoutVendorsInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z.lazy(() => UserSystemRoleUpdateManyWithoutUserNestedInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  });

export const UserUncheckedUpdateWithoutVendorsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutVendorsInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedUpdateManyWithoutUserNestedInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutUserNestedInputSchema)
      .optional(),
  });

export const UserVendorRoleUpsertWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUpsertWithWhereUniqueWithoutVendorInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => UserVendorRoleUpdateWithoutVendorInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateWithoutVendorInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserVendorRoleCreateWithoutVendorInputSchema),
      z.lazy(() => UserVendorRoleUncheckedCreateWithoutVendorInputSchema),
    ]),
  });

export const UserVendorRoleUpdateWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateWithWhereUniqueWithoutVendorInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => UserVendorRoleUpdateWithoutVendorInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateWithoutVendorInputSchema),
    ]),
  });

export const UserVendorRoleUpdateManyWithWhereWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyWithWhereWithoutVendorInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => UserVendorRoleUpdateManyMutationInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateManyWithoutVendorInputSchema),
    ]),
  });

export const UserSystemRoleCreateWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleCreateWithoutRoleInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutUserSystemRolesInputSchema),
  });

export const UserSystemRoleUncheckedCreateWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedCreateWithoutRoleInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserSystemRoleCreateOrConnectWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleCreateOrConnectWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema),
      z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema),
    ]),
  });

export const UserSystemRoleCreateManyRoleInputEnvelopeSchema: z.ZodType<Prisma.UserSystemRoleCreateManyRoleInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => UserSystemRoleCreateManyRoleInputSchema),
      z.lazy(() => UserSystemRoleCreateManyRoleInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const UserVendorRoleCreateWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleCreateWithoutRoleInput> =
  z.strictObject({
    id: z.uuid().optional(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutUserVendorRolesInputSchema),
    vendor: z.lazy(() => VendorCreateNestedOneWithoutUserVendorRolesInputSchema),
  });

export const UserVendorRoleUncheckedCreateWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedCreateWithoutRoleInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    vendorID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleCreateOrConnectWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleCreateOrConnectWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema),
      z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema),
    ]),
  });

export const UserVendorRoleCreateManyRoleInputEnvelopeSchema: z.ZodType<Prisma.UserVendorRoleCreateManyRoleInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => UserVendorRoleCreateManyRoleInputSchema),
      z.lazy(() => UserVendorRoleCreateManyRoleInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const RolePermissionCreateWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionCreateWithoutRoleInput> =
  z.strictObject({
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    permission: z.lazy(() => PermissionCreateNestedOneWithoutRolePermissionsInputSchema),
  });

export const RolePermissionUncheckedCreateWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUncheckedCreateWithoutRoleInput> =
  z.strictObject({
    permissionID: z.string(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const RolePermissionCreateOrConnectWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionCreateOrConnectWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => RolePermissionCreateWithoutRoleInputSchema),
      z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema),
    ]),
  });

export const RolePermissionCreateManyRoleInputEnvelopeSchema: z.ZodType<Prisma.RolePermissionCreateManyRoleInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => RolePermissionCreateManyRoleInputSchema),
      z.lazy(() => RolePermissionCreateManyRoleInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const UserSystemRoleUpsertWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUpsertWithWhereUniqueWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => UserSystemRoleUpdateWithoutRoleInputSchema),
      z.lazy(() => UserSystemRoleUncheckedUpdateWithoutRoleInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserSystemRoleCreateWithoutRoleInputSchema),
      z.lazy(() => UserSystemRoleUncheckedCreateWithoutRoleInputSchema),
    ]),
  });

export const UserSystemRoleUpdateWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateWithWhereUniqueWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => UserSystemRoleUpdateWithoutRoleInputSchema),
      z.lazy(() => UserSystemRoleUncheckedUpdateWithoutRoleInputSchema),
    ]),
  });

export const UserSystemRoleUpdateManyWithWhereWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyWithWhereWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserSystemRoleScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => UserSystemRoleUpdateManyMutationInputSchema),
      z.lazy(() => UserSystemRoleUncheckedUpdateManyWithoutRoleInputSchema),
    ]),
  });

export const UserVendorRoleUpsertWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUpsertWithWhereUniqueWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => UserVendorRoleUpdateWithoutRoleInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateWithoutRoleInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserVendorRoleCreateWithoutRoleInputSchema),
      z.lazy(() => UserVendorRoleUncheckedCreateWithoutRoleInputSchema),
    ]),
  });

export const UserVendorRoleUpdateWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateWithWhereUniqueWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => UserVendorRoleUpdateWithoutRoleInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateWithoutRoleInputSchema),
    ]),
  });

export const UserVendorRoleUpdateManyWithWhereWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyWithWhereWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => UserVendorRoleScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => UserVendorRoleUpdateManyMutationInputSchema),
      z.lazy(() => UserVendorRoleUncheckedUpdateManyWithoutRoleInputSchema),
    ]),
  });

export const RolePermissionUpsertWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUpsertWithWhereUniqueWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => RolePermissionUpdateWithoutRoleInputSchema),
      z.lazy(() => RolePermissionUncheckedUpdateWithoutRoleInputSchema),
    ]),
    create: z.union([
      z.lazy(() => RolePermissionCreateWithoutRoleInputSchema),
      z.lazy(() => RolePermissionUncheckedCreateWithoutRoleInputSchema),
    ]),
  });

export const RolePermissionUpdateWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUpdateWithWhereUniqueWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => RolePermissionUpdateWithoutRoleInputSchema),
      z.lazy(() => RolePermissionUncheckedUpdateWithoutRoleInputSchema),
    ]),
  });

export const RolePermissionUpdateManyWithWhereWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUpdateManyWithWhereWithoutRoleInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => RolePermissionUpdateManyMutationInputSchema),
      z.lazy(() => RolePermissionUncheckedUpdateManyWithoutRoleInputSchema),
    ]),
  });

export const RolePermissionScalarWhereInputSchema: z.ZodType<Prisma.RolePermissionScalarWhereInput> =
  z.strictObject({
    AND: z
      .union([
        z.lazy(() => RolePermissionScalarWhereInputSchema),
        z.lazy(() => RolePermissionScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => RolePermissionScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => RolePermissionScalarWhereInputSchema),
        z.lazy(() => RolePermissionScalarWhereInputSchema).array(),
      ])
      .optional(),
    roleID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    permissionID: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  });

export const RolePermissionCreateWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionCreateWithoutPermissionInput> =
  z.strictObject({
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    role: z.lazy(() => RoleCreateNestedOneWithoutRolePermissionsInputSchema),
  });

export const RolePermissionUncheckedCreateWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUncheckedCreateWithoutPermissionInput> =
  z.strictObject({
    roleID: z.string(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const RolePermissionCreateOrConnectWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionCreateOrConnectWithoutPermissionInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema),
      z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema),
    ]),
  });

export const RolePermissionCreateManyPermissionInputEnvelopeSchema: z.ZodType<Prisma.RolePermissionCreateManyPermissionInputEnvelope> =
  z.strictObject({
    data: z.union([
      z.lazy(() => RolePermissionCreateManyPermissionInputSchema),
      z.lazy(() => RolePermissionCreateManyPermissionInputSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  });

export const RolePermissionUpsertWithWhereUniqueWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUpsertWithWhereUniqueWithoutPermissionInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionWhereUniqueInputSchema),
    update: z.union([
      z.lazy(() => RolePermissionUpdateWithoutPermissionInputSchema),
      z.lazy(() => RolePermissionUncheckedUpdateWithoutPermissionInputSchema),
    ]),
    create: z.union([
      z.lazy(() => RolePermissionCreateWithoutPermissionInputSchema),
      z.lazy(() => RolePermissionUncheckedCreateWithoutPermissionInputSchema),
    ]),
  });

export const RolePermissionUpdateWithWhereUniqueWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUpdateWithWhereUniqueWithoutPermissionInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionWhereUniqueInputSchema),
    data: z.union([
      z.lazy(() => RolePermissionUpdateWithoutPermissionInputSchema),
      z.lazy(() => RolePermissionUncheckedUpdateWithoutPermissionInputSchema),
    ]),
  });

export const RolePermissionUpdateManyWithWhereWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUpdateManyWithWhereWithoutPermissionInput> =
  z.strictObject({
    where: z.lazy(() => RolePermissionScalarWhereInputSchema),
    data: z.union([
      z.lazy(() => RolePermissionUpdateManyMutationInputSchema),
      z.lazy(() => RolePermissionUncheckedUpdateManyWithoutPermissionInputSchema),
    ]),
  });

export const RoleCreateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleCreateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z.lazy(() => UserSystemRoleCreateNestedManyWithoutRoleInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutRoleInputSchema).optional(),
  });

export const RoleUncheckedCreateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleUncheckedCreateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
  });

export const RoleCreateOrConnectWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleCreateOrConnectWithoutRolePermissionsInput> =
  z.strictObject({
    where: z.lazy(() => RoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => RoleCreateWithoutRolePermissionsInputSchema),
      z.lazy(() => RoleUncheckedCreateWithoutRolePermissionsInputSchema),
    ]),
  });

export const PermissionCreateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionCreateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    key: z.string(),
    isSystemPermission: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
  });

export const PermissionUncheckedCreateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionUncheckedCreateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    key: z.string(),
    isSystemPermission: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
  });

export const PermissionCreateOrConnectWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionCreateOrConnectWithoutRolePermissionsInput> =
  z.strictObject({
    where: z.lazy(() => PermissionWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => PermissionCreateWithoutRolePermissionsInputSchema),
      z.lazy(() => PermissionUncheckedCreateWithoutRolePermissionsInputSchema),
    ]),
  });

export const RoleUpsertWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleUpsertWithoutRolePermissionsInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => RoleUpdateWithoutRolePermissionsInputSchema),
      z.lazy(() => RoleUncheckedUpdateWithoutRolePermissionsInputSchema),
    ]),
    create: z.union([
      z.lazy(() => RoleCreateWithoutRolePermissionsInputSchema),
      z.lazy(() => RoleUncheckedCreateWithoutRolePermissionsInputSchema),
    ]),
    where: z.lazy(() => RoleWhereInputSchema).optional(),
  });

export const RoleUpdateToOneWithWhereWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleUpdateToOneWithWhereWithoutRolePermissionsInput> =
  z.strictObject({
    where: z.lazy(() => RoleWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => RoleUpdateWithoutRolePermissionsInputSchema),
      z.lazy(() => RoleUncheckedUpdateWithoutRolePermissionsInputSchema),
    ]),
  });

export const RoleUpdateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleUpdateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z.lazy(() => UserSystemRoleUpdateManyWithoutRoleNestedInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutRoleNestedInputSchema).optional(),
  });

export const RoleUncheckedUpdateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.RoleUncheckedUpdateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
  });

export const PermissionUpsertWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionUpsertWithoutRolePermissionsInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => PermissionUpdateWithoutRolePermissionsInputSchema),
      z.lazy(() => PermissionUncheckedUpdateWithoutRolePermissionsInputSchema),
    ]),
    create: z.union([
      z.lazy(() => PermissionCreateWithoutRolePermissionsInputSchema),
      z.lazy(() => PermissionUncheckedCreateWithoutRolePermissionsInputSchema),
    ]),
    where: z.lazy(() => PermissionWhereInputSchema).optional(),
  });

export const PermissionUpdateToOneWithWhereWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionUpdateToOneWithWhereWithoutRolePermissionsInput> =
  z.strictObject({
    where: z.lazy(() => PermissionWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => PermissionUpdateWithoutRolePermissionsInputSchema),
      z.lazy(() => PermissionUncheckedUpdateWithoutRolePermissionsInputSchema),
    ]),
  });

export const PermissionUpdateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionUpdateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    isSystemPermission: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const PermissionUncheckedUpdateWithoutRolePermissionsInputSchema: z.ZodType<Prisma.PermissionUncheckedUpdateWithoutRolePermissionsInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    isSystemPermission: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserCreateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserCreateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    vendors: z.lazy(() => VendorCreateNestedManyWithoutUserInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutUserInputSchema).optional(),
  });

export const UserUncheckedCreateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    vendors: z.lazy(() => VendorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutUserInputSchema)
      .optional(),
  });

export const UserCreateOrConnectWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserSystemRolesInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserCreateWithoutUserSystemRolesInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutUserSystemRolesInputSchema),
    ]),
  });

export const RoleCreateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleCreateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userVendorRoles: z.lazy(() => UserVendorRoleCreateNestedManyWithoutRoleInputSchema).optional(),
    rolePermissions: z.lazy(() => RolePermissionCreateNestedManyWithoutRoleInputSchema).optional(),
  });

export const RoleUncheckedCreateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleUncheckedCreateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
  });

export const RoleCreateOrConnectWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleCreateOrConnectWithoutUserSystemRolesInput> =
  z.strictObject({
    where: z.lazy(() => RoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => RoleCreateWithoutUserSystemRolesInputSchema),
      z.lazy(() => RoleUncheckedCreateWithoutUserSystemRolesInputSchema),
    ]),
  });

export const UserUpsertWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserSystemRolesInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => UserUpdateWithoutUserSystemRolesInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutUserSystemRolesInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutUserSystemRolesInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutUserSystemRolesInputSchema),
    ]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
  });

export const UserUpdateToOneWithWhereWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserSystemRolesInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutUserSystemRolesInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutUserSystemRolesInputSchema),
    ]),
  });

export const UserUpdateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    vendors: z.lazy(() => VendorUpdateManyWithoutUserNestedInputSchema).optional(),
    userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  });

export const UserUncheckedUpdateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    vendors: z.lazy(() => VendorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutUserNestedInputSchema)
      .optional(),
  });

export const RoleUpsertWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleUpsertWithoutUserSystemRolesInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => RoleUpdateWithoutUserSystemRolesInputSchema),
      z.lazy(() => RoleUncheckedUpdateWithoutUserSystemRolesInputSchema),
    ]),
    create: z.union([
      z.lazy(() => RoleCreateWithoutUserSystemRolesInputSchema),
      z.lazy(() => RoleUncheckedCreateWithoutUserSystemRolesInputSchema),
    ]),
    where: z.lazy(() => RoleWhereInputSchema).optional(),
  });

export const RoleUpdateToOneWithWhereWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleUpdateToOneWithWhereWithoutUserSystemRolesInput> =
  z.strictObject({
    where: z.lazy(() => RoleWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => RoleUpdateWithoutUserSystemRolesInputSchema),
      z.lazy(() => RoleUncheckedUpdateWithoutUserSystemRolesInputSchema),
    ]),
  });

export const RoleUpdateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleUpdateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userVendorRoles: z.lazy(() => UserVendorRoleUpdateManyWithoutRoleNestedInputSchema).optional(),
    rolePermissions: z.lazy(() => RolePermissionUpdateManyWithoutRoleNestedInputSchema).optional(),
  });

export const RoleUncheckedUpdateWithoutUserSystemRolesInputSchema: z.ZodType<Prisma.RoleUncheckedUpdateWithoutUserSystemRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
  });

export const UserCreateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserCreateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    vendors: z.lazy(() => VendorCreateNestedManyWithoutUserInputSchema).optional(),
    userSystemRoles: z.lazy(() => UserSystemRoleCreateNestedManyWithoutUserInputSchema).optional(),
  });

export const UserUncheckedCreateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    email: z.string(),
    password: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullAddress: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.lazy(() => UserStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    vendors: z.lazy(() => VendorUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedCreateNestedManyWithoutUserInputSchema)
      .optional(),
  });

export const UserCreateOrConnectWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserVendorRolesInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => UserCreateWithoutUserVendorRolesInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutUserVendorRolesInputSchema),
    ]),
  });

export const VendorCreateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorCreateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    totalProducts: z.number().int().optional(),
    totalOrders: z.number().int().optional(),
    status: z.lazy(() => VendorStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutVendorsInputSchema),
  });

export const VendorUncheckedCreateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorUncheckedCreateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    totalProducts: z.number().int().optional(),
    totalOrders: z.number().int().optional(),
    status: z.lazy(() => VendorStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
  });

export const VendorCreateOrConnectWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorCreateOrConnectWithoutUserVendorRolesInput> =
  z.strictObject({
    where: z.lazy(() => VendorWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => VendorCreateWithoutUserVendorRolesInputSchema),
      z.lazy(() => VendorUncheckedCreateWithoutUserVendorRolesInputSchema),
    ]),
  });

export const RoleCreateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleCreateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z.lazy(() => UserSystemRoleCreateNestedManyWithoutRoleInputSchema).optional(),
    rolePermissions: z.lazy(() => RolePermissionCreateNestedManyWithoutRoleInputSchema).optional(),
  });

export const RoleUncheckedCreateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleUncheckedCreateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    roleType: z.lazy(() => RoleTypeSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedCreateNestedManyWithoutRoleInputSchema)
      .optional(),
  });

export const RoleCreateOrConnectWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleCreateOrConnectWithoutUserVendorRolesInput> =
  z.strictObject({
    where: z.lazy(() => RoleWhereUniqueInputSchema),
    create: z.union([
      z.lazy(() => RoleCreateWithoutUserVendorRolesInputSchema),
      z.lazy(() => RoleUncheckedCreateWithoutUserVendorRolesInputSchema),
    ]),
  });

export const UserUpsertWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserVendorRolesInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => UserUpdateWithoutUserVendorRolesInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutUserVendorRolesInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutUserVendorRolesInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutUserVendorRolesInputSchema),
    ]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
  });

export const UserUpdateToOneWithWhereWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserVendorRolesInput> =
  z.strictObject({
    where: z.lazy(() => UserWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutUserVendorRolesInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutUserVendorRolesInputSchema),
    ]),
  });

export const UserUpdateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    vendors: z.lazy(() => VendorUpdateManyWithoutUserNestedInputSchema).optional(),
    userSystemRoles: z.lazy(() => UserSystemRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  });

export const UserUncheckedUpdateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    password: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    firstName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    fullAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    province: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    phone: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    status: z
      .union([
        z.lazy(() => UserStatusSchema),
        z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    vendors: z.lazy(() => VendorUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedUpdateManyWithoutUserNestedInputSchema)
      .optional(),
  });

export const VendorUpsertWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorUpsertWithoutUserVendorRolesInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => VendorUpdateWithoutUserVendorRolesInputSchema),
      z.lazy(() => VendorUncheckedUpdateWithoutUserVendorRolesInputSchema),
    ]),
    create: z.union([
      z.lazy(() => VendorCreateWithoutUserVendorRolesInputSchema),
      z.lazy(() => VendorUncheckedCreateWithoutUserVendorRolesInputSchema),
    ]),
    where: z.lazy(() => VendorWhereInputSchema).optional(),
  });

export const VendorUpdateToOneWithWhereWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorUpdateToOneWithWhereWithoutUserVendorRolesInput> =
  z.strictObject({
    where: z.lazy(() => VendorWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => VendorUpdateWithoutUserVendorRolesInputSchema),
      z.lazy(() => VendorUncheckedUpdateWithoutUserVendorRolesInputSchema),
    ]),
  });

export const VendorUpdateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorUpdateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutVendorsNestedInputSchema).optional(),
  });

export const VendorUncheckedUpdateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RoleUpsertWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleUpsertWithoutUserVendorRolesInput> =
  z.strictObject({
    update: z.union([
      z.lazy(() => RoleUpdateWithoutUserVendorRolesInputSchema),
      z.lazy(() => RoleUncheckedUpdateWithoutUserVendorRolesInputSchema),
    ]),
    create: z.union([
      z.lazy(() => RoleCreateWithoutUserVendorRolesInputSchema),
      z.lazy(() => RoleUncheckedCreateWithoutUserVendorRolesInputSchema),
    ]),
    where: z.lazy(() => RoleWhereInputSchema).optional(),
  });

export const RoleUpdateToOneWithWhereWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleUpdateToOneWithWhereWithoutUserVendorRolesInput> =
  z.strictObject({
    where: z.lazy(() => RoleWhereInputSchema).optional(),
    data: z.union([
      z.lazy(() => RoleUpdateWithoutUserVendorRolesInputSchema),
      z.lazy(() => RoleUncheckedUpdateWithoutUserVendorRolesInputSchema),
    ]),
  });

export const RoleUpdateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleUpdateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z.lazy(() => UserSystemRoleUpdateManyWithoutRoleNestedInputSchema).optional(),
    rolePermissions: z.lazy(() => RolePermissionUpdateManyWithoutRoleNestedInputSchema).optional(),
  });

export const RoleUncheckedUpdateWithoutUserVendorRolesInputSchema: z.ZodType<Prisma.RoleUncheckedUpdateWithoutUserVendorRolesInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    roleType: z
      .union([
        z.lazy(() => RoleTypeSchema),
        z.lazy(() => EnumRoleTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userSystemRoles: z
      .lazy(() => UserSystemRoleUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
    rolePermissions: z
      .lazy(() => RolePermissionUncheckedUpdateManyWithoutRoleNestedInputSchema)
      .optional(),
  });

export const VendorCreateManyUserInputSchema: z.ZodType<Prisma.VendorCreateManyUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    totalProducts: z.number().int().optional(),
    totalOrders: z.number().int().optional(),
    status: z.lazy(() => VendorStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
  });

export const UserSystemRoleCreateManyUserInputSchema: z.ZodType<Prisma.UserSystemRoleCreateManyUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    roleID: z.string(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleCreateManyUserInputSchema: z.ZodType<Prisma.UserVendorRoleCreateManyUserInput> =
  z.strictObject({
    id: z.uuid().optional(),
    vendorID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const VendorUpdateWithoutUserInputSchema: z.ZodType<Prisma.VendorUpdateWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUpdateManyWithoutVendorNestedInputSchema)
      .optional(),
  });

export const VendorUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userVendorRoles: z
      .lazy(() => UserVendorRoleUncheckedUpdateManyWithoutVendorNestedInputSchema)
      .optional(),
  });

export const VendorUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.VendorUncheckedUpdateManyWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    logoUrl: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    taxCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    totalProducts: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalOrders: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => VendorStatusSchema),
        z.lazy(() => EnumVendorStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutUserSystemRolesNestedInputSchema).optional(),
  });

export const UserSystemRoleUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateManyWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
  });

export const UserVendorRoleUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyWithoutUserInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleCreateManyVendorInputSchema: z.ZodType<Prisma.UserVendorRoleCreateManyVendorInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    roleID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleUpdateWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateWithoutVendorInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
  });

export const UserVendorRoleUncheckedUpdateWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateWithoutVendorInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUncheckedUpdateManyWithoutVendorInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyWithoutVendorInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleCreateManyRoleInputSchema: z.ZodType<Prisma.UserSystemRoleCreateManyRoleInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    status: z.lazy(() => UserSystemRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserVendorRoleCreateManyRoleInputSchema: z.ZodType<Prisma.UserVendorRoleCreateManyRoleInput> =
  z.strictObject({
    id: z.uuid().optional(),
    userID: z.string(),
    vendorID: z.string(),
    status: z.lazy(() => UserVendorRoleStatusSchema).optional(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const RolePermissionCreateManyRoleInputSchema: z.ZodType<Prisma.RolePermissionCreateManyRoleInput> =
  z.strictObject({
    permissionID: z.string(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const UserSystemRoleUpdateWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUpdateWithoutRoleInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutUserSystemRolesNestedInputSchema).optional(),
  });

export const UserSystemRoleUncheckedUpdateWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateWithoutRoleInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserSystemRoleUncheckedUpdateManyWithoutRoleInputSchema: z.ZodType<Prisma.UserSystemRoleUncheckedUpdateManyWithoutRoleInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserSystemRoleStatusSchema),
        z.lazy(() => EnumUserSystemRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUpdateWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUpdateWithoutRoleInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    user: z.lazy(() => UserUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
    vendor: z.lazy(() => VendorUpdateOneRequiredWithoutUserVendorRolesNestedInputSchema).optional(),
  });

export const UserVendorRoleUncheckedUpdateWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateWithoutRoleInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const UserVendorRoleUncheckedUpdateManyWithoutRoleInputSchema: z.ZodType<Prisma.UserVendorRoleUncheckedUpdateManyWithoutRoleInput> =
  z.strictObject({
    id: z.union([z.uuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    userID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    vendorID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => UserVendorRoleStatusSchema),
        z.lazy(() => EnumUserVendorRoleStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionUpdateWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUpdateWithoutRoleInput> =
  z.strictObject({
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    permission: z
      .lazy(() => PermissionUpdateOneRequiredWithoutRolePermissionsNestedInputSchema)
      .optional(),
  });

export const RolePermissionUncheckedUpdateWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateWithoutRoleInput> =
  z.strictObject({
    permissionID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionUncheckedUpdateManyWithoutRoleInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateManyWithoutRoleInput> =
  z.strictObject({
    permissionID: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionCreateManyPermissionInputSchema: z.ZodType<Prisma.RolePermissionCreateManyPermissionInput> =
  z.strictObject({
    roleID: z.string(),
    createdAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
  });

export const RolePermissionUpdateWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUpdateWithoutPermissionInput> =
  z.strictObject({
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    role: z.lazy(() => RoleUpdateOneRequiredWithoutRolePermissionsNestedInputSchema).optional(),
  });

export const RolePermissionUncheckedUpdateWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateWithoutPermissionInput> =
  z.strictObject({
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

export const RolePermissionUncheckedUpdateManyWithoutPermissionInputSchema: z.ZodType<Prisma.RolePermissionUncheckedUpdateManyWithoutPermissionInput> =
  z.strictObject({
    roleID: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
  });

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z
      .union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema])
      .optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z
      .union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema])
      .optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereInputSchema.optional(),
    orderBy: z
      .union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema])
      .optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z
  .object({
    where: UserWhereInputSchema.optional(),
    orderBy: z
      .union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema])
      .optional(),
    cursor: UserWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z
  .object({
    where: UserWhereInputSchema.optional(),
    orderBy: z
      .union([UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema])
      .optional(),
    by: UserScalarFieldEnumSchema.array(),
    having: UserScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const VendorFindFirstArgsSchema: z.ZodType<Prisma.VendorFindFirstArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereInputSchema.optional(),
    orderBy: z
      .union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema])
      .optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const VendorFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VendorFindFirstOrThrowArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereInputSchema.optional(),
    orderBy: z
      .union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema])
      .optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const VendorFindManyArgsSchema: z.ZodType<Prisma.VendorFindManyArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereInputSchema.optional(),
    orderBy: z
      .union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema])
      .optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([VendorScalarFieldEnumSchema, VendorScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const VendorAggregateArgsSchema: z.ZodType<Prisma.VendorAggregateArgs> = z
  .object({
    where: VendorWhereInputSchema.optional(),
    orderBy: z
      .union([VendorOrderByWithRelationInputSchema.array(), VendorOrderByWithRelationInputSchema])
      .optional(),
    cursor: VendorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const VendorGroupByArgsSchema: z.ZodType<Prisma.VendorGroupByArgs> = z
  .object({
    where: VendorWhereInputSchema.optional(),
    orderBy: z
      .union([
        VendorOrderByWithAggregationInputSchema.array(),
        VendorOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: VendorScalarFieldEnumSchema.array(),
    having: VendorScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const VendorFindUniqueArgsSchema: z.ZodType<Prisma.VendorFindUniqueArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
  })
  .strict();

export const VendorFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VendorFindUniqueOrThrowArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
  })
  .strict();

export const RoleFindFirstArgsSchema: z.ZodType<Prisma.RoleFindFirstArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereInputSchema.optional(),
    orderBy: z
      .union([RoleOrderByWithRelationInputSchema.array(), RoleOrderByWithRelationInputSchema])
      .optional(),
    cursor: RoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([RoleScalarFieldEnumSchema, RoleScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const RoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RoleFindFirstOrThrowArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereInputSchema.optional(),
    orderBy: z
      .union([RoleOrderByWithRelationInputSchema.array(), RoleOrderByWithRelationInputSchema])
      .optional(),
    cursor: RoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([RoleScalarFieldEnumSchema, RoleScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const RoleFindManyArgsSchema: z.ZodType<Prisma.RoleFindManyArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereInputSchema.optional(),
    orderBy: z
      .union([RoleOrderByWithRelationInputSchema.array(), RoleOrderByWithRelationInputSchema])
      .optional(),
    cursor: RoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([RoleScalarFieldEnumSchema, RoleScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const RoleAggregateArgsSchema: z.ZodType<Prisma.RoleAggregateArgs> = z
  .object({
    where: RoleWhereInputSchema.optional(),
    orderBy: z
      .union([RoleOrderByWithRelationInputSchema.array(), RoleOrderByWithRelationInputSchema])
      .optional(),
    cursor: RoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const RoleGroupByArgsSchema: z.ZodType<Prisma.RoleGroupByArgs> = z
  .object({
    where: RoleWhereInputSchema.optional(),
    orderBy: z
      .union([RoleOrderByWithAggregationInputSchema.array(), RoleOrderByWithAggregationInputSchema])
      .optional(),
    by: RoleScalarFieldEnumSchema.array(),
    having: RoleScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const RoleFindUniqueArgsSchema: z.ZodType<Prisma.RoleFindUniqueArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereUniqueInputSchema,
  })
  .strict();

export const RoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RoleFindUniqueOrThrowArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereUniqueInputSchema,
  })
  .strict();

export const PermissionFindFirstArgsSchema: z.ZodType<Prisma.PermissionFindFirstArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    where: PermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        PermissionOrderByWithRelationInputSchema.array(),
        PermissionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PermissionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PermissionScalarFieldEnumSchema, PermissionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const PermissionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PermissionFindFirstOrThrowArgs> =
  z
    .object({
      select: PermissionSelectSchema.optional(),
      include: PermissionIncludeSchema.optional(),
      where: PermissionWhereInputSchema.optional(),
      orderBy: z
        .union([
          PermissionOrderByWithRelationInputSchema.array(),
          PermissionOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: PermissionWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
      distinct: z
        .union([PermissionScalarFieldEnumSchema, PermissionScalarFieldEnumSchema.array()])
        .optional(),
    })
    .strict();

export const PermissionFindManyArgsSchema: z.ZodType<Prisma.PermissionFindManyArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    where: PermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        PermissionOrderByWithRelationInputSchema.array(),
        PermissionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PermissionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PermissionScalarFieldEnumSchema, PermissionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const PermissionAggregateArgsSchema: z.ZodType<Prisma.PermissionAggregateArgs> = z
  .object({
    where: PermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        PermissionOrderByWithRelationInputSchema.array(),
        PermissionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PermissionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const PermissionGroupByArgsSchema: z.ZodType<Prisma.PermissionGroupByArgs> = z
  .object({
    where: PermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        PermissionOrderByWithAggregationInputSchema.array(),
        PermissionOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: PermissionScalarFieldEnumSchema.array(),
    having: PermissionScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const PermissionFindUniqueArgsSchema: z.ZodType<Prisma.PermissionFindUniqueArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    where: PermissionWhereUniqueInputSchema,
  })
  .strict();

export const PermissionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PermissionFindUniqueOrThrowArgs> =
  z
    .object({
      select: PermissionSelectSchema.optional(),
      include: PermissionIncludeSchema.optional(),
      where: PermissionWhereUniqueInputSchema,
    })
    .strict();

export const RolePermissionFindFirstArgsSchema: z.ZodType<Prisma.RolePermissionFindFirstArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    where: RolePermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        RolePermissionOrderByWithRelationInputSchema.array(),
        RolePermissionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: RolePermissionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([RolePermissionScalarFieldEnumSchema, RolePermissionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const RolePermissionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RolePermissionFindFirstOrThrowArgs> =
  z
    .object({
      select: RolePermissionSelectSchema.optional(),
      include: RolePermissionIncludeSchema.optional(),
      where: RolePermissionWhereInputSchema.optional(),
      orderBy: z
        .union([
          RolePermissionOrderByWithRelationInputSchema.array(),
          RolePermissionOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: RolePermissionWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
      distinct: z
        .union([RolePermissionScalarFieldEnumSchema, RolePermissionScalarFieldEnumSchema.array()])
        .optional(),
    })
    .strict();

export const RolePermissionFindManyArgsSchema: z.ZodType<Prisma.RolePermissionFindManyArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    where: RolePermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        RolePermissionOrderByWithRelationInputSchema.array(),
        RolePermissionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: RolePermissionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([RolePermissionScalarFieldEnumSchema, RolePermissionScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const RolePermissionAggregateArgsSchema: z.ZodType<Prisma.RolePermissionAggregateArgs> = z
  .object({
    where: RolePermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        RolePermissionOrderByWithRelationInputSchema.array(),
        RolePermissionOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: RolePermissionWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const RolePermissionGroupByArgsSchema: z.ZodType<Prisma.RolePermissionGroupByArgs> = z
  .object({
    where: RolePermissionWhereInputSchema.optional(),
    orderBy: z
      .union([
        RolePermissionOrderByWithAggregationInputSchema.array(),
        RolePermissionOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: RolePermissionScalarFieldEnumSchema.array(),
    having: RolePermissionScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const RolePermissionFindUniqueArgsSchema: z.ZodType<Prisma.RolePermissionFindUniqueArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    where: RolePermissionWhereUniqueInputSchema,
  })
  .strict();

export const RolePermissionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.RolePermissionFindUniqueOrThrowArgs> =
  z
    .object({
      select: RolePermissionSelectSchema.optional(),
      include: RolePermissionIncludeSchema.optional(),
      where: RolePermissionWhereUniqueInputSchema,
    })
    .strict();

export const UserSystemRoleFindFirstArgsSchema: z.ZodType<Prisma.UserSystemRoleFindFirstArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    where: UserSystemRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserSystemRoleOrderByWithRelationInputSchema.array(),
        UserSystemRoleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: UserSystemRoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([UserSystemRoleScalarFieldEnumSchema, UserSystemRoleScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const UserSystemRoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserSystemRoleFindFirstOrThrowArgs> =
  z
    .object({
      select: UserSystemRoleSelectSchema.optional(),
      include: UserSystemRoleIncludeSchema.optional(),
      where: UserSystemRoleWhereInputSchema.optional(),
      orderBy: z
        .union([
          UserSystemRoleOrderByWithRelationInputSchema.array(),
          UserSystemRoleOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: UserSystemRoleWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
      distinct: z
        .union([UserSystemRoleScalarFieldEnumSchema, UserSystemRoleScalarFieldEnumSchema.array()])
        .optional(),
    })
    .strict();

export const UserSystemRoleFindManyArgsSchema: z.ZodType<Prisma.UserSystemRoleFindManyArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    where: UserSystemRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserSystemRoleOrderByWithRelationInputSchema.array(),
        UserSystemRoleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: UserSystemRoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([UserSystemRoleScalarFieldEnumSchema, UserSystemRoleScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const UserSystemRoleAggregateArgsSchema: z.ZodType<Prisma.UserSystemRoleAggregateArgs> = z
  .object({
    where: UserSystemRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserSystemRoleOrderByWithRelationInputSchema.array(),
        UserSystemRoleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: UserSystemRoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserSystemRoleGroupByArgsSchema: z.ZodType<Prisma.UserSystemRoleGroupByArgs> = z
  .object({
    where: UserSystemRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserSystemRoleOrderByWithAggregationInputSchema.array(),
        UserSystemRoleOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: UserSystemRoleScalarFieldEnumSchema.array(),
    having: UserSystemRoleScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserSystemRoleFindUniqueArgsSchema: z.ZodType<Prisma.UserSystemRoleFindUniqueArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    where: UserSystemRoleWhereUniqueInputSchema,
  })
  .strict();

export const UserSystemRoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserSystemRoleFindUniqueOrThrowArgs> =
  z
    .object({
      select: UserSystemRoleSelectSchema.optional(),
      include: UserSystemRoleIncludeSchema.optional(),
      where: UserSystemRoleWhereUniqueInputSchema,
    })
    .strict();

export const UserVendorRoleFindFirstArgsSchema: z.ZodType<Prisma.UserVendorRoleFindFirstArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    where: UserVendorRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserVendorRoleOrderByWithRelationInputSchema.array(),
        UserVendorRoleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: UserVendorRoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([UserVendorRoleScalarFieldEnumSchema, UserVendorRoleScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const UserVendorRoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserVendorRoleFindFirstOrThrowArgs> =
  z
    .object({
      select: UserVendorRoleSelectSchema.optional(),
      include: UserVendorRoleIncludeSchema.optional(),
      where: UserVendorRoleWhereInputSchema.optional(),
      orderBy: z
        .union([
          UserVendorRoleOrderByWithRelationInputSchema.array(),
          UserVendorRoleOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: UserVendorRoleWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
      distinct: z
        .union([UserVendorRoleScalarFieldEnumSchema, UserVendorRoleScalarFieldEnumSchema.array()])
        .optional(),
    })
    .strict();

export const UserVendorRoleFindManyArgsSchema: z.ZodType<Prisma.UserVendorRoleFindManyArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    where: UserVendorRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserVendorRoleOrderByWithRelationInputSchema.array(),
        UserVendorRoleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: UserVendorRoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([UserVendorRoleScalarFieldEnumSchema, UserVendorRoleScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const UserVendorRoleAggregateArgsSchema: z.ZodType<Prisma.UserVendorRoleAggregateArgs> = z
  .object({
    where: UserVendorRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserVendorRoleOrderByWithRelationInputSchema.array(),
        UserVendorRoleOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: UserVendorRoleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserVendorRoleGroupByArgsSchema: z.ZodType<Prisma.UserVendorRoleGroupByArgs> = z
  .object({
    where: UserVendorRoleWhereInputSchema.optional(),
    orderBy: z
      .union([
        UserVendorRoleOrderByWithAggregationInputSchema.array(),
        UserVendorRoleOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: UserVendorRoleScalarFieldEnumSchema.array(),
    having: UserVendorRoleScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const UserVendorRoleFindUniqueArgsSchema: z.ZodType<Prisma.UserVendorRoleFindUniqueArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    where: UserVendorRoleWhereUniqueInputSchema,
  })
  .strict();

export const UserVendorRoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserVendorRoleFindUniqueOrThrowArgs> =
  z
    .object({
      select: UserVendorRoleSelectSchema.optional(),
      include: UserVendorRoleIncludeSchema.optional(),
      where: UserVendorRoleWhereUniqueInputSchema,
    })
    .strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    data: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
  })
  .strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
    create: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
    update: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
  })
  .strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z
  .object({
    data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z
  .object({
    data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z
  .object({
    select: UserSelectSchema.optional(),
    include: UserIncludeSchema.optional(),
    data: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
    where: UserWhereUniqueInputSchema,
  })
  .strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z
  .object({
    data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z
  .object({
    where: UserWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const VendorCreateArgsSchema: z.ZodType<Prisma.VendorCreateArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    data: z.union([VendorCreateInputSchema, VendorUncheckedCreateInputSchema]),
  })
  .strict();

export const VendorUpsertArgsSchema: z.ZodType<Prisma.VendorUpsertArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
    create: z.union([VendorCreateInputSchema, VendorUncheckedCreateInputSchema]),
    update: z.union([VendorUpdateInputSchema, VendorUncheckedUpdateInputSchema]),
  })
  .strict();

export const VendorCreateManyArgsSchema: z.ZodType<Prisma.VendorCreateManyArgs> = z
  .object({
    data: z.union([VendorCreateManyInputSchema, VendorCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const VendorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VendorCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([VendorCreateManyInputSchema, VendorCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const VendorDeleteArgsSchema: z.ZodType<Prisma.VendorDeleteArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    where: VendorWhereUniqueInputSchema,
  })
  .strict();

export const VendorUpdateArgsSchema: z.ZodType<Prisma.VendorUpdateArgs> = z
  .object({
    select: VendorSelectSchema.optional(),
    include: VendorIncludeSchema.optional(),
    data: z.union([VendorUpdateInputSchema, VendorUncheckedUpdateInputSchema]),
    where: VendorWhereUniqueInputSchema,
  })
  .strict();

export const VendorUpdateManyArgsSchema: z.ZodType<Prisma.VendorUpdateManyArgs> = z
  .object({
    data: z.union([VendorUpdateManyMutationInputSchema, VendorUncheckedUpdateManyInputSchema]),
    where: VendorWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const VendorUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VendorUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([VendorUpdateManyMutationInputSchema, VendorUncheckedUpdateManyInputSchema]),
      where: VendorWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export const VendorDeleteManyArgsSchema: z.ZodType<Prisma.VendorDeleteManyArgs> = z
  .object({
    where: VendorWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const RoleCreateArgsSchema: z.ZodType<Prisma.RoleCreateArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    data: z.union([RoleCreateInputSchema, RoleUncheckedCreateInputSchema]),
  })
  .strict();

export const RoleUpsertArgsSchema: z.ZodType<Prisma.RoleUpsertArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereUniqueInputSchema,
    create: z.union([RoleCreateInputSchema, RoleUncheckedCreateInputSchema]),
    update: z.union([RoleUpdateInputSchema, RoleUncheckedUpdateInputSchema]),
  })
  .strict();

export const RoleCreateManyArgsSchema: z.ZodType<Prisma.RoleCreateManyArgs> = z
  .object({
    data: z.union([RoleCreateManyInputSchema, RoleCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const RoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RoleCreateManyAndReturnArgs> = z
  .object({
    data: z.union([RoleCreateManyInputSchema, RoleCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const RoleDeleteArgsSchema: z.ZodType<Prisma.RoleDeleteArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    where: RoleWhereUniqueInputSchema,
  })
  .strict();

export const RoleUpdateArgsSchema: z.ZodType<Prisma.RoleUpdateArgs> = z
  .object({
    select: RoleSelectSchema.optional(),
    include: RoleIncludeSchema.optional(),
    data: z.union([RoleUpdateInputSchema, RoleUncheckedUpdateInputSchema]),
    where: RoleWhereUniqueInputSchema,
  })
  .strict();

export const RoleUpdateManyArgsSchema: z.ZodType<Prisma.RoleUpdateManyArgs> = z
  .object({
    data: z.union([RoleUpdateManyMutationInputSchema, RoleUncheckedUpdateManyInputSchema]),
    where: RoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const RoleUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RoleUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([RoleUpdateManyMutationInputSchema, RoleUncheckedUpdateManyInputSchema]),
    where: RoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const RoleDeleteManyArgsSchema: z.ZodType<Prisma.RoleDeleteManyArgs> = z
  .object({
    where: RoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const PermissionCreateArgsSchema: z.ZodType<Prisma.PermissionCreateArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    data: z.union([PermissionCreateInputSchema, PermissionUncheckedCreateInputSchema]),
  })
  .strict();

export const PermissionUpsertArgsSchema: z.ZodType<Prisma.PermissionUpsertArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    where: PermissionWhereUniqueInputSchema,
    create: z.union([PermissionCreateInputSchema, PermissionUncheckedCreateInputSchema]),
    update: z.union([PermissionUpdateInputSchema, PermissionUncheckedUpdateInputSchema]),
  })
  .strict();

export const PermissionCreateManyArgsSchema: z.ZodType<Prisma.PermissionCreateManyArgs> = z
  .object({
    data: z.union([PermissionCreateManyInputSchema, PermissionCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const PermissionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PermissionCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([PermissionCreateManyInputSchema, PermissionCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const PermissionDeleteArgsSchema: z.ZodType<Prisma.PermissionDeleteArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    where: PermissionWhereUniqueInputSchema,
  })
  .strict();

export const PermissionUpdateArgsSchema: z.ZodType<Prisma.PermissionUpdateArgs> = z
  .object({
    select: PermissionSelectSchema.optional(),
    include: PermissionIncludeSchema.optional(),
    data: z.union([PermissionUpdateInputSchema, PermissionUncheckedUpdateInputSchema]),
    where: PermissionWhereUniqueInputSchema,
  })
  .strict();

export const PermissionUpdateManyArgsSchema: z.ZodType<Prisma.PermissionUpdateManyArgs> = z
  .object({
    data: z.union([
      PermissionUpdateManyMutationInputSchema,
      PermissionUncheckedUpdateManyInputSchema,
    ]),
    where: PermissionWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const PermissionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PermissionUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        PermissionUpdateManyMutationInputSchema,
        PermissionUncheckedUpdateManyInputSchema,
      ]),
      where: PermissionWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export const PermissionDeleteManyArgsSchema: z.ZodType<Prisma.PermissionDeleteManyArgs> = z
  .object({
    where: PermissionWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const RolePermissionCreateArgsSchema: z.ZodType<Prisma.RolePermissionCreateArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    data: z.union([RolePermissionCreateInputSchema, RolePermissionUncheckedCreateInputSchema]),
  })
  .strict();

export const RolePermissionUpsertArgsSchema: z.ZodType<Prisma.RolePermissionUpsertArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    where: RolePermissionWhereUniqueInputSchema,
    create: z.union([RolePermissionCreateInputSchema, RolePermissionUncheckedCreateInputSchema]),
    update: z.union([RolePermissionUpdateInputSchema, RolePermissionUncheckedUpdateInputSchema]),
  })
  .strict();

export const RolePermissionCreateManyArgsSchema: z.ZodType<Prisma.RolePermissionCreateManyArgs> = z
  .object({
    data: z.union([
      RolePermissionCreateManyInputSchema,
      RolePermissionCreateManyInputSchema.array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const RolePermissionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RolePermissionCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        RolePermissionCreateManyInputSchema,
        RolePermissionCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const RolePermissionDeleteArgsSchema: z.ZodType<Prisma.RolePermissionDeleteArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    where: RolePermissionWhereUniqueInputSchema,
  })
  .strict();

export const RolePermissionUpdateArgsSchema: z.ZodType<Prisma.RolePermissionUpdateArgs> = z
  .object({
    select: RolePermissionSelectSchema.optional(),
    include: RolePermissionIncludeSchema.optional(),
    data: z.union([RolePermissionUpdateInputSchema, RolePermissionUncheckedUpdateInputSchema]),
    where: RolePermissionWhereUniqueInputSchema,
  })
  .strict();

export const RolePermissionUpdateManyArgsSchema: z.ZodType<Prisma.RolePermissionUpdateManyArgs> = z
  .object({
    data: z.union([
      RolePermissionUpdateManyMutationInputSchema,
      RolePermissionUncheckedUpdateManyInputSchema,
    ]),
    where: RolePermissionWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const RolePermissionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RolePermissionUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        RolePermissionUpdateManyMutationInputSchema,
        RolePermissionUncheckedUpdateManyInputSchema,
      ]),
      where: RolePermissionWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export const RolePermissionDeleteManyArgsSchema: z.ZodType<Prisma.RolePermissionDeleteManyArgs> = z
  .object({
    where: RolePermissionWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserSystemRoleCreateArgsSchema: z.ZodType<Prisma.UserSystemRoleCreateArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    data: z.union([UserSystemRoleCreateInputSchema, UserSystemRoleUncheckedCreateInputSchema]),
  })
  .strict();

export const UserSystemRoleUpsertArgsSchema: z.ZodType<Prisma.UserSystemRoleUpsertArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    where: UserSystemRoleWhereUniqueInputSchema,
    create: z.union([UserSystemRoleCreateInputSchema, UserSystemRoleUncheckedCreateInputSchema]),
    update: z.union([UserSystemRoleUpdateInputSchema, UserSystemRoleUncheckedUpdateInputSchema]),
  })
  .strict();

export const UserSystemRoleCreateManyArgsSchema: z.ZodType<Prisma.UserSystemRoleCreateManyArgs> = z
  .object({
    data: z.union([
      UserSystemRoleCreateManyInputSchema,
      UserSystemRoleCreateManyInputSchema.array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const UserSystemRoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserSystemRoleCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        UserSystemRoleCreateManyInputSchema,
        UserSystemRoleCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const UserSystemRoleDeleteArgsSchema: z.ZodType<Prisma.UserSystemRoleDeleteArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    where: UserSystemRoleWhereUniqueInputSchema,
  })
  .strict();

export const UserSystemRoleUpdateArgsSchema: z.ZodType<Prisma.UserSystemRoleUpdateArgs> = z
  .object({
    select: UserSystemRoleSelectSchema.optional(),
    include: UserSystemRoleIncludeSchema.optional(),
    data: z.union([UserSystemRoleUpdateInputSchema, UserSystemRoleUncheckedUpdateInputSchema]),
    where: UserSystemRoleWhereUniqueInputSchema,
  })
  .strict();

export const UserSystemRoleUpdateManyArgsSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyArgs> = z
  .object({
    data: z.union([
      UserSystemRoleUpdateManyMutationInputSchema,
      UserSystemRoleUncheckedUpdateManyInputSchema,
    ]),
    where: UserSystemRoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserSystemRoleUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserSystemRoleUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        UserSystemRoleUpdateManyMutationInputSchema,
        UserSystemRoleUncheckedUpdateManyInputSchema,
      ]),
      where: UserSystemRoleWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export const UserSystemRoleDeleteManyArgsSchema: z.ZodType<Prisma.UserSystemRoleDeleteManyArgs> = z
  .object({
    where: UserSystemRoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserVendorRoleCreateArgsSchema: z.ZodType<Prisma.UserVendorRoleCreateArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    data: z.union([UserVendorRoleCreateInputSchema, UserVendorRoleUncheckedCreateInputSchema]),
  })
  .strict();

export const UserVendorRoleUpsertArgsSchema: z.ZodType<Prisma.UserVendorRoleUpsertArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    where: UserVendorRoleWhereUniqueInputSchema,
    create: z.union([UserVendorRoleCreateInputSchema, UserVendorRoleUncheckedCreateInputSchema]),
    update: z.union([UserVendorRoleUpdateInputSchema, UserVendorRoleUncheckedUpdateInputSchema]),
  })
  .strict();

export const UserVendorRoleCreateManyArgsSchema: z.ZodType<Prisma.UserVendorRoleCreateManyArgs> = z
  .object({
    data: z.union([
      UserVendorRoleCreateManyInputSchema,
      UserVendorRoleCreateManyInputSchema.array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const UserVendorRoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserVendorRoleCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        UserVendorRoleCreateManyInputSchema,
        UserVendorRoleCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const UserVendorRoleDeleteArgsSchema: z.ZodType<Prisma.UserVendorRoleDeleteArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    where: UserVendorRoleWhereUniqueInputSchema,
  })
  .strict();

export const UserVendorRoleUpdateArgsSchema: z.ZodType<Prisma.UserVendorRoleUpdateArgs> = z
  .object({
    select: UserVendorRoleSelectSchema.optional(),
    include: UserVendorRoleIncludeSchema.optional(),
    data: z.union([UserVendorRoleUpdateInputSchema, UserVendorRoleUncheckedUpdateInputSchema]),
    where: UserVendorRoleWhereUniqueInputSchema,
  })
  .strict();

export const UserVendorRoleUpdateManyArgsSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyArgs> = z
  .object({
    data: z.union([
      UserVendorRoleUpdateManyMutationInputSchema,
      UserVendorRoleUncheckedUpdateManyInputSchema,
    ]),
    where: UserVendorRoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export const UserVendorRoleUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserVendorRoleUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        UserVendorRoleUpdateManyMutationInputSchema,
        UserVendorRoleUncheckedUpdateManyInputSchema,
      ]),
      where: UserVendorRoleWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export const UserVendorRoleDeleteManyArgsSchema: z.ZodType<Prisma.UserVendorRoleDeleteManyArgs> = z
  .object({
    where: UserVendorRoleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();
