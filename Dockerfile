# 生产镜像：Node 22 原生运行 TypeScript（类型剥离内置），无需 node_modules
# 密钥走环境变量（docker compose 的 env_file），不烧进镜像；state 挂卷持久化
FROM node:22-slim

WORKDIR /app

# 仅复制运行时所需（排除 .env / state / node_modules）
COPY package.json package-lock.json ./

# 装依赖：运行时依赖是 ws（WebSocket 服务端），不装的话 CMD 一启动就 ERR_MODULE_NOT_FOUND
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY web ./web
COPY assets ./assets
COPY scripts ./scripts

ENV NODE_ENV=production \
    WANGDACHUI_PORT=7620

EXPOSE 7620

# 数据目录：volume 挂载点
VOLUME ["/app/state"]

CMD ["node", "src/server.ts"]
