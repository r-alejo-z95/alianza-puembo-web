import { pageSection, pageHeaderContainer, pageTitle, pageDescription, sectionTitle, subSectionTitle } from "@/lib/styles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Banknote } from "lucide-react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className={sectionTitle}>Diezmos & Ofrendas</CardTitle>
              <CardDescription>Puedes realizar un depósito o transferencia a la siguiente cuenta:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-bold text-base">Banco del Pacífico</p>
                <p><strong>Cuenta corriente:</strong> #7469640</p>
                <p><strong>A nombre de:</strong> Iglesia Evangélica Ecuatoriana</p>
                <p><strong>RUC:</strong> 0991263217001</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-base">Banco del Pichincha</p>
                <p><strong>Cuenta corriente:</strong> #2100268002</p>
                <p><strong>A nombre de:</strong> Iglesia Evangélica Ecuatoriana</p>
                <p><strong>RUC:</strong> 0991263217001</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Mail className="h-4 w-4 text-(--puembo-green)" />
                <p><strong>Email:</strong> contabilidadiglesia@alianzapuembo.org</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className={sectionTitle}>Pago Eventos</CardTitle>
              <CardDescription>Puedes realizar un depósito o transferencia a la siguiente cuenta:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-bold text-base">Banco del Pichincha</p>
                <p><strong>Cuenta ahorros:</strong> #2208033009</p>
                <p><strong>A nombre de:</strong> Iglesia Alianza Puembo</p>
                <p><strong>RUC:</strong> 0991263217001</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Mail className="h-4 w-4 text-(--puembo-green)" />
                <p><strong>Email:</strong> contabilidadiglesia@alianzapuembo.org</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
