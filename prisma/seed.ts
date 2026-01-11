import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/index.js"; // adjust relative path

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const { SUPERUSER_USERNAME, SUPERUSER_EMAIL, SUPERUSER_PASSWORD, SUPERUSER_NAME } = process.env;

  if (!SUPERUSER_USERNAME || !SUPERUSER_EMAIL || !SUPERUSER_PASSWORD || !SUPERUSER_NAME) {
    throw new Error("Superuser env variables not set!");
  }

  const hashedPassword = await bcrypt.hash(SUPERUSER_PASSWORD, 10);

  const superuser = await prisma.user.upsert({
    where: { email: SUPERUSER_EMAIL },
    update: {},
    create: {
      username: SUPERUSER_USERNAME,
      email: SUPERUSER_EMAIL,
      password: hashedPassword,
      isAdmin: true,
      name: SUPERUSER_NAME,
    },
  });

  console.log("Superuser created:", superuser);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
