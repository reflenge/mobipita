import { OrganizationSwitcher } from "@clerk/nextjs";

export default async function OrganizationPage() {
    return (
        <div className="container mx-auto px-6 py-10">
            <div>admin top page</div>
            <section>
                <div>組織の管理は このボタンから</div>
                <OrganizationSwitcher defaultOpen={true} hidePersonal={true} />
            </section>
        </div>
    );
}
