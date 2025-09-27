import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-white leading-tight">
          4<span className="text-white">0</span>4
        </h1>
        <p className="mb-4 text-lg sm:text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700 text-sm sm:text-base">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
