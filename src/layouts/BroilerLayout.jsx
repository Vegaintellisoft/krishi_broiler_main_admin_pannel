import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Layouts/Header";
import BroilerSidebar from "../components/Layouts/BroilerSidebar";
import { useAuth } from "../auth/AuthContext";
import Moderator from "../pages/Admin/Moderators";
import Roles from "../pages/Admin/Roles";
import ActivityMonitor from "../pages/Admin/ActivityMonitor";

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
import ChangePassword from "../pages/ChangePassword";

import { BroilerMasterEndpoints } from "../utils/store";

const BroilerLayout = () => {
  const { user, getPermissions, refreshPermissions } = useAuth();
  const permissions = getPermissions() || {};

  useEffect(() => {
    refreshPermissions();
  }, []);

  const {
    adminPage,
    broilerUsers,
    allMasters,
    farmActivity,
    shedReadiness,
    chickReceipt,
    medicineIssued,
    feedTransfer,
    feedReturn,
    feedApproval,
    feedRequest,
    broilerSupply
  } = permissions;

  return (
    <div className='relative'>
      <Header />
      <div className="flex">
        <BroilerSidebar />
        <div className='h-[86vh] flex-1 overflow-y-scroll'>
          <Routes>

            <Route path='/' element={<BroilerDashBoard />} />
            <Route path='/change-password' element={<ChangePassword />} />

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


            {broilerUsers?.show && <Route path='/broilerUser' element={<BroilerUsers />} />}

            {/* Data Entry */}
            {farmActivity?.all && <Route path='/FarmActivity' element={<FarmActivities />} />}
            {shedReadiness?.all && <Route path='/ShedReadiness' element={<ShedReady />} />}
            {chickReceipt?.all && <Route path='/ChickReceipt' element={<div className="p-6 font-poppins"><h1 className="text-xl font-bold">Chick Receipt</h1><p className="text-gray-500 mt-2">Coming soon...</p></div>} />}
            {medicineIssued?.all && <Route path='/IssueMedicine' element={<IssuedMedicine />} />}

            {/* Feed */}
            {feedTransfer?.all && <Route path='/FeedTransfer' element={<FeedTransfer />} />}
            {feedReturn?.all && <Route path='/FeedReturn' element={<FeedReturn />} />}
            {feedRequest?.all && <Route path='/FeedRequest' element={<FeedRequest />} />}
            {feedApproval?.all && <Route path='/FeedApproval' element={<FeedApproval />} />}
            {broilerSupply?.all && <Route path='/BroilerSupply' element={<BroilerSupply />} />}

            {adminPage?.show && (
              <Route path='/admin'>
                {adminPage?.showModerators && (
                  <Route path='moderators' element={<Moderator />} />
                )}
                {adminPage?.showRoles && (
                  <Route path='roles' element={<Roles />} />
                )}
                <Route path='activity-monitor' element={<ActivityMonitor />} />
              </Route>
            )}

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default BroilerLayout;