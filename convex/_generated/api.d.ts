/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookings from "../bookings.js";
import type * as files from "../files.js";
import type * as lib_clerkAuth from "../lib/clerkAuth.js";
import type * as locations from "../locations.js";
import type * as services from "../services.js";
import type * as slots from "../slots.js";
import type * as staffTags from "../staffTags.js";
import type * as tenantMemberAssignments from "../tenantMemberAssignments.js";
import type * as tenants from "../tenants.js";
import type * as userProfiles from "../userProfiles.js";
import type * as values from "../values.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  files: typeof files;
  "lib/clerkAuth": typeof lib_clerkAuth;
  locations: typeof locations;
  services: typeof services;
  slots: typeof slots;
  staffTags: typeof staffTags;
  tenantMemberAssignments: typeof tenantMemberAssignments;
  tenants: typeof tenants;
  userProfiles: typeof userProfiles;
  values: typeof values;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
