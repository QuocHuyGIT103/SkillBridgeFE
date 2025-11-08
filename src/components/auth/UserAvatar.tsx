import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/auth.store";
import { Link } from "react-router-dom";

const UserAvatar = () => {
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default avatar if user doesn't have one
  const defaultAvatar =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user?.full_name || "User");
  const avatarUrl = user?.avatar_url || defaultAvatar;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center cursor-pointer focus:outline-none"
      >
        <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-teal-600 hover:border-teal-700 transition-all">
          <img
            src={avatarUrl}
            alt={user?.full_name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.full_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600"
            onClick={() => setIsDropdownOpen(false)}
          >
            Hồ sơ cá nhân
          </Link>

          <Link
            to="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600"
            onClick={() => setIsDropdownOpen(false)}
          >
            Bảng điều khiển
          </Link>

          <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600"
            onClick={() => setIsDropdownOpen(false)}
          >
            Cài đặt
          </Link>

          <div className="border-t border-gray-100 my-1"></div>

          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
