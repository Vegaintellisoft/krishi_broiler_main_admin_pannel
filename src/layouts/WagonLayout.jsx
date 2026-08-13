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
import Report from "../pages/Report";

// Your WagonLayout component
const WagonLayout = () => {
    const { user, getPermissions } = useAuth();
    const { adminPage } = getPermissions();

    return (
        <div className='relative'>
            <Header />
            <div className="flex">
                <Sidebar />
                <div className='h-[86vh] flex-1 overflow-y-scroll'>
                    <Routes>
                        <Route path='/' element={<DashBoard />} />
                        <Route path='/MaterialMaster' element={<MaterialMaster />} />
                        <Route path='/supplierMaster' element={<SupplierMaster />} />
                        <Route path='/sourceMaster' element={<SourceMaster />} />
                        <Route path='/ShippingMaster' element={<ShippingMaster />} />
                        <Route path='/unitMaster' element={<UnitMaster />} />
                        <Route path='/POMaster' element={<POMaster />} />
                        <Route path='/userMaster' element={<UserMaster />} />
                        <Route path='/dc' element={<DC />} />

                        {(adminPage.show) && (
                            <Route path='/admin'>
                                {adminPage.showModerators && (
                                    <Route path='moderators' element={<Moderator />} />
                                )}
                                {adminPage.showModerators && (
                                    <Route path='roles' element={<Roles />} />
                                )}
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