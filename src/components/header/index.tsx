"use client";

import {
    OrganizationSwitcher,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import React from "react";

const Header = () => {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Authenticated>
                <OrganizationSwitcher />
                <UserButton />
            </Authenticated>
            <Unauthenticated>
                <SignInButton />
                <SignUpButton>
                    <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                        Sign Up
                    </button>
                </SignUpButton>
            </Unauthenticated>
        </header>
    );
};

export default Header;
