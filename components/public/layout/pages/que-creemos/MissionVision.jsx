import { sectionTitle, sectionText } from "@/lib/styles";

const values = [
  {
    name: "Nuestra Misión",
    detail:
      "Ser una familia con convicciones firmes en Cristo que comparten su fe con otros.",
  },
  {
    name: "Nuestra Visión",
    detail: (
      <ul className="list-disc list-inside space-y-1 [&>li]:pl-3">
        <li className="pl-2">Ser apasionados por Dios</li>
        <li className="pl-2">Vivir en comunidad auténtica</li>
        <li className="pl-2">Ser discípulos que hacen discípulos</li>
        <li className="pl-2">Servir a otros con nuestros dones</li>
        <li className="pl-2">Proclamar el Evangelio con urgencia</li>
      </ul>
    ),
  },
];

export function MissionVision() {
  return (
    <div className="bg-white text-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-start md:items-start items-center md:justify-evenly gap-8 md:gap-4 lg:gap-0">
          {values.map((value) => (
            <div key={value.name} className="flex-1 max-w-sm">
              <h2 className={`${sectionTitle} text-blue-800 mb-4 text-center`}>{value.name}</h2>
              <div className={sectionText}>{value.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
