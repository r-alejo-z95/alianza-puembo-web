
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This page will fetch the latest LOM post and redirect to its dynamic route.
export default async function LomRedirectPage() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from('lom_posts')
    .select('slug')
    .order('publication_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // If no posts are found, redirect to the main resources page or a specific 'not-found' page.
    // For now, we'll redirect to the parent resources page.
    redirect('/recursos');
  }

  // Redirect to the latest post's slugified URL.
  redirect(`/recursos/lom/${data.slug}`);
}
