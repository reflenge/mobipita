"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
    type AppRole,
    getRoleFromClaims,
    hasMinRole,
    ROLE_LEVEL,
} from "@/lib/roles";

const VALID_ROLES = new Set<string>(Object.keys(ROLE_LEVEL));

export async function updateUserRole(targetUserId: string, newRole: AppRole) {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("認証されていません");

    const operatorRole = getRoleFromClaims(sessionClaims);

    if (!hasMinRole(operatorRole, "company")) {
        throw new Error("管理者権限が必要です");
    }

    if (!VALID_ROLES.has(newRole)) {
        throw new Error("無効なロールです");
    }

    if (!hasMinRole(operatorRole, newRole)) {
        throw new Error("自分のロール以上には昇格できません");
    }

    if (targetUserId === userId) {
        throw new Error("自分自身のロールは変更できません");
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(targetUserId);
    const currentMeta = (targetUser.publicMetadata ?? {}) as Record<
        string,
        unknown
    >;

    await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
            ...currentMeta,
            role: newRole,
        },
    });

    return { success: true };
}
