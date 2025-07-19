import { sectionPy, sectionTitle } from "@/lib/styles";

export function Declaration() {
  return (
    <div className="bg-(--puembo-green) text-white">
      <div className={`container mx-auto px-4 text-center ${sectionPy}`}>
        <h2 className={`${sectionTitle} mb-4`}>Parte de un Movimiento Mayor</h2>
        <p className="text-sm md:text-base lg:text-lg max-w-3xl mx-auto">
          Formamos parte de la Alianza Cristiana y Misionera, un movimiento
          enfocado en vivir y proclamar el evangelio de Jesucristo al mundo,
          con una vida centrada en Él y una misión clara hacia las naciones.
        </p>
      </div>
    </div>
  )
}
