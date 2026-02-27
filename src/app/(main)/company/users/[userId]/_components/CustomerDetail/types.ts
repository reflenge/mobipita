import type { ProfileAddress } from "@/lib/profile";
import type { AppRole } from "@/lib/roles";

/** 顧客詳細で表示するユーザー情報（Clerk + プロフィール拡張） */
export type UserInfo = {
    userId: string;
    displayName: string;
    email: string;
    imageUrl: string;
    firstName: string;
    lastName: string;
    gender?: string;
    birthday?: string;
    phone?: string;
    address?: ProfileAddress;
    role?: string;
};

export type CustomerDetailProps = {
    user: UserInfo;
    availableRoles: AppRole[];
    currentUserId: string;
};
