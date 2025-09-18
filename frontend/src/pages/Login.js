import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, clearError } from '../redux/slices/authSlice';
import { validateEmail, validatePassword } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isLoggedIn, user } = useSelector((state) => state.auth);

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Redirect if already logged in
    if (isLoggedIn && user) {
      const redirectPath = user.role === 'teacher' ? '/teacher' : '/student';
      navigate(redirectPath);
    }
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation (only for registration)
    if (isRegistering) {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation (only for registration)
    if (isRegistering) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Role validation
      if (!formData.role) {
        errors.role = 'Please select a role';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let result;
      if (isRegistering) {
        // Registration
        const { confirmPassword, ...registrationData } = formData;
        result = await dispatch(registerUser(registrationData));
        if (registerUser.fulfilled.match(result)) {
          const redirectPath = result.payload.user.role === 'teacher' ? '/teacher' : '/student';
          navigate(redirectPath);
        }
      } else {
        // Login
        const loginData = {
          email: formData.email,
          password: formData.password
        };
        result = await dispatch(loginUser(loginData));
        if (loginUser.fulfilled.match(result)) {
          const redirectPath = result.payload.user.role === 'teacher' ? '/teacher' : '/student';
          navigate(redirectPath);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleErrorClose = () => {
    dispatch(clearError());
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    });
    setFormErrors({});
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">
            Assignment Portal
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {isRegistering ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-10 shadow-lg rounded-lg">
          <ErrorMessage message={error} onClose={handleErrorClose} />

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name Field (Registration only) */}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${formErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${formErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Role Field (Registration only) */}
            {isRegistering && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`input-field ${formErrors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  disabled={loading}
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${formErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your password"
                disabled={loading}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Registration only) */}
            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${formErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    {isRegistering ? 'Creating Account...' : 'Signing in...'}
                  </>
                ) : (
                  isRegistering ? 'Create Account' : 'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Toggle between Login and Registration */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
                disabled={loading}
              >
                {isRegistering ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>

          {/* Demo Credentials (Login only) */}
          {!isRegistering && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div className="break-all">
                  <strong>Teacher:</strong> teacher@example.com / password123
                </div>
                <div className="break-all">
                  <strong>Student:</strong> student@example.com / password123
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
