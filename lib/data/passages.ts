
import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

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

export async function getPassagesByWeek(weekNumber) {
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
  const { data: latestWeek, error: latestWeekError } = await supabase
    .from('lom_passages')
    .select('week_number')
    .order('week_number', { ascending: false })
    .limit(1)
    .single();

  if (latestWeekError || !latestWeek) {
    console.error('Error fetching latest week number:', latestWeekError);
    return [];
  }

  return getPassagesByWeek(latestWeek.week_number);
}
