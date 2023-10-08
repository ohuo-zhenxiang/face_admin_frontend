import api from '@/api/api'

export async function getIsReloading(){
  return await api.get('/api/overview/get_isReloading')
}

export async function getCardData(){
  return await api.get('/api/overview/get_cardData')
}

export async function getFaceWarehouseCard(){
  return await api.get('/api/overview/get_faceWarehouse')
}

export async function getFaceGroupCard(){
  return await api.get('/api/overview/get_faceGroup')
}

export async function getTaskCard(){
  return await api.get('/api/overview/get_taskList')
}

export async function getEquipmentCard(){
  return await api.get('/api/overview/get_equipmentList')
}

export async function getRecordList(params){
  return await api.get(`/api/overview/get_recordList_by_taskToken/${params}`)
}

export async function getRecordImage(recordId){
  return await api.get(`/api/overview/get_recordDrawImage/${recordId}`)
}