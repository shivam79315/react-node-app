import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.pricingPlan.createMany({
    data: [
      {
        name: "Free",
        description: "Basic access with limited features",
        price: 0.0,
        currency: "USD",
        interval: "month",
      },
      {
        name: "Pro",
        description: "Unlock all premium features",
        price: 9.99,
        currency: "USD",
        interval: "month",
      }
    ],
    skipDuplicates: true, // don’t insert again if already exists
  })
}

main()
  .then(() => console.log("Seeding complete"))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
