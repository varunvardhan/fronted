import { useNavigate } from 'react-router-dom';
import { removeUserData } from '../Helper/LocalStorageHelper';

export const useAuth = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeUserData();
    navigate("/");
  };

  return {
    handleLogout
  };
}; 