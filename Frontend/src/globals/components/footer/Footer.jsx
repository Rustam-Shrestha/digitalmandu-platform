import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-orange-900">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <span className="text-white text-lg font-bold">
                            <img src="/src/assets/digitalManduLogo.png" alt="Mandu logo" width="80" height="80" />
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Resources</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="https://flowbite.com/" className="hover:underline">Flowbite</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://tailwindcss.com/" className="hover:underline">Tailwind CSS</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://react.dev/" className="hover:underline">React</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://nodejs.org/en/docs/" className="hover:underline">Node.js</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://expressjs.com/" className="hover:underline">Express</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://www.npmjs.com/package/multer" className="hover:underline">Multer</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://www.mongodb.com/docs/" className="hover:underline">MongoDB</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://redux-toolkit.js.org/" className="hover:underline">Redux Toolkit</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://docs.khalti.com/getting-started/" className="hover:underline">Khalti Sandbox</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Follow Rustam</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="https://www.instagram.com/rustamshrestha4" className="hover:underline" aria-label="Instagram">Instagram</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://www.pinterest.com/rustamshrestha4" className="hover:underline" aria-label="Pinterest">Pinterest</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://www.snapchat.com/add/rustamshrestha4" className="hover:underline" aria-label="Snapchat">Snapchat</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://www.linkedin.com/in/rustamshrestha4" className="hover:underline" aria-label="LinkedIn">LinkedIn</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://twitter.com/44rustam" className="hover:underline" aria-label="Twitter">Twitter</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://github.com/rustam-shrestha" className="hover:underline" aria-label="GitHub">GitHub</a>
                                </li>
                                <li className="mb-4">
                                    <a href="https://medium.com/@shrestharama65" className="hover:underline" aria-label="Medium">Medium</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2>
                            <ul className="text-gray-500 dark:text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="#" className="hover:underline">Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline">Terms & Conditions</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="https://flowbite.com/" className="hover:underline">Digital Mandu</a>. All Rights Reserved.</span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0">
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white" aria-label="Facebook page">
                            Facebook
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5" aria-label="Discord community">
                            Discord
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5" aria-label="Twitter page">
                            Twitter
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5" aria-label="GitHub account">
                            GitHub
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5" aria-label="Dribbble account">
                            Dribbble
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;