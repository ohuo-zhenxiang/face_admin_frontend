import api from '@/api/api';

export function getTasks(){
  // 获取所有任务的列表
  return api.get('/api/tasks/get_tasks')
}

export function getTask(task_token){
  // 获取单个任务的详情（包含人员列表）
  return api.get(`/api/tasks/get_task/${task_token}`)
}

export function addTask(params){
  // 添加任务
  const formData = new FormData();
  formData.append('task_name', params.name);
  formData.append('interval_seconds', params.interval_seconds);
  formData.append('start_time', params.time_range[0]);
  formData.append('end_time', params.time_range[1]);
  formData.append('capture_path', params.capture_path);
  formData.append('associated_group_id', params.group_id);

  return api.post('/api/tasks/add_task', formData)
}

export function deleteTask(task_id){
    // 删除任务组
    return api.delete(`/api/tasks/delete_task/${task_id}`)
}