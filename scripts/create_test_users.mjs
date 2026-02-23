import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUsers() {
  try {
    console.log("[v0] Creating test users in Supabase...")

    // User 1: Shravani
    const { data: user1, error: error1 } = await supabase.auth.admin.createUser({
      email: "shravani@sonata-software.com",
      password: "TestPassword123!",
      email_confirm: true,
      user_metadata: {
        name: "Shravani",
        assigned_customers: ["SSNA-0014", "SSNA-0021", "SSNA-0003"],
      },
    })

    if (error1) {
      console.error("[v0] Error creating Shravani:", error1.message)
    } else {
      console.log("[v0] ✅ Created user: shravani@sonata-software.com")
      console.log("    Password: TestPassword123!")
    }

    // User 2: Venki
    const { data: user2, error: error2 } = await supabase.auth.admin.createUser({
      email: "venki@sonata-software.com",
      password: "TestPassword123!",
      email_confirm: true,
      user_metadata: {
        name: "Venki",
        assigned_customers: ["SSSG-0007", "OB-0022", "OB-0004", "OB-0005"],
      },
    })

    if (error2) {
      console.error("[v0] Error creating Venki:", error2.message)
    } else {
      console.log("[v0] ✅ Created user: venki@sonata-software.com")
      console.log("    Password: TestPassword123!")
    }

    console.log("\n[v0] ✅ Test users created successfully!")
    console.log("[v0] You can now login with:")
    console.log("    Email: shravani@sonata-software.com")
    console.log("    Password: TestPassword123!")
    console.log("[v0] Or:")
    console.log("    Email: venki@sonata-software.com")
    console.log("    Password: TestPassword123!")
  } catch (error) {
    console.error("[v0] Error:", error)
    process.exit(1)
  }
}

createTestUsers()
