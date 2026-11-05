// src/services/appProposalService.js
// «Propón una app»: envío público y gestión desde el panel de admin.
// Tabla y RPCs en supabase/migrations/20261105_app_proposals.sql.
import { supabase } from '@/lib/supabase';

/**
 * Envía una propuesta. Devuelve { ok: true } o { ok: false, error } con
 * error ∈ 'invalid' | 'consent' | 'rate_limited' | 'network'.
 */
export async function submitAppProposal({
  idea, curso, email, consent, website = '', elapsedMs, source, suggestedApps = [],
}) {
  try {
    const { data, error } = await supabase.rpc('submit_app_proposal', {
      p_idea: idea,
      p_curso: curso,
      p_email: email,
      p_consent: consent === true,
      p_website: website,
      p_elapsed_ms: Math.round(elapsedMs || 0),
      p_source: source || null,
      p_suggested_apps: suggestedApps.slice(0, 8),
    });
    if (error) return { ok: false, error: 'network' };
    return data && typeof data === 'object' ? data : { ok: false, error: 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function adminListAppProposals(status = 'all') {
  const { data, error } = await supabase.rpc('admin_list_app_proposals', { p_status: status });
  if (error) return { error: error.message };
  return data || { proposals: [], counts: {} };
}

export async function adminUpdateAppProposal(id, status, notes) {
  const { data, error } = await supabase.rpc('admin_update_app_proposal', {
    p_id: id, p_status: status, p_notes: notes ?? null,
  });
  if (error) return { error: error.message };
  return data;
}

export async function adminDeleteAppProposal(id) {
  const { data, error } = await supabase.rpc('admin_delete_app_proposal', { p_id: id });
  if (error) return { error: error.message };
  return data;
}
