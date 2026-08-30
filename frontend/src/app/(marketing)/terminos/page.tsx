import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso del sitio de CRM + Inventario: alcance, propiedad intelectual, solicitudes de demostración y ley aplicable.",
  alternates: { canonical: "/terminos" },
}

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" updated="30 de agosto de 2026">
      <p>
        Estos términos regulan el uso de este sitio web, operado por{" "}
        <strong>{site.company.legalName}</strong> (NIT {site.company.nit}), con domicilio en{" "}
        {site.company.city}. Al navegar o enviar información a través del sitio, aceptas estas
        condiciones.
      </p>

      <h2>1. Objeto</h2>
      <p>
        El sitio presenta información comercial sobre la plataforma CRM + Inventario y permite
        solicitar una demostración o contactarnos. No constituye la prestación del servicio ni un
        contrato de suscripción.
      </p>

      <h2>2. Uso del sitio</h2>
      <ul>
        <li>Debes usar el sitio de forma lícita y sin afectar su funcionamiento o seguridad.</li>
        <li>
          La información que envíes debe ser veraz y propia, o contar con autorización para
          entregarla.
        </li>
        <li>
          No está permitido intentar acceder a áreas restringidas, extraer datos de forma masiva ni
          introducir código malicioso.
        </li>
      </ul>

      <h2>3. Solicitudes de demostración</h2>
      <p>
        El envío del formulario o un mensaje por correo o WhatsApp inicia un contacto comercial y no
        genera obligación de contratar para ninguna de las partes. Las condiciones económicas y de
        servicio se definen en un acuerdo separado.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Las marcas, textos, imágenes, capturas de pantalla y el software mostrado en el sitio son de{" "}
        {site.company.legalName} o de sus licenciantes. No se permite su reproducción o uso sin
        autorización previa y escrita, salvo el uso normal de navegación.
      </p>

      <h2>5. Enlaces y canales de terceros</h2>
      <p>
        El sitio puede enlazar a servicios de terceros (por ejemplo WhatsApp o proveedores de
        correo). No controlamos esos servicios y no respondemos por sus contenidos ni por sus
        políticas.
      </p>

      <h2>6. Disponibilidad y limitación de responsabilidad</h2>
      <p>
        El sitio se ofrece &ldquo;tal cual&rdquo;. Procuramos que la información esté actualizada,
        pero puede contener imprecisiones o estar temporalmente no disponible. En la medida que lo
        permita la ley, no respondemos por daños indirectos derivados del uso o la imposibilidad de
        uso del sitio.
      </p>

      <h2>7. Protección de datos personales</h2>
      <p>
        El tratamiento de datos personales se rige por nuestra{" "}
        <a href="/privacidad">Política de privacidad</a>, conforme a la Ley 1581 de 2012.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada
        en esta página con su fecha de última actualización.
      </p>

      <h2>9. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se
        someterá a los jueces competentes del domicilio de {site.company.legalName}.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Para cualquier asunto relacionado con estos términos, escríbenos a{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  )
}
