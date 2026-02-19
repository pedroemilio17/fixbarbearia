require("dotenv").config();
const supabase = require("./supabaseClient");

(async () => {
  const { data, error } = await supabase.from("services").select("*").limit(1);
  if (error) {
    console.error("ERRO SUPABASE:", error);
    process.exit(1);
  }
  console.log("OK Supabase. Primeira linha:", data?.[0] || null);
})();
