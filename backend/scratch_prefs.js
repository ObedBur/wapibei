const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['obedburindi@gmail.com', 'forcenzulo@gmail.com'] } },
    include: { notificationPrefs: true }
  });
  
  for (const u of users) {
    if (!u.notificationPrefs) {
       await prisma.notificationPreference.create({
         data: { userId: u.id, ordersSms: true, marketingSms: true, securitySms: true, systemSms: true, ordersEmail: true }
       });
       console.log('Created prefs for', u.email);
    } else if (!u.notificationPrefs.ordersSms) {
       await prisma.notificationPreference.update({
         where: { id: u.notificationPrefs.id },
         data: { ordersSms: true }
       });
       console.log('Updated prefs for', u.email);
    } else {
       console.log('Prefs already OK for', u.email);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
