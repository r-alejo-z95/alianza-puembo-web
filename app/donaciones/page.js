import { pageSection, pageHeaderContainer, pageTitle, pageDescription, sectionTitle } from "@/lib/styles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const commonDetails = {
  ruc: "0991263217001",
  email: "contabilidadiglesia@alianzapuembo.org",
};

const donationSections = [
  {
    title: "Diezmos & Ofrendas",
    description: "Puedes realizar un depósito o transferencia a la siguiente cuenta:",
    accounts: [
      {
        bank: "Banco del Pacífico",
        type: "Cuenta corriente",
        number: "#7469640",
        name: "Iglesia Evangélica Ecuatoriana",
      },
      {
        bank: "Banco del Pichincha",
        type: "Cuenta corriente",
        number: "#2100268002",
        name: "Iglesia Evangélica Ecuatoriana",
      },
    ],
  },
  {
    title: "Pago Eventos",
    description: "Puedes realizar un depósito o transferencia a la siguiente cuenta:",
    accounts: [
      {
        bank: "Banco del Pichincha",
        type: "Cuenta ahorros",
        number: "#2208033009",
        name: "Iglesia Alianza Puembo",
      },
    ],
  },
];

export default function Donaciones() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Donaciones
        </h1>
        <p className={pageDescription}>
          Tu generosidad nos ayuda a seguir extendiendo el Reino de Dios.
        </p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg italic mb-8 max-w-3xl mx-auto">
          &quot;Traigan íntegro el diezmo para los fondos del templo, y así habrá alimento en mi casa. Pruébenme en esto —dice el Señor Todopoderoso—, y vean si no abro las compuertas del cielo y derramo sobre ustedes bendición hasta que sobreabunde.&rdquo;
          <br />
          <span className="font-semibold">Malaquías 3:10</span>
        </p>

        <div className="mb-8">
          <p className="text-lg">Para todas las transacciones:</p>
          <p className="text-lg"><strong>RUC:</strong> {commonDetails.ruc}</p>
          <div className="flex flex-col md:flex-row space-x-2 text-lg">
            <div className="flex flex-row items-center gap-1">
              <Mail className="h-5 w-5 text-(--puembo-green)" />
              <p><strong>Email:</strong></p>
            </div>
            <p>{commonDetails.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {donationSections.map((section, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader>
                <CardTitle className={sectionTitle}>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {section.accounts.map((account, accIndex) => (
                  <div key={accIndex} className="space-y-1">
                    <p className="font-bold text-base">{account.bank}</p>
                    <p><strong>{account.type}:</strong> {account.number}</p>
                    <p><strong>A nombre de:</strong> {account.name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}