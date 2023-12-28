import api from '@/api/api';

const prefix = '/api/human_tasks'

export function getHumanTasks() {
    // 获取所有人体任务的列表
    return api.get(`${prefix}/get_human_tasks`)
}

export function getHumanTaskByToken(task_token: string) {
    // 获取单个任务详情by token
    return api.get(`${prefix}/get_HumanTask_ByToken/${task_token}`)
}

export function addHumanTask(params: any) {
    console.log(params.task_expands)
    // 添加人体任务
    const formData = new FormData();
    formData.append('task_name', params.name);
    formData.append('interval_seconds', params.interval_seconds);
    formData.append('start_time', params.time_range[0]);
    formData.append('end_time', params.time_range[1]);
    formData.append('capture_path', params.capture_path);
    return api.post(`${prefix}/add_human_task`, formData)
}

export function deleteHumanTask(task_token:string){
    // 删除人体任务
    return api.delete(`${prefix}/delete_human_task/${task_token}`)
}