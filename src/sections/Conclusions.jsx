import { Band, Head, Rv } from '../components/ui'

const ITEMS = [
  ['Función pulmonar', 'A partir de las espirometrías se identificaron diferencias entre los dos voluntarios. El que no tenía antecedentes de vapeo presentó una capacidad vital forzada cercana al valor teórico, aunque su relación FEV₁/FVC quedó por debajo del límite inferior de referencia. El segundo voluntario presentó valores menores de FEV₁ y de la relación FEV₁/FVC, coherentes con las alteraciones obstructivas asociadas a su diagnóstico de EPOC.'],
  ['Mecánica del tejido', 'Las propiedades mecánicas del tejido pulmonar, como la elasticidad y el retroceso elástico, son fundamentales para la ventilación. En la EPOC, la pérdida de elasticidad y del soporte de las vías pequeñas dificulta la salida del aire al espirar y favorece el atrapamiento aéreo. Así fue posible relacionar las alteraciones de la espirometría con los principios físicos del sistema respiratorio.'],
  ['Laplace y surfactante', 'El análisis de la ley de Laplace mostró la importancia de la tensión superficial y del surfactante en la estabilidad de los alvéolos: baja la tensión superficial en la interfaz aire-líquido, evita el colapso alveolar y facilita la expansión pulmonar. El análisis de la curva presión-volumen permitió comprender cómo se relacionan los cambios de presión con las variaciones de volumen al inspirar y espirar.'],
  ['Salbutamol', 'El salbutamol relaja el músculo liso de las vías respiratorias y aumenta su radio, lo que facilita el paso del aire. En el segundo voluntario el FEV₁ aumentó de 0,95 L a 1,02 L, pero ese incremento fue pequeño y por sí solo no permite establecer una respuesta broncodilatadora clínicamente significativa. El medicamento puede mejorar el flujo de aire, pero no revierte la pérdida de elasticidad ni reconstruye el tejido afectado por la EPOC.'],
  ['Objetivo cumplido', 'Se cumplió el objetivo de informar a los participantes sobre la mecánica pulmonar y las alteraciones relacionadas con las enfermedades respiratorias. Se evidenció en la actividad interactiva realizada al final de la presentación: más del 90 % de los participantes respondió correctamente las preguntas del juego. Los resultados permiten considerar que la información fue comprendida por la mayoría y que la actividad ayudó a reforzar lo aprendido.'],
]

export default function Conclusions() {
  return (
    <Band id="conclusiones" theme="concl">
      <Head n="05" label="Conclusiones" title="Lo que *aprendimos*" />
      <ol className="mt-10 grid gap-x-14 gap-y-9 md:grid-cols-2">
        {ITEMS.map(([t, d], i) => (
          <Rv as="li" key={t} d={(i % 2) * 80}>
            <h3 className="flex items-baseline gap-3 text-xl font-extrabold"><span className="num text-sm" style={{ color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</span>{t}</h3>
            <p className="mt-1.5 text-ink/80">{d}</p>
          </Rv>
        ))}
      </ol>
    </Band>
  )
}
