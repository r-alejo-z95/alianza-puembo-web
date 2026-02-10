import { createClient, createStaticClient, createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { getTodayEcuadorDateLiteral } from "@/lib/date-utils";

/**
 * @description Cached fetch of all active passages.
 */
const getCachedPassages = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("lom_passages")
      .select("*, profiles(full_name, email)")
      .eq("is_archived", false)
      .order("week_number", { ascending: false })
      .order("day_of_week", { ascending: true });

    if (error) {
      console.error("Error fetching cached passages:", error);
      return [];
    }
    return data;
  },
  ['lom-passages-list'],
  {
    tags: ['lom'], // Shared tag with posts
    revalidate: 86400 // Cache for 24 hours (default) since they rarely change
  }
);

export async function getPassages() {
  return await getCachedPassages();
}

export async function getPassagesByWeek(weekNumber: number) {
  const allPassages = await getCachedPassages();
  return allPassages.filter(p => p.week_number === weekNumber);
}

export async function getLatestWeekPassages() {
  const today = getTodayEcuadorDateLiteral();

  // We can't easily cache this precise logic inside the big list without fetching it, 
  // but we can cache the "current week number" query or just rely on the big list if it's not huge.
  // Given passages are for a year, it's ~365 rows max + archive. It's small enough to filter in memory from getCachedPassages().
  
  // However, determining the "Latest Week" based on date might be better done with a specific query if we want to be super precise 
  // about "current week start date".
  // Let's optimize: Fetch all passages (cached), find the relevant week in memory.
  
  const allPassages = await getCachedPassages();
  if (allPassages.length === 0) return [];

  // Find passage where today >= week_start_date, ordered by week_start_date desc
  // Passages usually share week_start_date for the whole week.
  
  // Unique weeks logic from the list
  // We need to find the latest week_number that has started.
  
  // Sort by week_start_date desc
  const sortedPassages = [...allPassages].sort((a, b) => {
    if (a.week_start_date < b.week_start_date) return 1;
    if (a.week_start_date > b.week_start_date) return -1;
    return 0;
  });

  const currentWeekPassage = sortedPassages.find(p => p.week_start_date <= today);
  
  const targetWeekNumber = currentWeekPassage 
    ? currentWeekPassage.week_number 
    : sortedPassages[0]?.week_number; // Fallback to absolute latest if none started (e.g. future only) or just first in list

  if (targetWeekNumber === undefined) return [];

  return allPassages.filter(p => p.week_number === targetWeekNumber);
}
