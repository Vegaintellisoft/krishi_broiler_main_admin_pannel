import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"
import { useAuth } from "../auth/AuthContext";
import Header from "../components/Layouts/Header";
import Sidebar from "../components/Layouts/Sidebar";
import DashBoard from "../pages/DashBoard";
import MaterialMaster from "../pages/MaterialMaster";
import SupplierMaster from "../pages/SupplierMaster";
import SourceMaster from "../pages/SourceMaster";
import ShippingMaster from "../pages/ShippingMaster";
import UnitMaster from "../pages/UnitMaster";
import POMaster from "../pages/PoMaster";
import UserMaster from "../pages/UserMaster";
import DC from "../pages/DC";
import Moderator from "../pages/Admin/Moderators";
import Roles from "../pages/Admin/Roles";
import ActivityMonitor from "../pages/Admin/ActivityMonitor";
import Report from "../pages/Report";
import ChangePassword from "../pages/ChangePassword";

const WagonLayout = () => {
    const { user, getPermissions, refreshPermissions } = useAuth();

    useEffect(() => {
        refreshPermissions();
    }, []);

    const permissions = getPermissions() || {};
    const {
        adminPage,
        unitMaster,
        userMaster,
        sourceMaster,
        purchaseOrder,
        shippingMaster,
        materialMaster,
        deliveryChallan,
        supplierMaster
    } = permissions;

    return (
        <div className='relative'>
            <Header />
            <div className="flex">
                <Sidebar />
                <div className='h-[86vh] flex-1 overflow-y-scroll'>
                    <Routes>
                        <Route path='/' element={<DashBoard />} />
                        {materialMaster?.show && <Route path='/MaterialMaster' element={<MaterialMaster />} />}
                        {supplierMaster?.show && <Route path='/supplierMaster' element={<SupplierMaster />} />}
                        {sourceMaster?.show && <Route path='/sourceMaster' element={<SourceMaster />} />}
                        {shippingMaster?.show && <Route path='/ShippingMaster' element={<ShippingMaster />} />}
                        {unitMaster?.show && <Route path='/unitMaster' element={<UnitMaster />} />}
                        {purchaseOrder?.show && <Route path='/POMaster' element={<POMaster />} />}
                        {userMaster?.show && <Route path='/userMaster' element={<UserMaster />} />}
                        {deliveryChallan?.show && <Route path='/dc' element={<DC />} />}
                        <Route path='/change-password' element={<ChangePassword />} />

                        {adminPage?.show && (
                            <Route path='/admin'>
                                {adminPage.showModerators && (
                                    <Route path='moderators' element={<Moderator />} />
                                )}
                                {adminPage.showRoles && (
                                    <Route path='roles' element={<Roles />} />
                                )}
                                <Route path='activity-monitor' element={<ActivityMonitor />} />
                            </Route>
                        )}

                        <Route path='/reports' element={<Report />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default WagonLayout;