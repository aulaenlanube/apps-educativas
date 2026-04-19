import { supabase } from '../../lib/supabase';

// Servicio para niveles creados por el usuario en "Programa al Robot".
// Tabla: robot_user_levels. RPCs: robot_level_* (todas SECURITY DEFINER).

export async function createRobotLevel({ creatorType, creatorId, creatorName, title, description, world, level, grade, subjectId = 'programacion', shared = false, groupId = null }) {
  const { data, error } = await supabase.rpc('robot_level_create', {
    p_creator_type: creatorType,
    p_creator_id: creatorId,
    p_creator_name: creatorName,
    p_title: title,
    p_description: description || '',
    p_world: world,
    p_level: level,
    p_grade: grade,
    p_subject_id: subjectId,
    p_shared: shared,
    p_group_id: groupId,
  });
  if (error) throw error;
  return data;
}

export async function updateRobotLevel({ id, creatorType, creatorId, title, description, world, shared, groupId }) {
  const { data, error } = await supabase.rpc('robot_level_update', {
    p_id: id,
    p_creator_type: creatorType,
    p_creator_id: creatorId,
    p_title: title,
    p_description: description || '',
    p_world: world,
    p_shared: shared,
    p_group_id: groupId,
  });
  if (error) throw error;
  return data === true;
}

export async function deleteRobotLevel({ id, creatorType, creatorId }) {
  const { data, error } = await supabase.rpc('robot_level_delete', {
    p_id: id,
    p_creator_type: creatorType,
    p_creator_id: creatorId,
  });
  if (error) throw error;
  return data === true;
}

export async function listMyRobotLevels({ creatorType, creatorId, level, grade }) {
  const { data, error } = await supabase.rpc('robot_level_list_mine', {
    p_creator_type: creatorType,
    p_creator_id: creatorId,
    p_level: level,
    p_grade: grade,
  });
  if (error) throw error;
  return data || [];
}

export async function listSharedRobotLevels({ groupId, level, grade, excludeCreatorId = null }) {
  const { data, error } = await supabase.rpc('robot_level_list_shared', {
    p_group_id: groupId,
    p_level: level,
    p_grade: grade,
    p_exclude_creator_id: excludeCreatorId,
  });
  if (error) throw error;
  return data || [];
}

export async function incrementRobotLevelPlays(id) {
  await supabase.rpc('robot_level_increment_plays', { p_id: id });
}
