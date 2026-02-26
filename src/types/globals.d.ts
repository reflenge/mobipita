import type { AppRole } from "@/lib/roles";

export {};

declare global {
    interface CustomJwtSessionClaims {
        metadata?: {
            role?: AppRole;
        };
    }
}
