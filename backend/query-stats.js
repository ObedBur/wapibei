require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const topVendors = await prisma.product.groupBy({
    by: ['userId'],
    _sum: { totalSales: true },
    _count: { id: true },
    orderBy: { _sum: { totalSales: 'desc' } },
    take: 10,
  });

  const vendorIds = topVendors.map(function(v) { return v.userId; });
  const users = await prisma.user.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, fullName: true, boutiqueName: true, trustScore: true },
  });
  const userMap = {};
  users.forEach(function(u) { userMap[u.id] = u; });

  console.log('=== TOP VENDEURS PAR VENTES ===');
  var rank = 1;
  for (var i = 0; i < topVendors.length; i++) {
    var v = topVendors[i];
    var u = userMap[v.userId] || {};
    var name = (u.boutiqueName || u.fullName || v.userId).substring(0, 35);
    var pad = name + '                                   '.substring(name.length);
    console.log('  #' + rank + ' ' + pad + ' | ventes: ' + (v._sum.totalSales || 0) + ' | produits: ' + v._count.id + ' | trust: ' + (u.trustScore || '?'));
    rank++;
  }

  var total = await prisma.product.aggregate({ _sum: { totalSales: true } });
  console.log('\n  TOTAL VENTES PLATEFORME: ' + (total._sum.totalSales || 0));

  var orders = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalPrice: true },
  });
  console.log('\n=== COMMANDES PAR STATUT ===');
  for (var j = 0; j < orders.length; j++) {
    var o = orders[j];
    console.log('  ' + o.status + ' | count: ' + o._count.id + ' | total: ' + (o._sum.totalPrice || 0) + '$');
  }

  var totalOrders = await prisma.order.aggregate({ _count: { id: true }, _sum: { totalPrice: true } });
  console.log('\n  TOTAL COMMANDES: ' + totalOrders._count.id + ' | REVENUS: ' + (totalOrders._sum.totalPrice || 0) + '$');

  await prisma.$disconnect();
}
main().catch(function(e) { console.error(e); process.exit(1); });
