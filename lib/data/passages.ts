import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { getTodayEcuadorDateLiteral } from "@/lib/date-utils";

export async function getPassages() {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lom_passages")
    .select("*")
    .order("week_number", { ascending: false })
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error fetching passages:", error);
    return [];
  }
  return data;
}

export async function getPassagesByWeek(weekNumber: number) {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lom_passages")
    .select("*")
    .eq("week_number", weekNumber)
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error fetching passages by week:", error);
    return [];
  }
  return data;
}

export async function getLatestWeekPassages() {
  noStore();
  const supabase = await createClient();
  
  // Fecha literal YYYY-MM-DD en Ecuador
  const today = getTodayEcuadorDateLiteral();

  const { data: currentWeek, error: currentWeekError } = await supabase
    .from("lom_passages")
    .select("week_number")
    .lte("week_start_date", today) // 👈 DATE vs DATE (literal)
    .order("week_start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentWeekError) {
    console.error("Error fetching current week number:", currentWeekError);
  }

  let targetWeekNumber;
  if (currentWeek) {
    targetWeekNumber = currentWeek.week_number;
  } else {
    const { data: latestWeek } = await supabase
      .from("lom_passages")
      .select("week_number")
      .order("week_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestWeek) return [];
    targetWeekNumber = latestWeek.week_number;
  }

  return getPassagesByWeek(targetWeekNumber);
}
