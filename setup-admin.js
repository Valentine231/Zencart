const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:password@127.0.0.1:5432/zencart?sslmode=disable" } }
});

const CLERK_SECRET = "sk_test_6ucIrkrzV1OpAvwHcNUGzWcG7ZMPZz1gZdZo92Gjip";
const TARGET_EMAIL = "ugwuvalentine917@gmail.com";
const NEW_PASSWORD = "DragonballGT";

async function main() {
  // ── 1. Promote in DB ──────────────────────────────────────────────────────
  const dbUser = await prisma.user.findFirst({ where: { email: TARGET_EMAIL } });

  if (!dbUser) {
    console.log(`⚠️  No DB user found with email ${TARGET_EMAIL}.`);
    console.log("   The user needs to sign in to the app once before being promoted.");
    console.log("   Attempting to create a placeholder DB record...");

    // We'll create them after we find their Clerk ID below
  } else {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: "ADMIN" },
    });
    console.log(`✅ DB: ${TARGET_EMAIL} promoted to ADMIN (DB id: ${dbUser.id})`);
  }

  // ── 2. Find or create Clerk user & set password ────────────────────────────
  // Search for user by email in Clerk
  const searchRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(TARGET_EMAIL)}`,
    {
      headers: { Authorization: `Bearer ${CLERK_SECRET}`, "Content-Type": "application/json" },
    }
  );

  const searchData = await searchRes.json();
  console.log("Clerk search result:", JSON.stringify(searchData, null, 2));

  let clerkUserId = null;

  if (Array.isArray(searchData) && searchData.length > 0) {
    clerkUserId = searchData[0].id;
    console.log(`Found Clerk user: ${clerkUserId}`);

    // Update their password
    const updateRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${CLERK_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: NEW_PASSWORD }),
    });
    const updateData = await updateRes.json();
    if (updateRes.ok) {
      console.log(`✅ Clerk: Password updated for ${TARGET_EMAIL}`);
    } else {
      console.error("❌ Clerk password update failed:", updateData);
    }
  } else {
    // Create new Clerk user
    console.log(`No Clerk user found. Creating one...`);
    const createRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: { Authorization: `Bearer ${CLERK_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: [TARGET_EMAIL],
        password: NEW_PASSWORD,
        skip_password_checks: true,
      }),
    });
    const createData = await createRes.json();
    if (createRes.ok) {
      clerkUserId = createData.id;
      console.log(`✅ Clerk: Created user ${TARGET_EMAIL} (id: ${clerkUserId})`);
    } else {
      console.error("❌ Clerk user creation failed:", createData);
    }
  }

  // ── 3. Upsert DB record with clerkId if we have it ────────────────────────
  if (clerkUserId) {
    await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: { role: "ADMIN", email: TARGET_EMAIL },
      create: { clerkId: clerkUserId, email: TARGET_EMAIL, role: "ADMIN" },
    });
    console.log(`✅ DB synced: clerkId=${clerkUserId} → role=ADMIN`);
  }

  console.log("\n🎉 Done! Admin setup complete.");
  console.log(`   Email:    ${TARGET_EMAIL}`);
  console.log(`   Password: ${NEW_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
