import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms')
    .select('title, description')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return {
      title: 'Formulario no encontrado',
      description: 'No se pudo encontrar el formulario solicitado.',
    };
  }

  return {
    title: data.title,
    description: data.description,
  };
}

export default function FormLayout({ children }) {
  return <>{children}</>;
}
