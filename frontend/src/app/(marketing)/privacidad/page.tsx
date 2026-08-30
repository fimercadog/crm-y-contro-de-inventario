import type { Metadata } from "next"

import { LegalPage } from "@/components/marketing/legal-page"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo tratamos los datos personales en CRM + Inventario conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 (habeas data).",
  alternates: { canonical: "/privacidad" },
}

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad" updated="30 de agosto de 2026">
      <p>
        Esta política describe cómo <strong>{site.company.legalName}</strong> (NIT{" "}
        {site.company.nit}), con domicilio en {site.company.city}, en calidad de responsable del
        tratamiento, recolecta y usa los datos personales que nos entregas a través de este sitio,
        en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas colombianas
        sobre protección de datos personales (habeas data).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        {site.company.legalName} — {site.company.city}. Correo de contacto para asuntos de datos
        personales: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>2. Datos que recolectamos</h2>
      <ul>
        <li>
          <strong>Datos de contacto</strong> que envías por el formulario de este sitio: nombre,
          correo electrónico, empresa (opcional) y el contenido de tu mensaje.
        </li>
        <li>
          <strong>Datos de comunicación</strong> cuando nos escribes por correo o WhatsApp.
        </li>
        <li>
          <strong>Datos técnicos de navegación</strong> (dirección IP, tipo de navegador, páginas
          visitadas) recogidos de forma agregada para operar y mejorar el sitio.
        </li>
      </ul>
      <p>
        No recolectamos datos sensibles ni datos de menores de edad a través de este sitio.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <ul>
        <li>Atender tus solicitudes de demostración, información y soporte.</li>
        <li>Contactarte por correo, teléfono o WhatsApp para dar seguimiento a tu solicitud.</li>
        <li>Gestionar la relación comercial y, si llega a existir, la prestación del servicio.</li>
        <li>Mantener y mejorar el funcionamiento del sitio.</li>
      </ul>

      <h2>4. Autorización</h2>
      <p>
        Al diligenciar el formulario y marcar la casilla de autorización, aceptas de forma previa,
        expresa e informada el tratamiento de tus datos personales para las finalidades descritas.
        Puedes revocar esta autorización en cualquier momento escribiendo a{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>5. Derechos del titular</h2>
      <p>Como titular de los datos tienes derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
        <li>
          Revocar la autorización y solicitar la supresión de los datos cuando no exista un deber
          legal o contractual de conservarlos.
        </li>
        <li>Acceder de forma gratuita a tus datos personales.</li>
      </ul>

      <h2>6. Cómo ejercer tus derechos</h2>
      <p>
        Envía tu consulta o reclamo a <a href={`mailto:${site.email}`}>{site.email}</a> indicando tu
        nombre, el motivo y los datos de contacto. Las consultas se atienden en un máximo de diez
        (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles, según lo previsto
        en la Ley 1581 de 2012.
      </p>

      <h2>7. Seguridad de la información</h2>
      <p>
        Aplicamos medidas técnicas y administrativas razonables para proteger los datos contra
        acceso no autorizado, pérdida o alteración. El acceso interno a los datos se limita al
        personal que los necesita para las finalidades descritas.
      </p>

      <h2>8. Transferencia y transmisión de datos</h2>
      <p>
        Podemos apoyarnos en proveedores de correo electrónico, hosting y mensajería que actúan como
        encargados del tratamiento y solo procesan los datos según nuestras instrucciones. No
        vendemos ni cedemos datos personales a terceros con fines comerciales propios de estos.
      </p>

      <h2>9. Cookies</h2>
      <p>
        El sitio usa cookies y almacenamiento local estrictamente necesarios para su funcionamiento.
        Puedes bloquearlas desde tu navegador, aunque algunas funciones podrían dejar de operar
        correctamente.
      </p>

      <h2>10. Vigencia</h2>
      <p>
        Los datos se conservan mientras subsista la finalidad que justificó su recolección o exista
        un deber legal de conservarlos. Esta política puede actualizarse; la versión vigente es la
        publicada en esta página con su fecha de última actualización.
      </p>
    </LegalPage>
  )
}
