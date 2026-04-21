import React from 'react';
import { Helmet } from 'react-helmet-async';
import LegalLayout from './LegalLayout';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad · Apps Educativas</title>
        <meta name="description" content="Política de Privacidad de Apps Educativas: responsable del tratamiento, finalidades, base legal, destinatarios y derechos del usuario." />
        <link rel="canonical" href="https://apps-educativas.com/politica-privacidad" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <LegalLayout title="Política de Privacidad" updatedAt="21 de abril de 2026">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>Responsable:</strong> Eduardo Torregrosa Llácer<br />
          <strong>NIF:</strong> 20445406Q<br />
          <strong>Domicilio:</strong> Xàtiva (Valencia), España<br />
          <strong>Correo de contacto:</strong>{' '}
          <a href="mailto:edtorlla@gmail.com">edtorlla@gmail.com</a><br />
          <strong>Sitio web:</strong> https://apps-educativas.com
        </p>

        <h2>2. Datos que tratamos</h2>
        <ul>
          <li><strong>Docentes:</strong> correo electrónico, nombre mostrado, contraseña (cifrada), grupos creados, actividad en la plataforma.</li>
          <li><strong>Alumnado:</strong> nombre de usuario, nombre mostrado, avatar, grupo al que pertenecen, resultados de las sesiones de juego, XP e insignias. De forma opcional el alumno puede vincular un email para recuperación de contraseña.</li>
          <li><strong>Visitantes no registrados:</strong> datos agregados y anonimizados de navegación recogidos por Google Analytics (páginas visitadas, tiempo en la página, dispositivo, país/región, navegador), solo si aceptan el uso de cookies analíticas.</li>
          <li><strong>Datos técnicos:</strong> dirección IP (anonimizada para analítica), navegador, sistema operativo, logs de servidor durante el tiempo necesario para depurar errores.</li>
        </ul>

        <h2>3. Finalidades y base legal del tratamiento</h2>
        <ul>
          <li><strong>Prestación del servicio</strong> (alta de cuentas docentes y alumnado, guardado de progreso, gestión de grupos y tareas): ejecución del contrato/relación de uso — art. 6.1.b RGPD.</li>
          <li><strong>Soporte y comunicaciones de servicio</strong>: interés legítimo del responsable — art. 6.1.f RGPD.</li>
          <li><strong>Cumplimiento de obligaciones legales</strong> (fiscales, contables, de seguridad): art. 6.1.c RGPD.</li>
          <li><strong>Analítica web con Google Analytics</strong>: consentimiento — art. 6.1.a RGPD. Se solicita mediante el banner de cookies y puede revocarse en cualquier momento.</li>
        </ul>

        <h2>4. Menores de edad</h2>
        <p>
          La plataforma está diseñada para ser utilizada por menores dentro de un entorno educativo bajo
          supervisión del profesorado o tutor legal. El alta del alumno la realiza el docente sin datos
          identificativos obligatorios más allá del nombre de usuario. En caso de que el alumno vincule
          voluntariamente un email, debe contar con la autorización del tutor legal si es menor de 14 años,
          conforme al art. 7 LOPDGDD.
        </p>

        <h2>5. Destinatarios de los datos</h2>
        <p>
          No cedemos los datos a terceros salvo obligación legal. Contamos con los siguientes
          encargados del tratamiento, bajo contratos conformes al art. 28 RGPD:
        </p>
        <ul>
          <li><strong>Supabase Inc.</strong> — alojamiento de base de datos y autenticación (servidores en la UE).</li>
          <li><strong>Hostinger International Ltd.</strong> — alojamiento del frontend web.</li>
          <li><strong>Google LLC</strong> — Google Analytics (solo si el usuario acepta cookies analíticas) y autenticación Google OAuth (solo si el docente elige registrarse con Google).</li>
        </ul>
        <p>
          Google puede transferir datos fuera del Espacio Económico Europeo. Dichas transferencias están
          cubiertas por el marco <em>EU-US Data Privacy Framework</em> y por las Cláusulas Contractuales
          Tipo aprobadas por la Comisión Europea.
        </p>

        <h2>6. Plazo de conservación</h2>
        <ul>
          <li>Cuentas docentes y de alumnado: mientras la cuenta esté activa. Si solicitas su supresión se elimina en un plazo máximo de 30 días, salvo obligaciones legales de conservación.</li>
          <li>Datos agregados de analítica: hasta 14 meses en Google Analytics.</li>
          <li>Logs técnicos: 90 días.</li>
        </ul>

        <h2>7. Derechos del usuario</h2>
        <p>Puedes ejercer los siguientes derechos escribiendo a <a href="mailto:edtorlla@gmail.com">edtorlla@gmail.com</a> indicando tu solicitud y adjuntando copia de documento identificativo si es necesario:</p>
        <ul>
          <li>Acceso a tus datos.</li>
          <li>Rectificación de datos inexactos.</li>
          <li>Supresión ("derecho al olvido").</li>
          <li>Limitación del tratamiento.</li>
          <li>Portabilidad.</li>
          <li>Oposición al tratamiento.</li>
          <li>Revocar el consentimiento otorgado en cualquier momento.</li>
        </ul>
        <p>
          Si consideras que tus derechos no han sido atendidos, puedes presentar una reclamación ante la
          Agencia Española de Protección de Datos (AEPD), C/ Jorge Juan 6, 28001 Madrid —{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
        </p>

        <h2>8. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: cifrado TLS en
          tránsito, cifrado de contraseñas con bcrypt, control de acceso por roles, copias de seguridad
          periódicas y revisiones de seguridad del código.
        </p>

        <h2>9. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios legales o del servicio. La fecha de
          "última actualización" en la cabecera indica la versión vigente.
        </p>
      </LegalLayout>
    </>
  );
}
