import { Band, Rv, Split } from '../components/ui'

const REFS = [
  ['Organización Mundial de la Salud (2026). Enfermedad Pulmonar Obstructiva Crónica.', 'https://www.who.int/es/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)'],
  ['Ministerio de Salud y Protección Social (2025). Resumen Ejecutivo ENDS 2025.', 'https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/VS/ED/GCFI/resumen-ejecutivo-ensm-2025.pdf'],
  ['National Institute on Drug Abuse (2020). Vaping Devices DrugFacts.', 'https://nida.nih.gov/publications/drugfacts/vaping-devices-electronic-cigarettes'],
  ['Martínez-Larenas, M. V., et al. (2022). Efectos fisiopatológicos del cigarro electrónico. Neumol. cir. tórax, 81(2).', 'https://doi.org/10.35366/108498'],
  ['National Heart, Lung, and Blood Institute (2024). EPOC: ¿Qué es la EPOC?', 'https://www.nhlbi.nih.gov/es/salud/epoc'],
  ['Rivero, D. (2019). Nociones fundamentales de la espirometría. Rev. alergia Méx., 66(1).', 'https://doi.org/10.29262/ram.v66i1.536'],
  ["West, J. B., & Luks, A. M. (2021). West's Respiratory Physiology.", null],
]

export default function References() {
  return (
    <Band id="referencias" theme="refs">
      <h2 className="text-4xl sm:text-5xl"><Split text="*Referencias*" /></h2>
      <ol className="mt-8 grid gap-x-12 gap-y-3 text-sm text-muted md:grid-cols-2">
        {REFS.map(([t, u], i) => (
          <Rv as="li" key={t} d={i * 70}>
            {u ? <a className="hov ulink" href={u} target="_blank" rel="noopener noreferrer">{t}</a> : t}
          </Rv>
        ))}
      </ol>
      <Rv as="p" d={400} className="mt-10 max-w-2xl text-sm italic text-muted">Modelos didácticos y cualitativos; las curvas de espirometría pasan por los FEV₁ y FVC medidos. Contenido educativo, no sustituye una consulta médica.</Rv>
      <footer className="mt-6 text-sm font-semibold">Pontificia Universidad Javeriana, Química Farmacéutica</footer>
    </Band>
  )
}
