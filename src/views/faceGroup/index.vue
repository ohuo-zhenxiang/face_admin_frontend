<template>
  <n-card>
    <!--新增button-->
    <n-button type="primary" @click="AddGroup">
      <template #icon>
        <n-icon>
          <PeopleTeamAdd20Regular/>
        </n-icon>
      </template>
      新建分组
    </n-button>

    <!--新增分组的modal-->
    <n-modal v-model:show="showAddModal" :show-icon="false" preset="dialog" title="新建分组">
      <template #action>
        <n-space>
          <n-button @click="()=>(showAddModal=false)">取消</n-button>
          <n-button type="info" :loading="formAddBtnLoading" @click="confirmAddForm">确认</n-button>
        </n-space>
      </template>
      <n-form :model="formAdd" ref="formAddRef">
        <n-form-item label="分组名称" path="name">
          <n-input v-model:value="formAdd.name"/>
        </n-form-item>
        <n-form-item label="分组描述" path="description">
          <n-input v-model:value="formAdd.description"/>
        </n-form-item>
      </n-form>
    </n-modal>

    <!--分组表格-->
    <n-data-table
        style="margin-top: 16px"
        :row-key="(row) => row.id"
        striped
        :columns="columns"
        :data="groupDates"
        size="large"
    />

    <!-- 编辑组内成员的模态框 -->
    <n-modal v-model:show="showEditModal" :show-icon="false" preset="dialog" title="编辑"
             style="width: 60%;margin-top: 8%;height: 80%">
      <template #action>
        <n-space>
          <n-button @click="()=>(showEditModal=false)">取消</n-button>
          <n-button type="info" :loading="formEditBtnLoading" @click="confirmEditFrom">确认</n-button>
        </n-space>
      </template>

      <n-form :model="editParams" ref="editRef" class="py-4">
        <n-transfer
            ref="transfer"
            v-model:value="choosedMembers"
            virtual-scroll
            :options="options1"
            source-filterable
            target-filterable
            size="large"
        />
      </n-form>
    </n-modal>

  </n-card>


</template>


<script setup lang="ts">
import {h, reactive, ref} from 'vue'
import {NButton, NSpace, useMessage, useDialog} from 'naive-ui'
import type {DataTableColumns} from 'naive-ui'
import {PeopleTeamAdd20Regular} from '@vicons/fluent'
import {addGroup, getGroups, deleteGroup} from '@/api/groups/group'
import {getAllMembers, getMembers, updateMembers} from '@/api/groups/member'


const message = useMessage()
const n_dialog = useDialog()
const alignStyle = 'center'
const groupDates = ref([]);
const showEditModal = ref(false);
const showAddModal = ref(false);
const formEditBtnLoading = ref(false);
const formAddBtnLoading = ref(false);
const editParams = reactive({});
const choosedMembers = ref([]);
let editingGroupId = ref<number>();

const formAdd = reactive({
  name: '',
  description: '',
})


type RowData = {
  id: number
  name: string
  num: number
  description: string
}
const createColumns = ({deleteRow, infoRow}: {
  // editRow: (rowData: RowData) => void
  deleteRow: (rowData: RowData) => void
  infoRow: (rowData: RowData) => void
}): DataTableColumns<RowData> => {
  return [
    {
      title: '分组名称',
      key: 'name',
      width: 100,
      align: alignStyle,
    },
    {
      title: '分组人数',
      key: 'member_count',
      align: alignStyle,
      width: 100,
    },
    {
      title: '分组描述',
      key: 'description',
      align: alignStyle,
      width: 400,
      ellipsis: true,
    },
    // {
    //   title: 'Tags',
    //   key: 'tags',
    //   render(row) {
    //     const tags = row.tags.map((tagKey) => {
    //       return h(
    //           NTag,
    //           {
    //             style: {
    //               marginRight: '6px'
    //             },
    //             type: 'info',
    //             bordered: false
    //           },
    //           {
    //             default: () => tagKey
    //           }
    //       )
    //     })
    //     return tags
    //   }
    // },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      width: 200,
      render(row) {
        return h(
            NSpace,
            {
              justify: 'center',
            },
            {
              default: () => [
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'info',
                      ghost: true,
                      onClick: () => infoRow(row),
                      style: {
                        marginRight: '8px' // 添加右侧间距
                      }
                    },
                    {default: () => '详情'}
                ),
                // h(
                //     NButton,
                //     {
                //       size: 'small',
                //       type: 'primary',
                //       ghost: true,
                //       onClick: () => editRow(row),
                //       style: {
                //         marginRight: '8px' // 添加右侧间距
                //       }
                //     },
                //     {default: () => '编辑'}
                // ),
                h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      ghost: true,
                      onClick: () => deleteRow(row)
                    },
                    {default: () => '删除'}
                ),
              ]
            }
        )
      }
    }
  ]
}

function AddGroup() {
  showAddModal.value = true
}

const loadGroupData = async () => {
  try {
    const response = await getGroups()
    if (response.status === 200) {
      groupDates.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}


const options1 = ref([])

async function loadMemberData(group_id) {
  try {
    const response = await getMembers(group_id)
    if (response.status === 200) {
      // console.log(response.data)
      choosedMembers.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}

async function loadAllMembers() {
  try {
    const response = await getAllMembers()
    if (response.status === 200) {
      options1.value = response.data
    }
  } catch (error) {
    console.log(error)
  }
}

function reloadGroupData() {
  loadGroupData();
  loadAllMembers();
}

loadGroupData();
loadAllMembers();

// 提交编辑后的成员id_list
async function confirmEditFrom(e) {
  e.preventDefault();
  formEditBtnLoading.value = true;
  await updateMembers(editingGroupId.value, choosedMembers.value)
  message.success('编辑成功')
  formEditBtnLoading.value = false;
  showEditModal.value = false;
  reloadGroupData();
}

async function confirmAddForm(e) {
  e.preventDefault();
  formAddBtnLoading.value = true;
  try {
    const response = await addGroup(toRaw(formAdd))
    if (response.status === 200) {
      message.success('新建成功')
      formAddBtnLoading.value = false;
      showAddModal.value = false;
      reloadGroupData();
    }
  } catch (error:any){
    const er = error.response;
    if (er.status === 400) {
      message.error('该分组名称已存在')
    }
  }finally{
    formAddBtnLoading.value = false;
  }

}

const columns = createColumns({
  infoRow(rowData) {
    editingGroupId.value = rowData.id;
    loadMemberData(rowData.id);
    showEditModal.value = true;
  },
  // editRow(rowData) {
  //   console.log("editRow", rowData.g_id)
  // },
  deleteRow(rowData) {
    console.log('deleteRow', rowData.id)
    n_dialog.warning({
      title: '警告',
      content: `您确定删除 ${rowData.name} 的分组数据吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const response = await deleteGroup(rowData.id);
          if (response.status === 200) {
            message.success('删除成功');
            reloadGroupData();
          } else {
          }
        } catch (err: any) {
          // console.log(err)
          message.error("删除失败")
        }
      },
      onNegativeClick: () => {
      }
    })
  },
})


</script>

<style scoped>
</style>