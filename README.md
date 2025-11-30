1 - Собрать контейнеры - docker compose build

2 - Запустить контейнеры в фоне - docker compose up -d

3 - Применить миграции Prisma к базе данных - docker compose exec backend pnpm prisma migrate deploy

.env

DATABASE_URL="postgresql://postgres:admin@postgres:5432/groupBWT"
PORT=5000
