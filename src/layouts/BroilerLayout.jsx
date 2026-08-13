import { Routes, Route } from "react-router-dom"
import Header from "../components/Layouts/Header";
import BroilerSidebar from "../components/Layouts/BroilerSidebar";
import { useAuth } from "../auth/AuthContext";
import Moderator from "../pages/Admin/Moderators";
import Roles from "../pages/Admin/Roles";

import BroilerUsers from "../pages/Broiler/BroilerUsers";
import FarmActivities from "../pages/Broiler/DataEntry/FarmActivity/FarmActivities";
import ShedReady from "../pages/Broiler/DataEntry/ShedReady";
import IssuedMedicine from "../pages/Broiler/DataEntry/IssuedMedicine";
import FeedTransfer from "../pages/Broiler/Feeds/FeedTransfer";
import FeedReturn from "../pages/Broiler/Feeds/FeedReturn";
import FeedRequest from "../pages/Broiler/Feeds/FeedRequest";
import FeedApproval from "../pages/Broiler/Feeds/FeedApproval";
import BroilerSupply from "../pages/Broiler/Feeds/BroilerSupply/BroilerSupply";
import BroilerMaster from "../pages/Broiler/masters/BroilerMaster";
import FarmerLocationMaster from "../pages/Broiler/masters/FarmerLocationMaster";
import LineFarmMaster from "../pages/Broiler/masters/LineFarmMaster";
import FarmerLineMaster from "../pages/Broiler/masters/FarmerLineMaster";
import TentativeRate from "../pages/Broiler/masters/TentativeRate";
import SapPostDateConfig from "../pages/Broiler/masters/SapPostDateConfig";
import BroilerDashBoard from "../pages/Broiler/BroilerDashBoard";

import { BroilerMasterEndpoints } from "../utils/store";

const BroilerLayout = () => {
  const { user, getPermissions } = useAuth();
  const { adminPage, broilerUsers, allMasters } = getPermissions();

  return (
    <div className='relative'>
      <Header />
      <div className="flex">
        <BroilerSidebar />
        <div className='h-[86vh] flex-1 overflow-y-scroll'>
          <Routes>

            <Route path='/' element={<BroilerDashBoard />} />

            {/* Broiler Master */}
            {allMasters?.show &&
              BroilerMasterEndpoints.map((data, idx) => (
                <Route key={idx} path={data.replaceAll("_", "-")}
                  element={<BroilerMaster endpoint={data} />} />
              ))
            }

            {allMasters?.show && (
              <Route path="/farmer-location-master" element={<FarmerLocationMaster />} />
            )}

            {allMasters?.show && (
              <Route path="/line-farm-master" element={<LineFarmMaster />} />
            )}

            {allMasters?.show && (
              <Route path="/farmer-line-master" element={<FarmerLineMaster />} />
            )}

            {allMasters?.show && (
              <Route path="/tentative-rate" element={<TentativeRate />} />
            )}

            {allMasters?.show && (
              <Route path="/sap-post-date-config" element={<SapPostDateConfig />} />
            )}


            <Route path='/broilerUser' element={<BroilerUsers />} />

            {/* Data Entry */}
            <Route path='/FarmActivity' element={<FarmActivities />} />
            <Route path='/ShedReadiness' element={<ShedReady />} />
            <Route path='/ChickReceipt' element={<div className="p-6 font-poppins"><h1 className="text-xl font-bold">Chick Receipt</h1><p className="text-gray-500 mt-2">Coming soon...</p></div>} />
            <Route path='/IssueMedicine' element={<IssuedMedicine />} />

            {/* Feed */}
            <Route path='/FeedTransfer' element={<FeedTransfer />} />
            <Route path='/FeedReturn' element={<FeedReturn />} />
            <Route path='/FeedRequest' element={<FeedRequest />} />
            <Route path='/FeedApproval' element={<FeedApproval />} />
            <Route path='/BroilerSupply' element={<BroilerSupply />} />





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

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default BroilerLayout;