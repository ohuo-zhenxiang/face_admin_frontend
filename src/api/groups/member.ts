import api from '@/api/api';

export function getMembers(group_id){
  return api.get(`/api/groups/get_group_members/${group_id}`)
}

export function getAllMembers(){
  return api.get(`/api/groups/get_all_members`)
}

export function updateMembers(group_id, member_ids, group_name:string, group_description:string){
  const updateForm = {"group_name": group_name, "group_description": group_description, "member_ids": member_ids}
  return api.put(`/api/groups/update_group_members/${group_id}`, updateForm)
}

