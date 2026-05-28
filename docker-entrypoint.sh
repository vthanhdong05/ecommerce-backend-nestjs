# chạy migration database -> sau đó mới start app
#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting app..."
exec node dist/main