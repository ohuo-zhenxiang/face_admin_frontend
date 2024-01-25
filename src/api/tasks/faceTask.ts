import api from '@/api/api';

const prefix = '/api/face_tasks'
export function getTasks(){
  // 获取所有任务的列表
  return api.get('/api/face_tasks/get_tasks')
}

export function getTask(task_token:any){
  // 获取单个任务的详情（包含人员列表）
  return api.get(`${prefix}/get_task/${task_token}`)
}

export function addTask(params:any){
  // 添加任务
  const data = {
    "task_name": params.name,
    "ex_detect": params.ex_detect,
    "interval_seconds": params.interval_seconds,
    "start_time": params.time_range[0],
    "end_time": params.time_range[1],
    "capture_path": params.capture_path,
    "associated_group_id": params.group_id,
  }

  return api.post('/api/face_tasks/add_task', data)
}

export function deleteTask(task_id:any){
    // 删除任务组
    return api.delete(`/api/face_tasks/delete_task/${task_id}`)
}