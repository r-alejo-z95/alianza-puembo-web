import PrayerRequestManager from '@/components/PrayerRequestManager';

export default function OracionAdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestionar Peticiones de Oración</h1>
      <PrayerRequestManager />
    </div>
  );
}