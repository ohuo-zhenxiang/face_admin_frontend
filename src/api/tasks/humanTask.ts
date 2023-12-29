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
    // 添加人体任务
    const data = {
        "task_name": params.name,
        "task_extends": params.task_expands,
        "interval_seconds": params.interval_seconds,
        "start_time": params.time_range[0],
        "end_time": params.time_range[1],
        "capture_path": params.capture_path,
    }
    return api.post(`${prefix}/add_human_task`, data)
}

export function deleteHumanTask(task_token: string) {
    // 删除人体任务
    return api.delete(`${prefix}/delete_human_task/${task_token}`)
}