import React from 'react';
import { Helmet } from 'react-helmet-async';
import LegalLayout from './LegalLayout';

export default function LegalNoticePage() {
  return (
    <>
      <Helmet>
        <title>Aviso Legal · Apps Educativas</title>
        <meta name="description" content="Aviso Legal de Apps Educativas (LSSI-CE). Datos del titular, objeto, condiciones de uso y legislación aplicable." />
        <link rel="canonical" href="https://apps-educativas.com/aviso-legal" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <LegalLayout title="Aviso Legal" updatedAt="21 de abril de 2026">
        <h2>1. Datos del titular</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
          de la Información y Comercio Electrónico (LSSI-CE), se informa de que el titular de este sitio
          web es:
        </p>
        <p>
          <strong>Eduardo Torregrosa Llácer</strong><br />
          NIF: 20445406Q<br />
          Xàtiva (Valencia), España<br />
          Correo electrónico: <a href="mailto:edtorlla@gmail.com">edtorlla@gmail.com</a><br />
          Sitio web: https://apps-educativas.com
        </p>

        <h2>2. Objeto</h2>
        <p>
          Apps Educativas es una plataforma web gratuita de carácter educativo que ofrece apps y juegos
          interactivos dirigidos a profesorado y alumnado de Primaria, ESO y Bachillerato, así como
          recursos para Atención a la Diversidad. El acceso y uso de la plataforma implica la aceptación
          de las condiciones recogidas en este aviso legal, la Política de Privacidad y la Política de
          Cookies.
        </p>

        <h2>3. Condiciones de uso</h2>
        <ul>
          <li>El usuario se compromete a utilizar la plataforma conforme a la ley, la moral, el orden público y este aviso legal.</li>
          <li>Queda prohibido usar la plataforma con fines ilícitos, lesivos de derechos de terceros o que puedan dañar, inutilizar o sobrecargar los sistemas.</li>
          <li>El titular se reserva el derecho a suspender o cancelar cuentas que incumplan estas condiciones o las normas habituales de convivencia.</li>
        </ul>

        <h2>4. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del sitio (código fuente, textos, imágenes, diseños, marcas, logotipos,
          iconos, apps y juegos) son titularidad del responsable o de terceros que han autorizado su uso.
          Está prohibida la reproducción, distribución o modificación sin autorización expresa, salvo
          para uso educativo personal en el aula.
        </p>

        <h2>5. Exclusión de responsabilidad</h2>
        <p>
          El titular no garantiza la disponibilidad ininterrumpida del servicio y no se hace responsable
          de los daños derivados de interrupciones, virus, fallos técnicos o del uso indebido por parte
          de terceros. Se recomienda utilizar las apps bajo supervisión docente o familiar.
        </p>

        <h2>6. Enlaces a terceros</h2>
        <p>
          El sitio puede contener enlaces a páginas de terceros (por ejemplo, documentación oficial o
          proveedores). El responsable no asume la responsabilidad del contenido de dichos sitios.
        </p>

        <h2>7. Legislación aplicable y jurisdicción</h2>
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier controversia relacionada
          con el uso del sitio, las partes, con renuncia expresa a cualquier otro fuero, se someten a los
          juzgados y tribunales de la ciudad de Valencia (España), salvo que la normativa aplicable
          disponga otro fuero imperativo.
        </p>
      </LegalLayout>
    </>
  );
}
