
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notAvailableText, contentSection } from '@/lib/styles';
import { PageHeader } from "@/components/public/layout/pages/PageHeader";


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
    return (
      <section>
        <PageHeader
          title="Devocionales LOM"
          description="Profundiza en la lectura y meditación de la Biblia."
          imageUrl="/recursos/lom/Lom.png"
          imageAlt="Nubes en el cielo con luz del sol"
        />

        <div className={contentSection}>
          <p className={notAvailableText}>
            No hay devocionales disponibles.
          </p>
        </div>
      </section>
    );
  }

  // Redirect to the latest post's slugified URL.
  redirect(`/recursos/lom/${data.slug}`);
}
