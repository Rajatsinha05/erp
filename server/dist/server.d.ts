import 'express-async-errors';
import { Server as SocketIOServer } from 'socket.io';
declare const app: import("express-serve-static-core").Express;
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare let io: SocketIOServer | null;
export { app, httpServer, io };
//# sourceMappingURL=server.d.ts.map