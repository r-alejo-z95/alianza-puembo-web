import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sectionTitle, sectionText, contentSection } from "@/lib/styles";

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

export function DonationAccountsDetailsSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Cuentas Bancarias
      </h2>
      <div className="mb-8 max-w-3xl mx-auto text-center">
        <p className={sectionText}>Para todas las transacciones:</p>
        <p className={sectionText}><strong>RUC:</strong> {commonDetails.ruc}</p>
        <div className="flex flex-col md:flex-row space-x-2 text-lg justify-center items-center">
          <div className="flex flex-row items-center gap-1">
            <Mail className="h-5 w-5 text-puembo-green" />
            <p><strong>Email:</strong></p>
          </div>
          <p className={sectionText}>{commonDetails.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
    </section>
  );
}