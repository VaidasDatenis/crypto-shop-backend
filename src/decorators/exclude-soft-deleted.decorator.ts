import { SetMetadata } from '@nestjs/common';

// default True - to exclude soft-deleted records.
export const ExcludeSoftDeleted = (exclude: boolean = true) => SetMetadata('excludeSoftDeleted', exclude);
