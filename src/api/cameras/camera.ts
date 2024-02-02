import api from '@/api/api';

export async function getCameraList(){
    // 获取相机流地址列表
    return await api.get('/api/cameras/get_cameras')
}

export async function addCamera(params){
    // 添加视频流
    return await api.post('/api/cameras/add_camera', params)
}

export async function deleteCamera(params){
    return await api.delete(`/api/cameras/delete_camera/${params}`)
}

export async function updateCamera(params) {
    const {cam_id,...formData} = params;
    return await api.put(`/api/cameras/update_camera/${cam_id}`, formData)
}


export function checkRtspOrRtmp(params){
    // 检测单个url
    return api.post('/api/cameras/checkRtspOrRtmp/', params)
}

export function checkAllRtspAndRtmp(){
    return api.get('/api/cameras/checkAllRtspOrRtmp')
}

/** 给任务新增form表单里的stream_url测试连接用接口**/
export function connectionTestApi(stream_url: string){
    return api.get(`/api/cameras/connectionTest/${stream_url}`)
}