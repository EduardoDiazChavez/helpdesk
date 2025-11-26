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

  const requestTypes = ["Mantenimiento", "Soporte Tecnico"];
  await Promise.all(
    requestTypes.map((name) =>
      prisma.requestType.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const processes = [
    {
      id: "DI-1",
      code: "DI",
      name: "Direccion",
      description: "Descripción del proceso 1",
    },
    {
      id: "GI-1",
      code: "GI",
      name: "Gestion Interna",
      description: "Descripción del proceso 2",
    },
    {
      id: "AF-1",
      code: "AF",
      name: "Administración Finanzas",
      description: "Descripción del proceso 3",
    },
    {
      id: "AP-1",
      code: "AP",
      name: "Atención al Público",
      description: "Descripción del proceso 4",
    },
    {
      id: "AR-1",
      code: "AR",
      name: "Asuntos Regulatorios",
      description: "Descripción del proceso 5",
    },
    {
      id: "CO-1",
      code: "CO",
      name: "Compras",
      description: "Descripción del proceso 6",
    },
    {
      id: "CS-1",
      code: "CS",
      name: "Comsalud",
      description: "Descripción del proceso 7",
    },
    {
      id: "FA-1",
      code: "FA",
      name: "Farmacia",
      description: "Descripción del proceso 8",
    },
    {
      id: "ME-1",
      code: "ME",
      name: "Mercadeo",
      description: "Descripción del proceso 9",
    },
    {
      id: "MS-1",
      code: "MS",
      name: "Mantenimiento y Saneamiento",
      description: "Descripción del proceso 10",
    },
    {
      id: "AL-1",
      code: "AL",
      name: "Almacén",
      description: "Descripción del proceso 11",
    },
    {
      id: "PC-1",
      code: "PC",
      name: "Prevención y Control de Pérdidas",
      description: "Descripción del proceso 12",
    },
    {
      id: "TE-1",
      code: "TE",
      name: "Tecnología",
      description: "Descripción del proceso 13",
    },
    {
      id: "TH-1",
      code: "TH",
      name: "Talento Humano",
      description: "Descripción del proceso 14",
    },
    {
      id: "GS-1",
      code: "GS",
      name: "Gestión de Servicios para el cuidado de la salud",
      description: "Descripción del proceso 15",
    },
    {
      id: "GE-1",
      code: "GE",
      name: "Gestión de Estudios para el cuidado de la salud",
      description: "Descripción del proceso 15",
    },
    {
      id: "AC-1",
      code: "AC",
      name: "Aseguramiento de la Calidad",
      description: "Descripción del proceso 15",
    },
    {
      id: "CV-1",
      code: "CV",
      name: "Comercialización y Ventas",
      description: "Descripción del proceso 15",
    },
    {
      id: "SST-1",
      code: "SST",
      name: "Seguridad y Salud en el Trabajo",
      description: "Descripción del proceso 15",
    },
  ];

  await Promise.all(
    processes.map((p) =>
      prisma.process.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          description: p.description,
          code: p.code,
        },
        create: {
          id: p.id,
          name: p.name,
          description: p.description,
          code: p.code,
        },
      })
    )
  );

  const priorities = [
    { name: "Baja - No afecta operaciones", number: 1 },
    { name: "Media - Afecta parcialmente", number: 2 },
    { name: "Alta - Afecta operaciones importantes", number: 3 },
    { name: "Urgente - Afecta atención al paciente", number: 4 },
  ];
  await Promise.all(
    priorities.map((p) =>
      prisma.priority.upsert({
        where: { name: p.name },
        update: { number: p.number },
        create: { name: p.name, number: p.number },
      })
    )
  );

  const requestStatuses = ["Pending", "Resolved"];
  await Promise.all(
    requestStatuses.map((name) =>
      prisma.requestStatus.upsert({
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
