import api from '@/api/api';
export async function getFaceList(params) {
    // 获取人脸列表
    const { page, pageSize } = params;
    const post_params = { page: page, size: pageSize };
    return await api.get('/api/faces/get_faces', { params: post_params });
}
export async function getFaceById(face_id) {
    // 获取人脸信息
    return await api.get(`/api/faces/get_face_by_id/${face_id}`);
}
export async function getDetectedInfo(image64) {
    // 获取检测信息
    return await api.post('/api/faces/detect_face', { 'base64image': image64 });
}
export function createFace(params) {
    // 创建人脸
    return api.post('/api/faces/add_face', params);
}
export function deleteFace(face_id) {
    // 删除人脸
    return api.delete(`/api/faces/delete_face/${face_id}`);
}
export function updateFace(face_id, params) {
    // 更新人脸
    return api.put(`/api/faces/update_face/${face_id}`, params);
}
export function createSnapshot(params) {
    // 创建快照
    return api.post('/api/faces/add_snapshot_face', params);
}
//# sourceMappingURL=face.js.map