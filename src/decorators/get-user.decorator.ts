import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data === 'id') {
      return user?.sub;
    }
    return data ? user?.[data] : user;
  },
);
// console.log("DATA", data);
// console.log("USER", user);
// DATA id
// USER {
//   sub: '5311dd27-3d1d-49cd-8967-9369a03339f2',
//   walletAddress: '0x6707DDA128De5ba185B30a000000000000000000',
//   iat: 1713175623,
//   exp: 1713175743
// }
