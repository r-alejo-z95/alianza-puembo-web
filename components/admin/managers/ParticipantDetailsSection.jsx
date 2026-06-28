import { Users } from "lucide-react";
import { normalizeParticipantDetails } from "@/lib/forms/participant-details.mjs";

export default function ParticipantDetailsSection({ participantDetails = [] }) {
  const participants = normalizeParticipantDetails(participantDetails);
  if (!participants.length) return null;

  return (
    <section className="mb-8 border-y border-gray-100 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Users className="h-4 w-4 shrink-0 text-[var(--puembo-green)]" />
          <h3 className="truncate text-[10px] font-black uppercase tracking-widest text-gray-700">
            Inscritos
          </h3>
        </div>
        <span className="shrink-0 text-[10px] font-black tabular-nums text-gray-400">
          {participants.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
        {participants.map((participant, participantIndex) => {
          const number = participant.index || participantIndex + 1;

          return (
            <article key={number} className="min-w-0 border-l-2 border-emerald-200 pl-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                Inscrito {number}
              </p>
              <dl className="space-y-3">
                {Object.entries(participant.answers).map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-[9px] font-black uppercase tracking-wider text-gray-300">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-sm leading-relaxed text-gray-800">
                      {value || "No proporcionado"}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
