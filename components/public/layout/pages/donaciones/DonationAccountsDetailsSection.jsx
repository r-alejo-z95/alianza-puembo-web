import { Mail } from "lucide-react";
import { cn } from "@/lib/utils.ts";
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
        number: "7469640",
        name: "Iglesia Evangélica Ecuatoriana",
      },
      {
        bank: "Banco del Pichincha",
        type: "Cuenta corriente",
        number: "2100268002",
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
        number: "2208033009",
        name: "Iglesia Alianza Puembo",
      },
    ],
  },
];

export function DonationAccountsDetailsSection() {
  return (
    <section className={cn(contentSection, "bg-white py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center text-(--puembo-green)")}>
        Cuentas Bancarias
      </h2>
      <div className="mb-8 max-w-3xl mx-auto text-center">
        <p className={sectionText}>Para todas las transacciones:</p>
        <p className={sectionText}><strong>RUC:</strong> {commonDetails.ruc}</p>
        <div className="flex flex-col md:flex-row space-x-2 text-lg justify-center items-center">
          <div className={`flex flex-row items-center gap-1 ${sectionText}`}>
            <Mail className="h-4 w-4" />
            <p>Email:</p>
          </div>
          <p className={sectionText}>{commonDetails.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {donationSections.map((section, index) => (
          <div key={index} className="text-gray-800 mt-6 border-l-4 rounded-none border-(--puembo-green) pl-4 text-sm md:text-base">
            <div>
              <div className={sectionTitle}>{section.title}</div>
              <div className="text-gray-500">{section.description}</div>
            </div>
            <div className="space-y-4 text-sm">
              {section.accounts.map((account, accIndex) => (
                <div key={accIndex} className="space-y-1">
                  <p className="font-bold text-base">{account.bank}</p>
                  <p className="text-gray-500"><strong className="text-gray-600">{account.type}:</strong> {account.number}</p>
                  <p className="text-gray-500"><strong className="text-gray-600">A nombre de:</strong> {account.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}