import api from '@/api/api';
export function getGroups() {
    // 获取分组的列表,
    return api.get('/api/groups/get_groups');
}
export function getGroupIds() {
    // 获取分组的id和name
    return api.get('/api/groups/get_group_ids');
}
export function addGroup(params) {
    // 添加分组
    const formData = new FormData();
    formData.append('name', params.name);
    formData.append('description', params.description);
    return api.post('/api/groups/create_group', params);
}
export function deleteGroup(group_id) {
    // 删除分组
    return api.delete(`/api/groups/delete_group/${group_id}`);
}
//# sourceMappingURL=group.js.map