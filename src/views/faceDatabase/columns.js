import { h } from 'vue';
import { NTime, NImage, NTag } from 'naive-ui';
const baseUrl = process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOB_PROD_BASE_URL : import.meta.env.VITE_PRODUCTION_URL;
export const columns = [
    {
        title: 'ID',
        key: 'id',
        width: 50,
        align: 'center',
    },
    {
        title: '名称',
        key: 'name',
        width: 100,
        align: 'center',
    },
    {
        title: '备注',
        key: 'phone',
        width: 100,
        align: 'center',
    },
    {
        title: '性别',
        key: 'gender',
        width: 100,
        align: 'center',
    },
    {
        title: '人脸图',
        key: 'face_image_path',
        width: 100,
        align: 'center',
        render(row) {
            return h(NImage, {
                width: 48,
                height: 48,
                src: `${baseUrl}/${row.face_image_path}`,
            });
        },
    },
    {
        title: '来源',
        key: 'source',
        width: 100,
        align: 'center',
        render(row) {
            const sourceText = row.source === 'Upload' ? '上传' : row.source === 'Snapshot' ? '抓拍' : '未知';
            const sourceType = row.source === 'Upload' ? 'primary' : row.source === 'Snapshot' ? 'warning' : 'info';
            return h(NTag, {
                type: sourceType,
                bordered: false,
                round: false,
            }, {
                default: () => sourceText,
            });
        }
    },
    // {
    //   title: '地址',
    //   key: 'address',
    //   auth: ['basic_list'], // 同时根据权限控制是否显示
    //   ifShow: (_column) => {
    //     return true; // 根据业务控制是否显示
    //   },
    //   width: 150,
    // },
    // {
    //   title: '开始日期',
    //   key: 'beginTime',
    //   width: 160,
    // },
    // {
    //   title: '结束日期',
    //   key: 'endTime',
    //   width: 160,
    // },
    {
        title: '创建时间',
        key: 'created_time',
        width: 200,
        align: 'center',
        render(row) {
            return h(NTime, {
                time: new Date(row.created_time),
                format: 'yyyy/MM/dd HH:mm:ss'
            });
        }
    },
];
//# sourceMappingURL=columns.js.map