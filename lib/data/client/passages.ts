import { createClient } from '@/lib/supabase/client';

export async function getLatestWeekPassages() {
  const supabase = createClient();
  const { data: latestWeeks, error: latestWeekError } = await supabase
    .from('lom_passages')
    .select('week_number')
    .order('week_number', { ascending: false })
    .limit(1);

  if (latestWeekError) {
    console.error('Error fetching latest week number:', latestWeekError);
    return [];
  }

  if (!latestWeeks || latestWeeks.length === 0) {
    return []; // No passages found, return empty
  }

  const latestWeekNumber = latestWeeks[0].week_number;

  const { data, error } = await supabase
    .from('lom_passages')
    .select('*')
    .eq('week_number', latestWeekNumber)
    .order('day_of_week', { ascending: true });

  if (error) {
    console.error('Error fetching passages by week:', error);
    return [];
  }
  return data;
}