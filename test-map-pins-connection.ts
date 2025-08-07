import { supabase } from "./client/lib/supabase";

async function testMapPinsConnection() {
  console.log("🔍 Testing map pins database connection...");
  
  try {
    // Test if the table exists by trying to fetch from it
    const { data, error } = await supabase
      .from("map_pins")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Database error:", error);
      if (error.message.includes("relation \"map_pins\" does not exist")) {
        console.log("💡 The map_pins table doesn't exist in your database!");
        console.log("📋 Please run the SQL code from map-pins-schema.sql in your Supabase SQL editor:");
        console.log("   1. Go to your Supabase Dashboard");
        console.log("   2. Navigate to SQL Editor");
        console.log("   3. Create a new query");
        console.log("   4. Copy and paste the contents of map-pins-schema.sql");
        console.log("   5. Click 'Run' to execute the SQL");
        return false;
      }
      throw error;
    }

    console.log("✅ Database connection successful!");
    console.log(`📍 Found ${data?.length || 0} existing pins`);
    return true;

  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return false;
  }
}

// Run the test
testMapPinsConnection();
