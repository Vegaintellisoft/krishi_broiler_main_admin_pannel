import { useState } from "react"
import {
  MdLockOutline,
  MdOutlineCategory,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md"
import { FaRegUser } from "react-icons/fa6"
import { useAuth } from "../auth/AuthContext"

const Login = () => {
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [category, setCategory] = useState("Wagon")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(userName, password, category)
    } catch (error) {
      console.log("Login Error: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=" flex items-center justify-center bg-[#FFF4EA] h-[100vh]">
      <img src="/assets/elipse.svg" className="absolute left-0 top-10" alt="" />
      <img src="/assets/wave.svg" className="absolute w-full bottom-0" alt="" />

      <div className="w-full max-w-xl mx-4 flex justify-center items-center  backdrop-blur-sm px-10 py-10 bg-[#C1C1C136] rounded-[40px]">
        <div className="w-[90%]">
          <div className="space-y-1 flex flex-col items-center">
            <img
              src="/assets/krishi.png"
              className="object-contain mb-4 h-20"
              alt="visteon logo"
            />
            <h2 className="text-2xl font-bold font-poppins tracking-tight my-3">
              WELCOME BACK!
            </h2>
            <p className="text-[#525252] font-poppins text-sm">
              Lets sign in you
            </p>
          </div>
          <div className="py-6">
            <form
              className="space-y-4 font-poppins text-[#1C1C1C] text-sm"
              onSubmit={handleSubmit}
            >
              {/* ----- New Select Field Added ----- */}
              <div className="relative">
                <MdOutlineCategory
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 "
                  size={17}
                />
                <select
                  className="pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 py-3 bg-[#FFFFFFCC] border-none h-12 w-full text-black text-xs appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled className="text-black">
                    Select Category
                  </option>
                  <option value="Wagon">Wagon</option>
                  <option value="Broiler">Broiler</option>
                  <option value="Breeder">Breeder</option>
                </select>
                <MdOutlineKeyboardArrowDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 "
                  size={20}
                />
              </div>

              <div className="relative">
                <FaRegUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 "
                  size={16}
                />
                <input
                  type="text"
                  placeholder="User Name"
                  className="pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 py-3 border-none bg-[#FFFFFFCC] h-12 w-full placeholder:text-black placeholder:text-xs"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <MdLockOutline
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 "
                  size={17}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="pl-10 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#FFFFFFCC] border-none h-12 w-full placeholder:text-black placeholder:text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>


              {/* ---------------------------------- */}

              <br />

              <button
                type="submit"
                className="w-full flex justify-center gap-5 font-poppins font-semibold bg-[#F5AB00] hover:bg-[#E88A1B] text-white text-center rounded-xl py-3 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Login...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login