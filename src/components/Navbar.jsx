import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase'; // Ensure you have your Supabase client setup

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data?.user);
        setUserType(data?.user?.user_metadata?.userType);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    navigate('/get-started');
  };

  if (loading) {
    return <div className='text-center'>Loading...</div>;
  }

  if (user && !userType) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">User type not set. Please contact support or set your user type.</p>
        <button
          onClick={handleLogout}
          className="mt-4 p-2 px-4 text-white bg-brightRed rounded-full hover:bg-brightRedLight"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <nav className="relative container w-full justify-self-center">
      <div className="flex items-center justify-between">
        <div className="pt-2">
          <p className='text-6xl text-[#3F7D58] font-extrabold'>TAB TIMER</p>
        </div>
        <div className="hidden space-x-6 md:flex">
          <Link to="/" className="hover:text-darkGrayishBlue">Home</Link>
          {user && userType === 'User' && (
            <>
              <Link to="/reminder" className="hover:text-darkGrayishBlue">Reminder</Link>
              <Link to="/report" className="hover:text-darkGrayishBlue">Reports</Link>
              <Link to="/specialist" className="hover:text-darkGrayishBlue">Specialists</Link>
            </>
          )}
          {user && userType === 'Doctor' && (
            <Link to="/doctor-dashboard" state={{ doctorId: user?.id }} className="hover:text-darkGrayishBlue">
              Doctor Dashboard
            </Link>
          )}
          <Link to="/about-us" className="hover:text-darkGrayishBlue">About Us</Link>
        </div>
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="hidden p-3 px-6 pt-2 text-white bg-[#3F7D58] rounded-full baseline md:block"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/get-started"
              className="hidden p-3 px-6 pt-2 text-white bg-[#3F7D58] rounded-full baseline md:block"
            >
              Get Started
            </Link>
          )}
        </div>
        <button
          className={toggleMenu ? 'open block hamburger md:hidden focus:outline-none' : 'block hamburger md:hidden focus:outline-none'}
          onClick={() => setToggleMenu(!toggleMenu)}
        >
          <span className="hamburger-top"></span>
          <span className="hamburger-middle"></span>
          <span className="hamburger-bottom"></span>
        </button>
      </div>
      <div className="md:hidden">
        <div
          className={toggleMenu ? 'absolute flex flex-col items-center self-end py-8 mt-10 space-y-6 font-bold bg-white sm:w-auto sm:self-center left-6 right-6 drop-shadow-md' : 'absolute flex-col items-center hidden self-end py-8 mt-10 space-y-6 font-bold bg-white sm:w-auto sm-self-center left-6 right-6 drop-shadow-md'}
        >
          <Link to="/">Home</Link>
          {user && userType === 'User' && (
            <>
              <Link to="/reminder">Reminder</Link>
              <Link to="/report">Reports</Link>
              <Link to="/specialist">Specialists</Link>
            </>
          )}
          {user && userType === 'Doctor' && (
            <Link to="/doctor-dashboard" state={{ doctorId: user?.id }}>
              Doctor Dashboard
            </Link>
          )}
          <Link to="/about-us">About Us</Link>
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/get-started">Get Started</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
