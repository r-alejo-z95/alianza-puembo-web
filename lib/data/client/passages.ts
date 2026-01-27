import { createClient } from "@/lib/supabase/client";
import { getNowInEcuador, formatEcuadorDateForInput } from "@/lib/date-utils";

export async function getThisWeekPassages() {
  const supabase = createClient();
  const today = formatEcuadorDateForInput(getNowInEcuador());
  const endOfToday = `${today}T23:59:59-05:00`;

  // Try to find the week that is currently in progress
  const { data: currentWeeks, error: currentWeekError } = await supabase
    .from("lom_passages")
    .select("week_number")
    .eq('is_archived', false)
    .lte("week_start_date", endOfToday)
    .order("week_start_date", { ascending: false })
    .limit(1);

  if (currentWeekError) {
    console.error("Error fetching current week number:", currentWeekError);
  }

  let targetWeekNumber;

  if (currentWeeks && currentWeeks.length > 0) {
    targetWeekNumber = currentWeeks[0].week_number;
  } else {
    // Fallback: If no week has started yet, get the one with the highest week number
    const { data: latestWeeks, error: latestWeekError } = await supabase
      .from("lom_passages")
      .select("week_number")
      .eq('is_archived', false)
      .order("week_number", { ascending: false })
      .limit(1);

    if (latestWeekError || !latestWeeks || latestWeeks.length === 0) {
      return [];
    }
    targetWeekNumber = latestWeeks[0].week_number;
  }

  const { data, error } = await supabase
    .from("lom_passages")
    .select("*")
    .eq('is_archived', false)
    .eq("week_number", targetWeekNumber)
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error fetching passages by week:", error);
    return [];
  }
  return data;
}