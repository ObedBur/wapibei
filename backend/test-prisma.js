const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const search = "Sans";
  const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nameFields = ['name', 'nameFr', 'nameEn', 'nameSw'];
  const regexOne = (paramIdx) => nameFields.map(f => `COALESCE("${f}", '') ~* $${paramIdx}`).join(' OR ');

  const conditions = terms.map((_, i) => `(${regexOne(i + 1)})`);
  const joinedConditions = conditions.join(' AND ');

  const nameOnlyConditions = terms.map((_, i) => `COALESCE("name", '') ~* $${i + 1}`);
  const joinedNameConditions = nameOnlyConditions.join(' AND ');

  const params = terms.map(term => `\\m${escapeRegex(term)}`);
  params.push(`\\m${escapeRegex(search.trim())}`);
  const exactMatchParam = params.length;

  const queryString = `
    SELECT id FROM "Product"
    WHERE "isPublic" = true
    AND ${joinedConditions}
    ORDER BY
      CASE
        WHEN "name" ~* $${exactMatchParam} THEN 2
        WHEN ${joinedNameConditions} THEN 1
        ELSE 0
      END DESC,
      "createdAt" DESC
    LIMIT 20
  `;

  try {
    console.log("Querying...");
    const res = await prisma.$queryRawUnsafe(queryString, ...params);
    console.log("Success:", res.length);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

main().finally(() => prisma.$disconnect());
