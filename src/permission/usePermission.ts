import {useUser} from '@/store/modules/user.ts';
import {isArray, isString} from "@/utils/is";

/** 权限判断 */
export function usePermission() {
    const auth = useUser();

    function hasPermission(permission: Auth.RoleType | Auth.RoleType[]){
        const userRole = auth.getUserRole

        let has = userRole === 'admin';
        if (!has) {
            if (isArray(permission)) {
                has = (permission as Auth.RoleType[]).includes(userRole as Auth.RoleType);
            }
            if (isString(permission)) {
                has = (permission as Auth.RoleType) === userRole;
            }
        }
        return has;
    }

    return {
        hasPermission
    };
}
