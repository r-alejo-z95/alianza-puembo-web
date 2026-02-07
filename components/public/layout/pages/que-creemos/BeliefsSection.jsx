import { BeliefBlock } from "./BeliefBlock";
import { sectionTitle, sectionText } from "@/lib/styles";

const beliefs = [
  {
    name: "Cristo nuestro Salvador",
    detail:
      "Creemos que Jesús es el único camino a Dios. A través de su muerte y resurrección, Él ofrece el perdón de los pecados y el regalo de la vida eterna a todo aquel que en Él cree.",
    verse:
      "¡En ningún otro hay salvación! Dios no ha dado ningún otro nombre bajo el cielo, mediante el cual podamos ser salvos.",
    citation: "Hechos 4:12",
    image: "/conocenos/que-creemos/savior-tomb.avif",
  },
  {
    name: "Cristo nuestro Santificador",
    detail:
      "Creemos que después de la salvación, Cristo nos guía a una vida de santidad y obediencia a través de la obra transformadora del Espíritu Santo.",
    verse:
      "Cristo nos hizo justos ante Dios; nos hizo puros y santos y nos liberó del pecado.",
    citation: "1 Corintios 1:30",
    image: "/conocenos/que-creemos/sanctifier-potter.avif",
  },
  {
    name: "Cristo nuestro Sanador",
    detail:
      "Creemos que Jesús tiene el poder de sanar nuestros cuerpos y almas. Oramos por sanidad, confiando en su voluntad soberana y su compasión.",
    verse:
      "Una oración ofrecida con fe sanará al enfermo, y el Señor hará que se recupere; y si ha cometido pecados, será perdonado.",
    citation: "Santiago 5:15",
    image: "/conocenos/que-creemos/healer-prayer.avif",
  },
  {
    name: "Cristo nuestro Rey que Viene",
    detail:
      "Creemos que Jesús regresará en poder y gloria para juzgar al mundo y consumar su reino eterno. Esta es la bendita esperanza que nos impulsa a vivir con propósito y urgencia misional.",
    verse:
      "Y ustedes verán al Hijo del Hombre sentado en el lugar de poder, a la derecha de Dios, y viniendo en las nubes del cielo.",
    citation: "Marcos 14:62",
    image: "/conocenos/que-creemos/coming-king-sky.avif",
  },
];

export function BeliefsSection() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 divide-y divide-gray-200">
        <div className="py-16 md:py-24 text-center">
          <h2 className={`${sectionTitle} text-(--puembo-green)`}>Lo que Creemos</h2>
          <p className={`${sectionText} max-w-3xl mx-auto`}>
            Estas son las cuatro verdades fundamentales que guían nuestra fe y ministerio como parte de la Alianza Cristiana y Misionera.
          </p>
        </div>
        {beliefs.map((belief, index) => (
          <BeliefBlock key={belief.name} belief={belief} index={index} />
        ))}
      </div>
    </div>
  )
}
