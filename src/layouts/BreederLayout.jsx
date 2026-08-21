import { Routes, Route } from "react-router-dom"
import Header from "../components/Layouts/Header";
import { useAuth } from "../auth/AuthContext";
import BreederSidebar from "../components/Layouts/BreederSidebar";
import UnitNameList from "../pages/Breeder/Masters/UnitNameList";
import UnitName from "../pages/Breeder/Masters/UnitName";
import BioSecurityList from "../pages/Breeder/Masters/BioSecurityList";
import BioSecurity from "../pages/Breeder/Masters/BioSecurity";
import BioSecurityDataList from "../pages/Breeder/Masters/BioSecurityDataList";
import BioSecurityData from "../pages/Breeder/Masters/BioSecurityData";
import FlockMasterList from "../pages/Breeder/Masters/FlockMasterList";
import FlockMaster from "../pages/Breeder/Masters/FlockMaster";
import PlantMasterList from "../pages/Breeder/Masters/PlantMasterList";
import PlantMaster from "../pages/Breeder/Masters/PlantMaster";
import FeedList from "../pages/Breeder/Feeding/FeedList";
import Feed from "../pages/Breeder/Feeding/Feed";
import MedicineList from "../pages/Breeder/Feeding/MedicineList";
import Medicine from "../pages/Breeder/Feeding/Medicine";
import EggCollectionList from "../pages/Breeder/EggCollection/EggCollectionList";
import EggCollection from "../pages/Breeder/EggCollection/EggCollection";
import Mortality from "../pages/Breeder/Mortality/Mortality";
import BirdWeighingList from "../pages/Breeder/BirdWeighing/BirdWeighingList";
import BirdWeighing from "../pages/Breeder/BirdWeighing/BirdWeighing";
import ChangePassword from "../pages/ChangePassword";

const BreederLayout = () => {
  const { user } = useAuth();

  return (
    <div className='relative'>
      <Header />
      <div className="flex">
        <BreederSidebar />
        <div className='h-[86vh] flex-1 overflow-y-scroll'>
          <Routes>

            <Route path='/' element={<div>Breeder Dashboard</div>} />
            <Route path='/change-password' element={<ChangePassword />} />
            <Route path='/unitname' element={<UnitNameList />} />
            <Route path='/unitname/add' element={<UnitName />} />
            <Route path='/biosecurity' element={<BioSecurityList />} />
            <Route path='/biosecurity/add' element={<BioSecurity />} />
            <Route path='/biosecuritydata' element={<BioSecurityDataList />} />
            <Route path='/biosecuritydata/add' element={<BioSecurityData />} />
            <Route path='/flockmaster' element={<FlockMasterList />} />
            <Route path='/flockmaster/add' element={<FlockMaster />} />
            <Route path='/plantmaster' element={<PlantMasterList />} />
            <Route path='/plantmaster/add' element={<PlantMaster />} />

            {/* Feed */}
            <Route path='/feeding' element={<FeedList />} />
            <Route path='/feeding/add' element={<Feed />} />
            <Route path='/medicine' element={<MedicineList />} />
            <Route path='/medicine/add' element={<Medicine />} />


            <Route path='/eggcollection' element={<EggCollectionList />} />
            <Route path='/eggcollection/add' element={<EggCollection />} />
            <Route path='/mortality' element={<Mortality />} />
            <Route path='/birdweighing' element={<BirdWeighingList />} />
            <Route path='/birdweighing/add' element={<BirdWeighing />} />



          </Routes>
        </div>
      </div>
    </div>
  );
};

export default BreederLayout;
