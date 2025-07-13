import { Badge } from '@/components/ui/badge';

export function PrayerWallSection({ requests }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="grid place-items-center md:grid-cols-2 lg:grid-cols-3 gap-8">
        {requests.map((req) => (
          <div key={req.id} className="text-gray-800 border-r-4 min-h-20 w-3xs max-w-xs border-emerald-500 pb-4 px-2">
            <div className="pt-2">
              <p className="text-muted-foreground wrap-break-word">{req.request_text}</p>
            </div>
            <div className="flex justify-between mt-4">
              <span className="text-sm text-gray-500">
                {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }, { timeZone: 'America/Guayaquil' })}
              </span>
              <div className="flex items-center gap-2">
                {!req.is_anonymous && req.name && <Badge variant="outline" className="whitespace-normal">{req.name}</Badge>}
                {req.is_anonymous && <Badge variant="secondary">Anónimo</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}