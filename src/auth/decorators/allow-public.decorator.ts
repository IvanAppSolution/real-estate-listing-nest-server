import { SetMetadata } from '@nestjs/common';

export const AllowPublic = () => SetMetadata('isPublic', true);