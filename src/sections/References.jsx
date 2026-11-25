import { Band, Rv, Split } from '../components/ui'

const REFS = [
  ['Organización Mundial de la Salud (2026). Enfermedad Pulmonar Obstructiva Crónica.', 'https://www.who.int/es/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)'],
  ['Ministerio de Salud y Protección Social (2025). Resumen Ejecutivo Encuesta Nacional de Demografía y Salud 2025.', 'https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/VS/ED/GCFI/resumen-ejecutivo-ensm-2025.pdf'],
  ['National Institute on Drug Abuse (2020). Vaping Devices (Electronic Cigarettes) DrugFacts.', 'https://nida.nih.gov/publications/drugfacts/vaping-devices-electronic-cigarettes'],
  ['Martínez-Larenas, M. V., et al. (2022). Efectos fisiopatológicos del cigarro electrónico: un problema de salud pública. Neumol. cir. tórax, 81(2), 121-130.', 'https://doi.org/10.35366/108498'],
  ['National Heart, Lung, and Blood Institute (2024). EPOC: ¿Qué es la EPOC?', 'https://www.nhlbi.nih.gov/es/salud/epoc'],
  ['Rivero, D. (2019). Nociones fundamentales de la espirometría. Rev. alergia Méx., 66(1), 76-84.', 'https://doi.org/10.29262/ram.v66i1.536'],
  ['Dialnet (2014). Relaciones estructura-función en el surfactante pulmonar, efecto de la temperatura y mecanismos de compensación fisiológica.', 'https://dialnet.unirioja.es/servlet/tesis?codigo=97956'],
  ['SciELO (2016). Espirometría: recomendaciones y procedimiento.', 'https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S0028-37462016000200173'],
  ['Biolin Scientific (2026). ¿Qué es la tensión superficial?', 'https://www.biolinscientific.com/blog/what-is-surface-tension'],
  ['Journal of Anaesthesia Practice (2023). Ley de Laplace: sus aplicaciones en cuidados intensivos y medicina perioperatoria.', 'https://japractice.co.uk/2023/11/laplaces-law-its-applications-in-critical-care-and-peri-operative-medicine/22616'],
  ['Clínica Universidad de Navarra (s.f.). Diccionario Médico, Broncodilatadores.', 'https://www.cun.es/diccionario-medico/terminos/broncodilatadores'],
  ['Salud más fácil (s.f.). Salbutamol.', 'https://plenainclusionmadrid.org/salud-mas-facil/salbutamol/'],
  ['Life in the Fastlane (2019). Transpulmonary pressure (TPP).', 'https://litfl.com/transpulmonary-pressure/'],
  ['LibreTexts (2022). El Proceso de Respiración.', 'https://espanol.libretexts.org/Bookshelves/Salud/Anatomia_y_Fisiologia/Libro%3A_Anatom%C3%ADa_y_Fisiolog%C3%ADa_1e_(OpenStax)/Unit_5%3A_Energ%C3%ADa%2C_Mantenimiento_e_Intercambio_Ambiental/22%3A_El_Sistema_Respiratorio/22.03%3A_El_Proceso_de_Respiraci%C3%B3n'],
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
      <Rv as="p" d={400} className="mt-10 max-w-2xl text-sm italic text-muted">Las dos espirometrías se realizaron el año pasado; los detalles de los exámenes se mantienen confidenciales y los resultados se usan únicamente para este trabajo.</Rv>
      <footer className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm">
        <strong>Proyecto creativo de Física Biomecánica. Pontificia Universidad Javeriana, Química Farmacéutica</strong>
        <a href="#resultados" onClick={(e) => { e.preventDefault(); location.hash = 'resultados'; location.reload() }} className="hov text-muted">Resultados del juego</a>
      </footer>
    </Band>
  )
}
