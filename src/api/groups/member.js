import api from '@/api/api';
export function getMembers(group_id, params) {
    return api.get(`/api/groups/get_group_members/${group_id}`);
}
export function getAllMembers() {
    return api.get(`/api/groups/get_all_members`);
}
export function updateMembers(group_id, member_ids) {
    return api.put(`/api/groups/update_group_members/${group_id}`, member_ids);
}
//# sourceMappingURL=member.js.map