import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../store/authSlice';
import { useEffect } from 'react';
import { fetchCartItems } from '../../../store/cartSlice';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const { items = [] } = useSelector((state) => state.cart);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: user } = useSelector((state) => state.auth);

    const isLoggedIn = Boolean(user) && localStorage.getItem('token');

    useEffect(() => {
        dispatch(fetchCartItems());
    }, [dispatch]);

    return (
        <Disclosure as="nav" className="dark:bg-orange-900">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            {/* Mobile menu button */}
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block size-6" />
                                    ) : (
                                        <Bars3Icon className="block size-6" />
                                    )}
                                </Disclosure.Button>
                            </div>

                            {/* Main Navbar Content */}
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex shrink-0 items-center">
                                    <img
                                        src="src/assets/digitalManduLogo.png"
                                        alt="mandu logo"
                                        width="80"
                                        height="80"
                                        onClick={() => navigate('/')}
                                        className="cursor-pointer"
                                    />
                                </div>

                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        
                                        {/* <button onClick={() => navigate('/wishlist')} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                                            Wishlist
                                        </button> */}
                                        {!isLoggedIn ? (
                                            <>
                                                <button onClick={() => navigate('/register')} className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                                                    Signup
                                                </button>
                                                <button onClick={() => navigate('/login')} className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                                                    Login
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    dispatch(logout());
                                                    localStorage.removeItem('token');
                                                    navigate('/login');
                                                }}
                                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                            >
                                                Logout
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cart Button */}
                            <button onClick={() => navigate('/cart')} className="mr-6 rounded-full bg-black transition md:px-4 text-white cursor-pointer hover:text-yellow-400">
                                <span>Cart <sup>{items?.length || 0}</sup></span>
                            </button>

                            {/* User Profile Dropdown */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                <Menu as="div" className="relative ml-3">
                                    <Menu.Button className="relative flex rounded-full pr-2 pl-2 cursor-pointer bg-black text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
                                        <span className="sr-only">Open user menu</span>
                                        <button onClick={() => navigate('/myprofile')} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                                            Profile
                                        </button>   
                                    </Menu.Button>
                                </Menu>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
}
