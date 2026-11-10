import { PrismaClient } from "@prisma/client";
import {
  INITIAL_COMPANY,
  INITIAL_DEPARTMENTS,
  INITIAL_TEMPLATES,
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_BENEFITS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
} from "../lib/data/mock-db";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding OnboardX enterprise database...");

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { slug: INITIAL_COMPANY.slug },
    update: {},
    create: {
      id: INITIAL_COMPANY.id,
      name: INITIAL_COMPANY.name,
      slug: INITIAL_COMPANY.slug,
      logoUrl: INITIAL_COMPANY.logoUrl,
      primaryColor: INITIAL_COMPANY.primaryColor,
      accentColor: INITIAL_COMPANY.accentColor,
    },
  });
  console.log(`✓ Tenant created: ${company.name}`);

  // 2. Create Departments
  for (const dept of INITIAL_DEPARTMENTS) {
    await prisma.department.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: dept.name,
        },
      },
      update: {},
      create: {
        id: dept.id,
        companyId: company.id,
        name: dept.name,
        description: dept.description,
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_DEPARTMENTS.length} departments.`);

  // 3. Create Templates & Tasks
  for (const tpl of INITIAL_TEMPLATES) {
    const createdTpl = await prisma.onboardingTemplate.create({
      data: {
        id: tpl.id,
        companyId: company.id,
        title: tpl.title,
        description: tpl.description,
        targetRole: tpl.targetRole,
      },
    });

    for (let i = 0; i < tpl.tasks.length; i++) {
      const task = tpl.tasks[i];
      await prisma.task.create({
        data: {
          id: task.id,
          templateId: createdTpl.id,
          title: task.title,
          description: task.description,
          category: task.category,
          dueDays: task.dueDays,
          order: i,
        },
      });
    }
  }
  console.log(`✓ Seeded ${INITIAL_TEMPLATES.length} templates with tasks.`);

  // 4. Create Hardware Assets
  for (const asset of INITIAL_ASSETS) {
    await prisma.asset.upsert({
      where: { serialNumber: asset.serialNumber },
      update: {},
      create: {
        id: asset.id,
        companyId: company.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        category: asset.category,
        model: asset.model,
        status: asset.status,
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_ASSETS.length} hardware inventory assets.`);

  // 5. Create Benefits
  for (const ben of INITIAL_BENEFITS) {
    await prisma.benefit.create({
      data: {
        id: ben.id,
        companyId: company.id,
        name: ben.name,
        provider: ben.provider,
        type: ben.type,
        description: ben.description,
        costMonthly: ben.costMonthly,
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_BENEFITS.length} benefit plans.`);

  console.log("✅ OnboardX Enterprise database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
