import { PrismaClient } from "@prisma/client";

import { getDefaultFreePlan } from "../src/lib/plans";

const prisma = new PrismaClient();

async function main() {
  const defaultFreePlan = getDefaultFreePlan();

  await prisma.plan.upsert({
    where: { name: defaultFreePlan.name },
    update: defaultFreePlan,
    create: defaultFreePlan
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed plans.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
