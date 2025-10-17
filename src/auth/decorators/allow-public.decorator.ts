import { SetMetadata } from "@nestjs/common"

export const AllowPublic = () => {
  
  return SetMetadata('isPublic', true);
}