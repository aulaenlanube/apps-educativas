import React from 'react';
import { Helmet } from 'react-helmet-async';
import LegalLayout from './LegalLayout';

export default function CookiesPolicyPage() {
  const openBanner = () => {
    window.dispatchEvent(new Event('open-cookie-banner'));
  };

  return (
    <>
      <Helmet>
        <title>Política de Cookies · Apps Educativas</title>
        <meta name="description" content="Política de Cookies de Apps Educativas: qué cookies utilizamos, con qué finalidad y cómo gestionarlas." />
        <link rel="canonical" href="https://apps-educativas.com/politica-cookies" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <LegalLayout title="Política de Cookies" updatedAt="21 de abril de 2026">
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Una cookie es un pequeño fichero de texto que los sitios web guardan en tu dispositivo al
          visitarlos. Permite recordar información sobre tu visita (por ejemplo, tus preferencias o el
          estado de tu sesión) y analizar cómo se usa el sitio.
        </p>

        <h2>2. Tipos de cookies que utilizamos</h2>
        <ul>
          <li><strong>Cookies técnicas (exentas de consentimiento)</strong>: imprescindibles para el funcionamiento del sitio. Mantienen tu sesión activa cuando inicias sesión como docente o alumno y recuerdan tu preferencia de tema claro/oscuro y tus opciones de accesibilidad.</li>
          <li><strong>Cookies analíticas (requieren consentimiento)</strong>: nos permiten medir y analizar de forma agregada y anónima el uso de la plataforma para mejorarla. Usamos Google Analytics 4 con IP anonimizada.</li>
        </ul>

        <h2>3. Detalle de las cookies</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sb-*-auth-token</td>
              <td>Supabase (propia)</td>
              <td>Mantener la sesión del usuario autenticado.</td>
              <td>Sesión / hasta cierre</td>
              <td>Técnica</td>
            </tr>
            <tr>
              <td>student_session</td>
              <td>apps-educativas.com</td>
              <td>Sesión temporal del alumno en el dispositivo.</td>
              <td>Sesión</td>
              <td>Técnica</td>
            </tr>
            <tr>
              <td>theme</td>
              <td>apps-educativas.com</td>
              <td>Recordar preferencia de tema claro u oscuro.</td>
              <td>1 año</td>
              <td>Técnica (preferencia)</td>
            </tr>
            <tr>
              <td>cookie-consent</td>
              <td>apps-educativas.com</td>
              <td>Recordar tu elección sobre el aviso de cookies.</td>
              <td>1 año</td>
              <td>Técnica</td>
            </tr>
            <tr>
              <td>_ga, _ga_*</td>
              <td>Google (ga4)</td>
              <td>Identificar al visitante de forma anónima y medir el uso agregado de la plataforma.</td>
              <td>2 años</td>
              <td>Analítica (consentimiento)</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Gestión del consentimiento</h2>
        <p>
          Al entrar por primera vez verás un banner en el que puedes aceptar o rechazar las cookies
          analíticas. Tu elección se guarda localmente y la aplicamos automáticamente en visitas
          posteriores. Puedes cambiar tu elección en cualquier momento:
        </p>
        <p>
          <button
            type="button"
            onClick={openBanner}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: 'linear-gradient(90deg, #4f46e5, #9333ea)',
              color: '#fff',
              fontWeight: 700,
              border: 0,
              cursor: 'pointer',
            }}>
            Abrir configuración de cookies
          </button>
        </p>

        <h2>5. Cómo desactivar las cookies desde el navegador</h2>
        <p>
          Además del banner, puedes bloquear o eliminar las cookies directamente desde la configuración
          de tu navegador. Guías oficiales:
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/proteccion-antirrastreo-mejorada-en-firefox-escrito" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
        <p>
          Ten en cuenta que desactivar las cookies técnicas puede impedir el correcto funcionamiento del
          servicio (por ejemplo, no podrás mantener la sesión iniciada).
        </p>

        <h2>6. Cambios</h2>
        <p>
          Esta política de cookies puede actualizarse. La fecha de "última actualización" en la cabecera
          indica la versión vigente.
        </p>
      </LegalLayout>
    </>
  );
}
