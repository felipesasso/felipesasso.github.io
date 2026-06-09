/**
 * Preset Dockerfiles for the visualizer — each one chosen to show off a
 * different part of the analysis (multi-stage edges, cache breakers,
 * a well-cached layout, and a three-stage build with multiple artifacts).
 */
window.DFV_EXAMPLES = [
    {
        id: 'go-multistage',
        label: 'Go multi-stage',
        source: `# Build stage: compile a static Go binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server

# Runtime stage: minimal image, just the binary
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/server /usr/local/bin/server
USER nobody
EXPOSE 8080
ENTRYPOINT ["server"]
`,
    },
    {
        id: 'node-naive',
        label: 'Node (cache breakers)',
        source: `FROM node:latest
WORKDIR /app

# Copying everything first means ANY file change
# re-runs npm install on the next build
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]
`,
    },
    {
        id: 'node-optimized',
        label: 'Node (optimized)',
        source: `FROM node:20.12-alpine
WORKDIR /app

# Manifests first: npm ci stays cached until
# the dependencies themselves change
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
`,
    },
    {
        id: 'fullstack',
        label: 'Full-stack (3 stages)',
        source: `# Stage 1: build the React frontend
FROM node:20-alpine AS frontend
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
RUN npm run build

# Stage 2: build the Go API
FROM golang:1.22 AS api
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/api ./cmd/api

# Stage 3: assemble the runtime image
FROM nginx:1.27-alpine
COPY --from=frontend /web/dist /usr/share/nginx/html
COPY --from=api /bin/api /usr/local/bin/api
COPY deploy/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
`,
    },
];
