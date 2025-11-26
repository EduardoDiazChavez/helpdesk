const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const roles = [
    "Systems Administrator",
    "Company Administrator",
    "Regular User",
  ];

  await Promise.all(
    roles.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  const sysAdminRole = await prisma.role.findUnique({
    where: { name: "Systems Administrator" },
  });

  const existingCompany = await prisma.company.findFirst({
    where: { name: "Clinica Central" },
  });

  const company =
    existingCompany ??
    (await prisma.company.create({
      data: {
        name: "Clinica Central",
        slug: "clinica-central",
        address: "Sede principal",
      },
    }));
  if (existingCompany && !existingCompany.slug) {
    await prisma.company.update({
      where: { id: existingCompany.id },
      data: { slug: "clinica-central" },
    });
  }

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@clinica.com" },
    update: {
      name: "System",
      lastName: "Administrator",
      password: passwordHash,
      roleId: sysAdminRole.id,
      isActive: true,
    },
    create: {
      email: "admin@clinica.com",
      name: "System",
      lastName: "Administrator",
      password: passwordHash,
      roleId: sysAdminRole.id,
      isActive: true,
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: adminUser.id,
        companyId: company.id,
      },
    },
    update: {
      isAdmin: true,
    },
    create: {
      userId: adminUser.id,
      companyId: company.id,
      isAdmin: true,
    },
  });

  console.log("Seed completed with default roles and system administrator.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
