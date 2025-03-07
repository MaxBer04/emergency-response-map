FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json .
COPY bun.lock* .

RUN bun install

# Copy the rest of the app
COPY . .

# Different commands for dev/prod
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"dev\" ]; then bun --watch src/index.ts; else bun build --target=bun src/index.ts --outdir ./dist && bun dist/index.js; fi"]
