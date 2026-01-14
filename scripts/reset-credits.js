require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

async function resetCredits() {
	const email = "adeniyi.olaitanhector@yahoo.com";
	await pool.query(
		'UPDATE "UserProfile" SET credits = 10000 WHERE email = $1',
		[email]
	);
	console.log(`Reset credits to 10,000 for ${email}`);
	process.exit(0);
}

resetCredits().catch((e) => {
	console.error(e);
	process.exit(1);
});
